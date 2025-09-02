const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect, authorize, projectAccess, taskAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('🔍 TASKS API: GET request received');
    console.log('🔍 TASKS API: User ID:', req.user.id);
    console.log('🔍 TASKS API: Query params:', req.query);
    
    const { 
      projectId, 
      status, 
      priority, 
      assignedTo, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build where clause
    let whereClause = {
      [Op.or]: [
        { createdById: req.user.id },
        { assignedToId: req.user.id }
      ]
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (assignedTo) {
      whereClause.assignedToId = assignedTo;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    const order = [[sortBy, sortOrder.toUpperCase()]];

    // Pagination
    const offset = (page - 1) * limit;

    console.log('🔍 TASKS API: Executing query with whereClause:', JSON.stringify(whereClause, null, 2));
    
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { association: 'taskProject', attributes: ['id', 'name'] },
        { association: 'taskAssignedTo', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'taskCreatedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('✅ TASKS API: Found', count, 'total tasks, returning', tasks.length, 'tasks');
    console.log('✅ TASKS API: Task titles:', tasks.map(t => t.title));

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ TASKS API: Error occurred:', error);
    console.error('❌ TASKS API: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('projectId').isUUID().withMessage('Valid project ID is required'),
  body('assignedToId').optional().isUUID().withMessage('Valid assigned user ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
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

    const { 
      title, 
      description, 
      projectId, 
      assignedToId, 
      priority = 'medium', 
      dueDate, 
      estimatedHours = 0,
      labels = []
    } = req.body;

    // Check if project exists and user has access
    const project = await Project.findByPk(projectId, {
      include: [
        { association: 'projectOwner' },
        { association: 'projectMembers' }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to project
    const isOwner = project.ownerId === req.user.id;
    const isMember = project.projectMembers.some(member => member.userId === req.user.id);
    
    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project'
      });
    }

    // Check if assigned user exists and is project member
    if (assignedToId) {
      const assignedUser = await User.findByPk(assignedToId);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }

      const isAssignedUserMember = project.projectMembers.some(member => member.userId === assignedToId);
      if (!isAssignedUserMember && project.ownerId !== assignedToId) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project'
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      projectId,
      assignedToId,
      createdById: req.user.id,
      priority,
      dueDate,
      estimatedHours,
      labels
    });

    // Fetch task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { association: 'taskProject', attributes: ['id', 'name'] },
        { association: 'taskAssignedTo', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'taskCreatedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: createdTask
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:taskId', protect, taskAccess, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        { association: 'taskProject', attributes: ['id', 'name', 'status'] },
        { association: 'taskAssignedTo', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'taskCreatedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ]
    });

    res.json({
      success: true,
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:taskId', protect, taskAccess, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('assignedToId').optional().isUUID().withMessage('Valid assigned user ID is required'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
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

    const { 
      title, 
      description, 
      assignedToId, 
      status, 
      priority, 
      dueDate, 
      estimatedHours,
      labels
    } = req.body;

    // Check if assigned user exists and is project member (if changing assignment)
    if (assignedToId && assignedToId !== req.task.assignedToId) {
      const assignedUser = await User.findByPk(assignedToId);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }

      const project = await Project.findByPk(req.task.projectId, {
        include: [{ association: 'projectMembers' }]
      });

      const isAssignedUserMember = project.projectMembers.some(member => member.userId === assignedToId);
      if (!isAssignedUserMember && project.ownerId !== assignedToId) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project'
        });
      }
    }

    // Update task
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (labels) updateData.labels = labels;

    await Task.update(updateData, {
      where: { id: req.params.taskId }
    });

    // Fetch updated task
    const updatedTask = await Task.findByPk(req.params.taskId, {
      include: [
        { association: 'taskProject', attributes: ['id', 'name', 'status'] },
        { association: 'taskAssignedTo', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { association: 'taskCreatedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
      ]
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:taskId', protect, taskAccess, async (req, res) => {
  try {
    await Task.destroy({ where: { id: req.params.taskId } });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:taskId/comments', protect, taskAccess, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
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

    const { content } = req.body;

    // Add comment
    const comment = await req.task.addComment(req.user.id, content);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks/:id/time-entries
// @desc    Add time entry to task
// @access  Private
router.post('/:taskId/time-entries', protect, taskAccess, [
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').isISO8601().withMessage('End time must be a valid date'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
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

    const { startTime, endTime, description = '' } = req.body;

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Add time entry
    const timeEntry = await req.task.addTimeEntry(req.user.id, startTime, endTime, description);

    res.status(201).json({
      success: true,
      message: 'Time entry added successfully',
      data: {
        timeEntry
      }
    });
  } catch (error) {
    console.error('Add time entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding time entry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks/:id/subtasks
// @desc    Add subtask to task
// @access  Private
router.post('/:taskId/subtasks', protect, taskAccess, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Subtask title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
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

    const { title, description = '' } = req.body;

    // Add subtask
    const subtask = await req.task.addSubtask(title, description);

    res.status(201).json({
      success: true,
      message: 'Subtask added successfully',
      data: {
        subtask
      }
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding subtask',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @desc    Update subtask
// @access  Private
router.put('/:taskId/subtasks/:subtaskId', protect, taskAccess, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Subtask title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
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

    const { subtaskId } = req.params;
    const { title, description, completed } = req.body;

    // Update subtask
    await req.task.updateSubtask(subtaskId, { title, description, completed });

    res.json({
      success: true,
      message: 'Subtask updated successfully'
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subtask',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;