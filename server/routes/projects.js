const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');
const { protect, authorize, projectAccess, projectEditAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('🔍 PROJECTS API: GET request received');
    console.log('🔍 PROJECTS API: User ID:', req.user.id);
    console.log('🔍 PROJECTS API: Query params:', req.query);
    
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    // Build where clause - get projects where user is owner or member
    let whereClause = {
      [Op.or]: [
        { ownerId: req.user.id }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (search) {
      whereClause[Op.and] = [
        whereClause,
        {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
          ]
        }
      ];
    }

    // Build order clause
    const order = [[sortBy, sortOrder.toUpperCase()]];

    console.log('🔍 PROJECTS API: Executing query with whereClause:', JSON.stringify(whereClause, null, 2));
    
    const projects = await Project.findAll({
      where: whereClause,
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'projectMembers', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ],
      order
    });

    console.log('✅ PROJECTS API: Found', projects.length, 'projects');
    console.log('✅ PROJECTS API: Project names:', projects.map(p => p.name));

    res.json({
      success: true,
      data: {
        projects,
        count: projects.length
      }
    });
  } catch (error) {
    console.error('❌ PROJECTS API: Error occurred:', error);
    console.error('❌ PROJECTS API: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
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

    const { name, description, startDate, endDate, priority = 'medium', budget = 0, team = [] } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      priority,
      budget,
      ownerId: req.user.id
    });

    // Add team members if provided
    if (team && team.length > 0) {
      const projectMembers = team.map(member => ({
        projectId: project.id,
        userId: member.userId,
        role: member.role || 'member'
      }));
      await ProjectMember.bulkCreate(projectMembers);
    }

    // Fetch project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: createdProject
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:projectId', protect, projectAccess, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'projectMembers', attributes: ['id', 'role'], include: [{ association: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] },
        { association: 'projectTasks', attributes: ['id', 'title', 'status', 'priority', 'dueDate'] }
      ]
    });

    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:projectId', protect, projectEditAccess, [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
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

    const { name, description, startDate, endDate, status, priority, budget } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Update project
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (budget !== undefined) updateData.budget = budget;

    await Project.update(updateData, {
      where: { id: req.params.projectId }
    });

    // Fetch updated project
    const updatedProject = await Project.findByPk(req.params.projectId, {
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'projectMembers', attributes: ['id', 'role'], include: [{ association: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] }
      ]
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:projectId', protect, projectEditAccess, async (req, res) => {
  try {
    // Check if project has tasks
    const taskCount = await Task.count({ where: { projectId: req.params.projectId } });
    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project with existing tasks. Please delete all tasks first.'
      });
    }

    await Project.destroy({ where: { id: req.params.projectId } });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/projects/:id/team
// @desc    Add team member to project
// @access  Private
router.post('/:projectId/team', protect, projectEditAccess, [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['owner', 'manager', 'member', 'viewer']).withMessage('Invalid role')
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

    const { userId, role = 'member' } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      where: { projectId: req.params.projectId, userId }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add team member
    await ProjectMember.create({
      projectId: req.params.projectId,
      userId,
      role
    });

    // Get updated project
    const updatedProject = await Project.findByPk(req.params.projectId, {
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'projectMembers', attributes: ['id', 'role'], include: [{ association: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] }
      ]
    });

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding team member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/projects/:id/team/:userId
// @desc    Remove team member from project
// @access  Private
router.delete('/:projectId/team/:userId', protect, projectEditAccess, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is trying to remove the owner
    if (req.project.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    // Remove team member
    await ProjectMember.destroy({
      where: { projectId: req.params.projectId, userId }
    });

    // Get updated project
    const updatedProject = await Project.findByPk(req.params.projectId, {
      include: [
        { association: 'projectOwner', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'projectMembers', attributes: ['id', 'role'], include: [{ association: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] }
      ]
    });

    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/projects/:id/analytics
// @desc    Get project analytics
// @access  Private
router.get('/:projectId/analytics', protect, projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get tasks by status
    const tasksByStatus = await Task.findAll({
      where: { projectId },
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['status']
    });

    // Get tasks by priority
    const tasksByPriority = await Task.findAll({
      where: { projectId },
      attributes: ['priority', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['priority']
    });

    // Get overdue tasks
    const overdueTasks = await Task.count({
      where: {
        projectId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'completed' }
      }
    });

    // Get recent tasks
    const recentTasks = await Task.findAll({
      where: { projectId },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      include: [
        { association: 'taskAssignedTo', attributes: ['id', 'firstName', 'lastName'] },
        { association: 'taskCreatedBy', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    const analytics = {
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      recentTasks,
      projectProgress: req.project.progress
    };

    res.json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;