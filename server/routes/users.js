const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      role, 
      isActive, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build where clause
    let whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    const order = [[sortBy, sortOrder.toUpperCase()]];

    // Pagination
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users for project assignment
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, projectId, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    let whereClause = {
      [Op.and]: [
        { id: { [Op.ne]: req.user.id } }, // Exclude current user
        { isActive: true },
        {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${q}%` } },
            { lastName: { [Op.iLike]: `%${q}%` } },
            { email: { [Op.iLike]: `%${q}%` } }
          ]
        }
      ]
    };

    // If projectId is provided, exclude users already in the project
    if (projectId) {
      const project = await Project.findByPk(projectId, {
        include: [{ association: 'projectMembers' }]
      });

      if (project) {
        const memberIds = project.projectMembers.map(member => member.userId);
        memberIds.push(project.ownerId); // Include project owner
        whereClause[Op.and].push({ id: { [Op.notIn]: memberIds } });
      }
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own profile unless they're admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { 
          association: 'ownedProjects', 
          attributes: ['id', 'name', 'status', 'progress'],
          limit: 5
        },
        { 
          association: 'memberProjects', 
          attributes: ['id', 'name', 'status', 'progress'],
          limit: 5
        },
        { 
          association: 'assignedTasks', 
          attributes: ['id', 'title', 'status', 'priority', 'dueDate'],
          limit: 5
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only or own profile)
// @access  Private
router.put('/:userId', protect, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['admin', 'manager', 'member']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { firstName, lastName, email, role, isActive, preferences } = req.body;

    // Check permissions
    const isOwnProfile = userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Non-admin users can't change role or isActive
    if (!isAdmin && (role !== undefined || isActive !== undefined)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile information'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role && isAdmin) updateData.role = role;
    if (isActive !== undefined && isAdmin) updateData.isActive = isActive;
    if (preferences) updateData.preferences = { ...user.preferences, ...preferences };

    await User.update(updateData, { where: { id: userId } });

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user owns any projects
    const ownedProjectsCount = await Project.count({ where: { ownerId: userId } });
    if (ownedProjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who owns projects. Please transfer ownership first.'
      });
    }

    // Check if user has assigned tasks
    const assignedTasksCount = await Task.count({ where: { assignedToId: userId } });
    if (assignedTasksCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with assigned tasks. Please reassign tasks first.'
      });
    }

    await User.destroy({ where: { id: userId } });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private
router.get('/:userId/stats', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own stats unless they're admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const ownedProjectsCount = await Project.count({ where: { ownerId: userId } });
    const memberProjectsCount = await Project.count({
      include: [{
        association: 'projectMembers',
        where: { userId }
      }]
    });

    const totalTasks = await Task.count({
      where: { assignedToId: userId }
    });

    const completedTasks = await Task.count({
      where: { 
        assignedToId: userId,
        status: 'completed'
      }
    });

    const overdueTasks = await Task.count({
      where: {
        assignedToId: userId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'completed' }
      }
    });

    const stats = {
      ownedProjects: ownedProjectsCount,
      memberProjects: memberProjectsCount,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;