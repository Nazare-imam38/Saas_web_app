const express = require('express');
const router = express.Router();

// Import auth routes from server
const authRoutes = require('../server/routes/auth');

// Use the auth routes
router.use('/', authRoutes);

module.exports = router;
