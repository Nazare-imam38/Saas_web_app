const express = require('express');
const router = express.Router();

// Import user routes from server
const userRoutes = require('../server/routes/users');

// Use the user routes
router.use('/', userRoutes);

module.exports = router;
