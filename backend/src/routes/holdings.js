const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const { parseAndValidateCSV } = require('../services/csvService');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  // Tenant ID strictly derived from JWT claims
  const tenantId = req.user.tenantId;

  // Validate CSV
  const validationResult = parseAndValidateCSV(req.file.buffer);

  if (!validationResult.valid) {
    return res.status(400).json({
      error: 'CSV validation failed',
      errors: validationResult.errors
    });
  }

  const rows = validationResult.rows;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing holdings for this tenant (atomic replacement)
    await client.query('DELETE FROM holdings WHERE tenant_id = $1', [tenantId]);

    // Insert new valid holdings
    const insertQuery = `
      INSERT INTO holdings (tenant_id, holding_date, ticker, asset_class, quantity, price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const row of rows) {
      await client.query(insertQuery, [
        tenantId,
        row.date,
        row.ticker,
        row.assetClass,
        row.quantity,
        row.price
      ]);
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Holdings uploaded successfully',
      rowsImported: rows.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error importing holdings CSV:', err);
    return res.status(500).json({
      error: 'Failed to import holdings into database',
      message: err.message
    });
  } finally {
    client.release();
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  const tenantId = req.user.tenantId;
  try {
    await pool.query('DELETE FROM holdings WHERE tenant_id = $1', [tenantId]);
    return res.json({ message: 'Holdings portfolio reset successfully' });
  } catch (err) {
    console.error('Error resetting holdings:', err);
    return res.status(500).json({ error: 'Failed to reset portfolio holdings' });
  }
});

module.exports = router;
