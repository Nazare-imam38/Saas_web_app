# 🚀 SaaS Project Management Dashboard

A comprehensive, full-stack project management dashboard built with the MERN stack, featuring real-time collaboration, Kanban boards, analytics, and modern UI/UX.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Manager, Member)
- **Password reset functionality** with email integration
- **Social login support** (Google, Twitter)

### 📊 Project Management
- **Create and manage projects** with detailed information
- **Team collaboration** with member roles and permissions
- **Project analytics** with progress tracking and metrics
- **File attachments** and document management

### 📋 Task Management
- **Kanban board** with drag-and-drop functionality
- **Task creation and assignment** with priority levels
- **Subtasks and dependencies** for complex workflows
- **Time tracking** with start/stop functionality
- **Comments and discussions** on tasks
- **File uploads** to tasks

### 📈 Analytics & Reporting
- **Real-time dashboards** with project metrics
- **Task progress visualization** with charts
- **Team performance analytics**
- **Time tracking reports**
- **Custom date range filtering**

### 🔄 Real-time Collaboration
- **Socket.io integration** for live updates
- **Real-time notifications** for task changes
- **Live typing indicators** in comments
- **Online/offline user status**
- **Instant project updates**

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Dark/Light theme support**
- **Beautiful animations** and transitions
- **Intuitive navigation** with sidebar
- **Toast notifications** for user feedback

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **React Query** for state management
- **Socket.io Client** for real-time features
- **React Beautiful DnD** for drag-and-drop
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Recharts** for data visualization

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saas-project-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/saas-project-dashboard
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
saas-project-management-dashboard/
├── server/                 # Backend code
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── socket/            # Socket.io handlers
│   └── index.js           # Server entry point
├── client/                # Frontend code
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static files
│   └── package.json
├── uploads/               # File uploads directory
├── package.json           # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/team` - Add team member
- `DELETE /api/projects/:id/team/:userId` - Remove team member
- `GET /api/projects/:id/analytics` - Get project analytics

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `POST /api/tasks/:id/time-tracking/start` - Start time tracking
- `POST /api/tasks/:id/time-tracking/stop` - Stop time tracking
- `PUT /api/tasks/:id/move` - Move task (Kanban)
- `GET /api/tasks/overdue` - Get overdue tasks

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/team` - Get team members
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/analytics` - Get user analytics
- `GET /api/users/search` - Search users

### File Uploads
- `POST /api/uploads/task/:taskId` - Upload files to task
- `POST /api/uploads/project/:projectId` - Upload files to project
- `DELETE /api/uploads/task/:taskId/:filename` - Delete file from task
- `DELETE /api/uploads/project/:projectId/:filename` - Delete file from project
- `GET /api/uploads/:filename` - Download file

## 🎯 Key Features in Detail

### Kanban Board
- **Drag and drop** tasks between columns
- **Real-time updates** when tasks are moved
- **Visual feedback** during drag operations
- **Column customization** with different statuses
- **Task filtering** and search functionality

### Real-time Collaboration
- **Live task updates** across all connected users
- **Instant notifications** for project changes
- **User presence indicators** showing who's online
- **Typing indicators** in comment sections
- **Real-time file upload progress**

### Analytics Dashboard
- **Project progress charts** with completion percentages
- **Task distribution** by status and priority
- **Team performance metrics** and time tracking
- **Overdue task alerts** and notifications
- **Custom date range filtering** for reports

### File Management
- **Drag and drop file uploads** with progress indicators
- **Multiple file types** support (images, documents, archives)
- **File preview** for images and documents
- **Secure file storage** with access control
- **File sharing** within projects and tasks

## 🔒 Security Features

- **JWT token authentication** with secure storage
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **File upload restrictions** and validation

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set up MongoDB Atlas
3. Configure environment variables
4. Deploy using Heroku CLI or GitHub integration

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Vercel/Netlify (Frontend)
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`
4. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing frontend framework
- [Node.js](https://nodejs.org/) for the backend runtime
- [MongoDB](https://www.mongodb.com/) for the database
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Socket.io](https://socket.io/) for real-time communication
- [Heroicons](https://heroicons.com/) for the beautiful icons

---

**Built with ❤️ for modern project management**
"# Saas_web_app" 
