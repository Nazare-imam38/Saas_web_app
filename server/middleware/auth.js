const jwt = require('jsonwebtoken');
const path = require('path');

// Ensure environment variables are loaded
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  console.log('🔍 AUTH MIDDLEWARE: Request received');
  console.log('🔍 AUTH MIDDLEWARE: Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('🔍 AUTH MIDDLEWARE: Request path:', req.path);
  console.log('🔍 AUTH MIDDLEWARE: Request method:', req.method);

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 AUTH MIDDLEWARE: Token extracted:', token ? 'Yes' : 'No');

      // Verify token
      const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
      const decoded = jwt.verify(token, secret);
      console.log('🔍 AUTH MIDDLEWARE: Token decoded successfully, user ID:', decoded.id);

      // Get user from token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        console.log('❌ AUTH MIDDLEWARE: User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log('✅ AUTH MIDDLEWARE: User authenticated:', {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role
      });

      if (!req.user.isActive) {
        console.log('❌ AUTH MIDDLEWARE: User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      console.log('✅ AUTH MIDDLEWARE: Authentication successful, proceeding to route');
      next();
    } catch (error) {
      console.error('❌ AUTH MIDDLEWARE: Token verification error:', error);
      console.error('❌ AUTH MIDDLEWARE: Error stack:', error.stack);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    console.log('❌ AUTH MIDDLEWARE: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Middleware to check if user is project owner or team member
const projectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const Project = require('../models/Project');
    const ProjectMember = require('../models/ProjectMember');
    
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

    // Check if user is owner or team member
    const isOwner = project.ownerId === req.user.id;
    const isTeamMember = project.projectMembers.some(member => 
      member.id === req.user.id
    );

    if (!isOwner && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project'
      });
    }

    req.project = project;
    req.userRole = isOwner ? 'owner' : 'member';
    next();
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking project access'
    });
  }
};

// Middleware to check if user can edit project (owner or manager)
const projectEditAccess = async (req, res, next) => {
  try {
    await projectAccess(req, res, () => {
      const allowedRoles = ['owner', 'manager'];
      
      if (!allowedRoles.includes(req.userRole)) {
        return res.status(403).json({
          success: false,
          message: 'You need owner or manager permissions to perform this action'
        });
      }
      
      next();
    });
  } catch (error) {
    console.error('Project edit access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking project edit access'
    });
  }
};

// Middleware to check if user owns the task or is assigned to it
const taskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.body.taskId;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const Task = require('../models/Task');
    const task = await Task.findByPk(taskId, {
      include: [
        { association: 'taskProject' },
        { association: 'taskCreatedBy' },
        { association: 'taskAssignedTo' }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check project access first
    req.params.projectId = task.projectId;
    await projectAccess(req, res, () => {
      // Check if user is task creator, assigned to task, or has project edit access
      const isCreator = task.createdById === req.user.id;
      const isAssigned = task.assignedToId === req.user.id;
      const canEditProject = ['owner', 'manager'].includes(req.userRole);

      if (!isCreator && !isAssigned && !canEditProject) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to access this task'
        });
      }

      req.task = task;
      req.canEditTask = isCreator || isAssigned || canEditProject;
      next();
    });
  } catch (error) {
    console.error('Task access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking task access'
    });
  }
};

module.exports = {
  protect,
  authorize,
  projectAccess,
  projectEditAccess,
  taskAccess
};
