const pool = require('../config/db');

async function getPortfolioDashboardData(tenantId) {
  // 1. Get earliest and latest holding dates for tenant
  const datesResult = await pool.query(
    `SELECT MIN(holding_date)::text AS min_date, MAX(holding_date)::text AS max_date 
     FROM holdings 
     WHERE tenant_id = $1`,
    [tenantId]
  );

  const minDate = datesResult.rows[0]?.min_date;
  const maxDate = datesResult.rows[0]?.max_date;

  if (!minDate || !maxDate) {
    return {
      hasData: false,
      startDate: null,
      endDate: null,
      startMarketValue: 0,
      endMarketValue: 0,
      periodReturn: 0,
      assetClasses: []
    };
  }

  // 2. Start Market Value
  const startValResult = await pool.query(
    `SELECT COALESCE(SUM(quantity * price), 0) AS total_val 
     FROM holdings 
     WHERE tenant_id = $1 AND holding_date = $2`,
    [tenantId, minDate]
  );
  const startMarketValue = parseFloat(startValResult.rows[0].total_val);

  // 3. End Market Value
  const endValResult = await pool.query(
    `SELECT COALESCE(SUM(quantity * price), 0) AS total_val 
     FROM holdings 
     WHERE tenant_id = $1 AND holding_date = $2`,
    [tenantId, maxDate]
  );
  const endMarketValue = parseFloat(endValResult.rows[0].total_val);

  // 4. Period Return
  let periodReturn = 0;
  if (startMarketValue > 0) {
    periodReturn = (endMarketValue - startMarketValue) / startMarketValue;
  }

  // 5. Asset Class Breakdown at Latest Date
  const assetClassesResult = await pool.query(
    `SELECT asset_class AS "assetClass", 
            ROUND(SUM(quantity * price)::numeric, 2) AS "marketValue"
     FROM holdings 
     WHERE tenant_id = $1 AND holding_date = $2
     GROUP BY asset_class 
     ORDER BY "marketValue" DESC`,
    [tenantId, maxDate]
  );

  const assetClasses = assetClassesResult.rows.map((row) => ({
    assetClass: row.assetClass,
    marketValue: parseFloat(row.marketValue)
  }));

  return {
    hasData: true,
    startDate: minDate,
    endDate: maxDate,
    startMarketValue: Math.round(startMarketValue * 100) / 100,
    endMarketValue: Math.round(endMarketValue * 100) / 100,
    periodReturn: Math.round(periodReturn * 10000) / 10000, // e.g. 0.0410
    assetClasses
  };
}

module.exports = {
  getPortfolioDashboardData
};
