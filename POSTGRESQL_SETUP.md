# PostgreSQL Setup Guide

## 1. Install PostgreSQL

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Choose installation directory
4. Set a password for the `postgres` user (remember this!)
5. Keep default port (5432)
6. Complete installation

### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Install pgAdmin

### Windows:
1. Download pgAdmin from: https://www.pgadmin.org/download/pgadmin-4-windows/
2. Run the installer
3. Set up a master password for pgAdmin

### macOS:
```bash
brew install --cask pgadmin4
```

### Linux:
```bash
# Ubuntu/Debian
sudo apt install pgadmin4
```

## 3. Create Database

### Using pgAdmin:
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" > "Database"
5. Name it: `saas_project_dashboard`
6. Click "Save"

### Using Command Line:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE saas_project_dashboard;

# Exit
\q
```

## 4. Configure Environment Variables

Create a `.env` file in your project root with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_project_dashboard
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_URL=postgresql://postgres:your_postgres_password@localhost:5432/saas_project_dashboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## 5. Install Dependencies

```bash
npm install
```

## 6. Start the Application

```bash
# Start the server
npm run server

# In another terminal, start the client
npm run client
```

## 7. Verify Setup

1. Server should show: "✅ Connected to PostgreSQL database"
2. Server should show: "✅ Database synchronized"
3. Tables should be created automatically in pgAdmin

## Troubleshooting

### Connection Issues:
- Check if PostgreSQL service is running
- Verify port 5432 is not blocked
- Ensure password is correct in `.env` file

### Permission Issues:
- Make sure the `postgres` user has proper permissions
- Check if the database exists and is accessible

### Port Conflicts:
- If port 5432 is in use, change it in PostgreSQL config
- Update the `DB_PORT` in your `.env` file accordingly
