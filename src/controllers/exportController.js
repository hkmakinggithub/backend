const excelJS = require('exceljs');
const { query } = require('../config/database'); 

// ==========================================
// 1. SINGLE EXPORT: BUSINESSES ONLY
// ==========================================
const exportBusinessesToExcel = async (req, res) => {
  try {
    const sql = 'SELECT id, title, category, address, phone, status FROM businesses ORDER BY id DESC';
    const result = await query(sql);
    
    // Auto-detect Postgres vs MySQL
    let rows = result.rows ? result.rows : (Array.isArray(result) ? result : result[0]);

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Businesses');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Business Name', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    if (rows && rows.length > 0) {
      worksheet.addRows(rows);
      worksheet.getRow(1).font = { bold: true };
    } else {
      worksheet.addRow({ id: 'No data found' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=MaruGaam_Businesses.xlsx');
    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('Excel Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Excel file' });
  }
};


// ==========================================
// 2. MASTER EXPORT: FULL DATABASE (YOUR QUERIES)
// ==========================================
const exportFullDatabaseToExcel = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();
    workbook.creator = 'Maru Gaam Admin';

    // 🟢 The Smart Sheet Builder
    const addSheet = async (sheetName, sqlQuery) => {
      try {
        const result = await query(sqlQuery);
        const worksheet = workbook.addWorksheet(sheetName);

        // Smart detection to grab the actual rows, regardless of database type
        let rows = [];
        if (result && result.rows) {
          rows = result.rows; // PostgreSQL
        } else if (Array.isArray(result) && !Array.isArray(result[0])) {
          rows = result; // MySQL
        } else if (Array.isArray(result) && Array.isArray(result[0])) {
          rows = result[0]; // MySQL2 Promise wrapper
        }

        if (rows && rows.length > 0) {
          // Auto-generate columns from the SQL data
          worksheet.columns = Object.keys(rows[0]).map((key) => ({
            header: key.toUpperCase().replace(/_/g, ' '), 
            key: key,
            width: 25
          }));
          worksheet.addRows(rows);
          worksheet.getRow(1).font = { bold: true };
        } else {
          worksheet.addRow(['No data found in this table yet. Please add data in the app!']);
        }
      } catch (err) {
        console.error(`Error generating sheet ${sheetName}:`, err);
        const errorSheet = workbook.addWorksheet(`${sheetName} (Error)`);
        errorSheet.addRow([`Could not fetch data: ${err.message}`]);
      }
    };

    // ==========================================
    // RUNNING YOUR EXACT SQL QUERIES
    // ==========================================

    // 1. Table Counts
    await addSheet('Row Counts', `
      SELECT 'advertisements' AS table_name, COUNT(*) AS row_count FROM advertisements UNION ALL
      SELECT 'business_analytics', COUNT(*) FROM business_analytics UNION ALL
      SELECT 'business_contacts', COUNT(*) FROM business_contacts UNION ALL
      SELECT 'business_daily_stats', COUNT(*) FROM business_daily_stats UNION ALL
      SELECT 'businesses', COUNT(*) FROM businesses UNION ALL
      SELECT 'categories', COUNT(*) FROM categories UNION ALL
      SELECT 'cities', COUNT(*) FROM cities UNION ALL
      SELECT 'favorites', COUNT(*) FROM favorites UNION ALL
      SELECT 'local_news', COUNT(*) FROM local_news UNION ALL
      SELECT 'notifications', COUNT(*) FROM notifications UNION ALL
      SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens UNION ALL
      SELECT 'push_tokens', COUNT(*) FROM push_tokens UNION ALL
      SELECT 'reviews', COUNT(*) FROM reviews UNION ALL
      SELECT 'sessions', COUNT(*) FROM sessions UNION ALL
      SELECT 'users', COUNT(*) FROM users
      ORDER BY table_name;
    `);

    // 2. Businesses
    await addSheet('Businesses', `
      SELECT b.*, c.name AS category_name, ct.name AS city_name, u.name AS submitted_by_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      LEFT JOIN users u ON b.submitted_by = u.id
      ORDER BY b.id;
    `);

    // 3. Favorites
    await addSheet('Favorites', `
      SELECT f.*, u.name AS user_name, b.title AS business_title
      FROM favorites f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN businesses b ON f.business_id = b.id
      ORDER BY f.id;
    `);

    // 4. Reviews
    await addSheet('Reviews', `
      SELECT r.*, u.name AS user_name, b.title AS business_title
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN businesses b ON r.business_id = b.id
      ORDER BY r.id;
    `);

    // 5. Users (Updated with your exact columns)
    await addSheet('Users', `
      SELECT id, name, phone, email, city, pincode, role, is_verified, profile_image, created_at, updated_at
      FROM users 
      ORDER BY id;
    `);

    // 6. DB Schema
    await addSheet('Schema', `
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    // 7. Foreign Keys
    await addSheet('Foreign Keys', `
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `);

    // Send the final file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=MaruGaam_Master_Report.xlsx');
    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('Master Excel Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Master Excel file' });
  }
};

module.exports = {
  exportBusinessesToExcel,
  exportFullDatabaseToExcel
};