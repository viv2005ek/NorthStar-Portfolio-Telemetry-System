const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getPortfolioDashboardData } = require('../services/portfolioService');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Tenant ID strictly derived from JWT claims
    const tenantId = req.user.tenantId;

    const data = await getPortfolioDashboardData(tenantId);

    return res.json({
      tenantId: req.user.tenantId,
      tenantName: req.user.tenantName,
      userEmail: req.user.email,
      ...data
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return res.status(500).json({ error: 'Failed to compute dashboard metrics' });
  }
});

module.exports = router;
