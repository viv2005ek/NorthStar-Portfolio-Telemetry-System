const { parse } = require('csv-parse/sync');

function parseAndValidateCSV(fileBuffer) {
  const errors = [];

  let rawRecords;
  try {
    rawRecords = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    return {
      valid: false,
      errors: [{ row: 1, message: `CSV syntax error: ${err.message}` }],
    };
  }

  if (!rawRecords || rawRecords.length === 0) {
    return {
      valid: false,
      errors: [{ row: 1, message: 'CSV file is empty or missing headers' }],
    };
  }

  // Verify headers
  const sampleRecord = rawRecords[0];
  const keys = Object.keys(sampleRecord).map((k) => k.toLowerCase().trim().replace(/[\s_]+/g, '_'));
  const requiredHeaders = ['date', 'ticker', 'asset_class', 'quantity', 'price'];

  for (const reqHeader of requiredHeaders) {
    if (!keys.includes(reqHeader)) {
      return {
        valid: false,
        errors: [{ row: 1, message: `Missing required column header: '${reqHeader}'` }],
      };
    }
  }

  const validatedRows = [];
  const seenKeys = new Set();

  rawRecords.forEach((record, index) => {
    const rowNumber = index + 2; // Accounting for 1-based index and header row
    const initialErrorCount = errors.length;

    // Extract fields matching case-insensitive headers
    const rawDate = getFieldValue(record, 'date');
    const rawTicker = getFieldValue(record, 'ticker');
    const rawAssetClass = getFieldValue(record, 'asset_class');
    const rawQuantity = getFieldValue(record, 'quantity');
    const rawPrice = getFieldValue(record, 'price');

    // 1. Check missing fields
    if (!rawDate) {
      errors.push({ row: rowNumber, message: 'Missing date' });
    }
    if (!rawTicker) {
      errors.push({ row: rowNumber, message: 'Missing ticker' });
    }
    if (!rawAssetClass) {
      errors.push({ row: rowNumber, message: 'Missing asset_class' });
    }

    // 2. Timezone-safe UTC Date Validation
    let formattedDate = null;
    if (rawDate) {
      const match = rawDate.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
      if (match) {
        const y = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const d = parseInt(match[3], 10);
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        if (
          dateObj.getUTCFullYear() === y &&
          dateObj.getUTCMonth() + 1 === m &&
          dateObj.getUTCDate() === d
        ) {
          formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      } else {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          const y = parsedDate.getUTCFullYear();
          const m = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
          const d = String(parsedDate.getUTCDate()).padStart(2, '0');
          formattedDate = `${y}-${m}-${d}`;
        }
      }

      if (!formattedDate) {
        errors.push({ row: rowNumber, message: `Invalid date format '${rawDate}'` });
      }
    }

    // 3. Validate Quantity
    const quantity = parseFloat(rawQuantity);
    if (isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
      errors.push({ row: rowNumber, message: `Invalid quantity '${rawQuantity}'. Must be a positive number.` });
    }

    // 4. Validate Price
    const price = parseFloat(rawPrice);
    if (isNaN(price) || !isFinite(price) || price < 0) {
      errors.push({ row: rowNumber, message: `Invalid price '${rawPrice}'. Must be a non-negative number.` });
    }

    // 5. Duplicate Check within CSV
    if (formattedDate && rawTicker && rawAssetClass && !isNaN(quantity) && !isNaN(price)) {
      const compositeKey = `${formattedDate}|${rawTicker.toUpperCase()}|${rawAssetClass.toUpperCase()}|${quantity}|${price}`;
      if (seenKeys.has(compositeKey)) {
        errors.push({
          row: rowNumber,
          message: `Duplicate row detected for ticker '${rawTicker}' on date '${formattedDate}'`
        });
      } else {
        seenKeys.add(compositeKey);
      }
    }

    // Only collect row if ZERO errors occurred for this row
    if (errors.length === initialErrorCount && formattedDate) {
      validatedRows.push({
        date: formattedDate,
        ticker: rawTicker.toUpperCase().trim(),
        assetClass: capitalizeWords(rawAssetClass.trim()),
        quantity,
        price,
      });
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, rows: validatedRows };
}

function getFieldValue(record, targetKey) {
  for (const key of Object.keys(record)) {
    const normalizedKey = key.toLowerCase().trim().replace(/[\s_]+/g, '_');
    if (normalizedKey === targetKey) {
      return record[key] !== undefined && record[key] !== null ? String(record[key]).trim() : '';
    }
  }
  return '';
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = {
  parseAndValidateCSV,
};

