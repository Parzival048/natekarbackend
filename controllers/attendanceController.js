const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');

const markAttendance = async (req, res) => {
  try {
    const { supervisorId, date, cleaning, sweeping, mopping } = req.body;

    if (!supervisorId || !date || cleaning === undefined || sweeping === undefined || mopping === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const attendance = new Attendance({
      supervisorId,
      date,
      cleaning,
      sweeping,
      mopping
    });

    await attendance.save();

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    
    // If no date is provided, get today's date
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    
    // Find attendance records for the specified date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
      }
    }).populate('supervisorId', 'name email');

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error in getAttendance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch attendance records',
      details: error.message 
    });
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // If no month/year provided, use current month
    const date = month && year ? new Date(year, month - 1) : new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    }).populate('supervisorId', 'name email');

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error in getMonthlyAttendance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch monthly attendance records',
      details: error.message 
    });
  }
};

const exportAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // If no month/year provided, use current month
    const date = month && year ? new Date(year, month - 1) : new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    }).populate('supervisorId', 'name email');

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Attendance Portal';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Attendance Records', {
      properties: { tabColor: { argb: '6366F1' } }
    });

    // Add title
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Attendance Report - ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Supervisor Name', key: 'supervisorName', width: 25 },
      { header: 'Supervisor Email', key: 'supervisorEmail', width: 30 },
      { header: 'Cleaning', key: 'cleaning', width: 12 },
      { header: 'Sweeping', key: 'sweeping', width: 12 },
      { header: 'Mopping', key: 'mopping', width: 12 },
      { header: 'Total Tasks', key: 'totalTasks', width: 12 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '6366F1' }
    };

    // Add data
    attendanceRecords.forEach(record => {
      const totalTasks = [record.cleaning, record.sweeping, record.mopping]
        .filter(Boolean).length;

      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        supervisorName: record.supervisorId?.name || 'Unknown',
        supervisorEmail: record.supervisorId?.email || 'Unknown',
        cleaning: record.cleaning ? '✓' : '✗',
        sweeping: record.sweeping ? '✓' : '✗',
        mopping: record.mopping ? '✓' : '✗',
        totalTasks
      });
    });

    // Add summary
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell(1).value = 'Total Records:';
    summaryRow.getCell(2).value = attendanceRecords.length;
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error in exportAttendance:', error);
    res.status(500).json({ 
      error: 'Failed to export attendance records',
      details: error.message 
    });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getMonthlyAttendance,
  exportAttendance
};