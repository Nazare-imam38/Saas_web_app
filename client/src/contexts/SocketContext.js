import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Emit user online status
        newSocket.emit('user-online');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Task events
      newSocket.on('task-created', (data) => {
        toast.success(`${data.createdBy.name} created a new task`, {
          duration: 3000,
        });
      });

      newSocket.on('task-updated', (data) => {
        toast.success(`${data.updatedBy.name} updated a task`, {
          duration: 3000,
        });
      });

      newSocket.on('task-deleted', (data) => {
        toast.success(`${data.deletedBy.name} deleted a task`, {
          duration: 3000,
        });
      });

      newSocket.on('task-moved', (data) => {
        toast.success(`${data.movedBy.name} moved a task to ${data.toStatus}`, {
          duration: 3000,
        });
      });

      // Comment events
      newSocket.on('comment-added', (data) => {
        toast.success(`${data.addedBy.name} added a comment`, {
          duration: 3000,
        });
      });

      // File events
      newSocket.on('file-uploaded', (data) => {
        toast.success(`${data.uploadedBy.name} uploaded a file`, {
          duration: 3000,
        });
      });

      // Time tracking events
      newSocket.on('time-tracking-updated', (data) => {
        const action = data.action === 'started' ? 'started' : 'stopped';
        toast.success(`${data.updatedBy.name} ${action} time tracking`, {
          duration: 3000,
        });
      });

      // Project events
      newSocket.on('project-updated', (data) => {
        toast.success(`${data.updatedBy.name} updated the project`, {
          duration: 3000,
        });
      });

      // Team events
      newSocket.on('team-updated', (data) => {
        const action = data.action === 'added' ? 'added' : 'removed';
        toast.success(`${data.updatedBy.name} ${action} a team member`, {
          duration: 3000,
        });
      });

      // User status events
      newSocket.on('user-status', (data) => {
        if (data.userId !== user?._id) {
          const status = data.status === 'online' ? 'came online' : 'went offline';
          toast(`${data.user.name} ${status}`, {
            duration: 2000,
            icon: data.status === 'online' ? '🟢' : '🔴',
          });
        }
      });

      // User typing indicator
      newSocket.on('user-typing', (data) => {
        if (data.user.id !== user?._id) {
          // Handle typing indicator in components
          console.log(`${data.user.name} is typing...`);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, token, user?._id, socket]);

  const joinProject = (projectId) => {
    if (socket && connected) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && connected) {
      socket.emit('leave-project', projectId);
    }
  };

  const joinProjects = (projectIds) => {
    if (socket && connected) {
      socket.emit('join-projects', projectIds);
    }
  };

  const emitTaskCreated = (projectId, task) => {
    if (socket && connected) {
      socket.emit('task-created', { projectId, task });
    }
  };

  const emitTaskUpdated = (projectId, task, action) => {
    if (socket && connected) {
      socket.emit('task-updated', { projectId, task, action });
    }
  };

  const emitTaskDeleted = (projectId, taskId) => {
    if (socket && connected) {
      socket.emit('task-deleted', { projectId, taskId });
    }
  };

  const emitTaskMoved = (projectId, taskId, fromStatus, toStatus, position) => {
    if (socket && connected) {
      socket.emit('task-moved', { projectId, taskId, fromStatus, toStatus, position });
    }
  };

  const emitCommentAdded = (projectId, taskId, comment) => {
    if (socket && connected) {
      socket.emit('comment-added', { projectId, taskId, comment });
    }
  };

  const emitFileUploaded = (projectId, taskId, file) => {
    if (socket && connected) {
      socket.emit('file-uploaded', { projectId, taskId, file });
    }
  };

  const emitTimeTrackingUpdated = (projectId, taskId, action, duration) => {
    if (socket && connected) {
      socket.emit('time-tracking-updated', { projectId, taskId, action, duration });
    }
  };

  const emitProjectUpdated = (projectId, project, action) => {
    if (socket && connected) {
      socket.emit('project-updated', { projectId, project, action });
    }
  };

  const emitTeamUpdated = (projectId, action, member) => {
    if (socket && connected) {
      socket.emit('team-updated', { projectId, action, member });
    }
  };

  const emitTypingStart = (projectId, taskId) => {
    if (socket && connected) {
      socket.emit('typing-start', { projectId, taskId });
    }
  };

  const emitTypingStop = (projectId, taskId) => {
    if (socket && connected) {
      socket.emit('typing-stop', { projectId, taskId });
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    joinProject,
    leaveProject,
    joinProjects,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskMoved,
    emitCommentAdded,
    emitFileUploaded,
    emitTimeTrackingUpdated,
    emitProjectUpdated,
    emitTeamUpdated,
    emitTypingStart,
    emitTypingStop,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
