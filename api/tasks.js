const express = require('express');
const router = express.Router();

// Import task routes from server
const taskRoutes = require('../server/routes/tasks');

// Use the task routes
router.use('/', taskRoutes);

module.exports = router;
