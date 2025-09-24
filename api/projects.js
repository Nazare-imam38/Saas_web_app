const express = require('express');
const router = express.Router();

// Import project routes from server
const projectRoutes = require('../server/routes/projects');

// Use the project routes
router.use('/', projectRoutes);

module.exports = router;
