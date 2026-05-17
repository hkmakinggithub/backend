const ExcelJS = require('exceljs');
const { query } = require('../config/database'); // Make sure this path is correct

const exportDatabaseToExcel = async (req, res) => {
  try {
    // 1. Create a new Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Maru Gaam Admin';
    workbook.created = new Date();

    // ==========================================
    // 📑 TAB 1: LOCAL NEWS
    // ==========================================
    const newsSheet = workbook.addWorksheet('Local News');
    
    // Set Excel Headers
    newsSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'City ID', key: 'city_id', width: 15 },
      { header: 'Category', key: 'news_type', width: 20 },
      { header: 'Status (Active)', key: 'is_active', width: 15 },
      { header: 'Created Date', key: 'created_at', width: 20 },
    ];

    // Make the header row bold and blue!
    newsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    newsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

    // Fetch data from database
    const newsData = await query('SELECT id, city_id, news_type, is_active, created_at FROM local_news ORDER BY created_at DESC');
    newsSheet.addRows(newsData.rows);

    // ==========================================
    // 📑 TAB 2: USERS (Example)
    // ==========================================
    const userSheet = workbook.addWorksheet('Registered Users');
    userSheet.columns = [
      { header: 'User ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
    ];
    userSheet.getRow(1).font = { bold: true };
    
    // Uncomment and change table name when you have a users table:
    // const userData = await query('SELECT * FROM users');
    // userSheet.addRows(userData.rows);

    // ==========================================
    // 📑 TAB 3: BUSINESSES (Example)
    // ==========================================
    const businessSheet = workbook.addWorksheet('Local Businesses');
    businessSheet.columns = [
      { header: 'Business Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
    ];
    businessSheet.getRow(1).font = { bold: true };


    // 3. Send the Excel file to the browser to download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=MaruGaam_Database_Export.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: 'Failed to generate Excel file' });
  }
};

module.exports = { exportDatabaseToExcel };