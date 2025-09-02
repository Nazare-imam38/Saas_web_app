const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid or inactive user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`);

    // Store connected user
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      joinedAt: new Date()
    });

    // Join user to their projects for real-time updates
    socket.on('join-projects', async (projectIds) => {
      try {
        if (Array.isArray(projectIds)) {
          projectIds.forEach(projectId => {
            socket.join(`project-${projectId}`);
            console.log(`User ${socket.user.firstName} joined project ${projectId}`);
          });
        }
      } catch (error) {
        console.error('Error joining projects:', error);
      }
    });

    // Join specific project
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`User ${socket.user.firstName} joined project ${projectId}`);
    });

    // Leave project
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`User ${socket.user.firstName} left project ${projectId}`);
    });

    // Task updates
    socket.on('task-updated', (data) => {
      const { projectId, task, action } = data;
      
      // Emit to all users in the project
      socket.to(`project-${projectId}`).emit('task-updated', {
        task,
        action,
        updatedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Task created
    socket.on('task-created', (data) => {
      const { projectId, task } = data;
      
      socket.to(`project-${projectId}`).emit('task-created', {
        task,
        createdBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Task deleted
    socket.on('task-deleted', (data) => {
      const { projectId, taskId } = data;
      
      socket.to(`project-${projectId}`).emit('task-deleted', {
        taskId,
        deletedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Task moved (Kanban drag-and-drop)
    socket.on('task-moved', (data) => {
      const { projectId, taskId, fromStatus, toStatus, position } = data;
      
      socket.to(`project-${projectId}`).emit('task-moved', {
        taskId,
        fromStatus,
        toStatus,
        position,
        movedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Comment added
    socket.on('comment-added', (data) => {
      const { projectId, taskId, comment } = data;
      
      socket.to(`project-${projectId}`).emit('comment-added', {
        taskId,
        comment,
        addedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // File uploaded
    socket.on('file-uploaded', (data) => {
      const { projectId, taskId, file } = data;
      
      socket.to(`project-${projectId}`).emit('file-uploaded', {
        taskId,
        file,
        uploadedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Time tracking started/stopped
    socket.on('time-tracking-updated', (data) => {
      const { projectId, taskId, action, duration } = data;
      
      socket.to(`project-${projectId}`).emit('time-tracking-updated', {
        taskId,
        action,
        duration,
        updatedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Project updates
    socket.on('project-updated', (data) => {
      const { projectId, project, action } = data;
      
      socket.to(`project-${projectId}`).emit('project-updated', {
        project,
        action,
        updatedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Team member added/removed
    socket.on('team-updated', (data) => {
      const { projectId, action, member } = data;
      
      socket.to(`project-${projectId}`).emit('team-updated', {
        action,
        member,
        updatedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // User typing indicator
    socket.on('typing-start', (data) => {
      const { projectId, taskId } = data;
      
      socket.to(`project-${projectId}`).emit('user-typing', {
        taskId,
        user: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { projectId, taskId } = data;
      
      socket.to(`project-${projectId}`).emit('user-typing', {
        taskId,
        user: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        isTyping: false
      });
    });

    // User online/offline status
    socket.on('user-online', () => {
      socket.broadcast.emit('user-status', {
        userId: socket.user._id,
        status: 'online',
        user: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString());
      
      // Broadcast offline status
      socket.broadcast.emit('user-status', {
        userId: socket.user._id,
        status: 'offline',
        user: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper functions for server-side emissions
  const emitToProject = (projectId, event, data) => {
    io.to(`project-${projectId}`).emit(event, data);
  };

  const emitToUser = (userId, event, data) => {
    const userData = connectedUsers.get(userId);
    if (userData) {
      io.to(userData.socketId).emit(event, data);
    }
  };

  const emitToAll = (event, data) => {
    io.emit(event, data);
  };

  const getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  const isUserOnline = (userId) => {
    return connectedUsers.has(userId.toString());
  };

  // Export helper functions
  return {
    emitToProject,
    emitToUser,
    emitToAll,
    getConnectedUsers,
    isUserOnline
  };
};

module.exports = socketHandler;
