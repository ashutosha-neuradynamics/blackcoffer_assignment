## Blackcoffer Data Visualization Dashboard

This project implements an interactive data visualization dashboard for the Blackcoffer test assignment using the provided `jsondata.json` file.

### Structure
- **backend**: Node.js + Express API server connected to MongoDB, serving filtered and aggregated data for the dashboard.
- **frontend**: Next.js (React + TypeScript) web app that renders the analytics dashboard with interactive charts and filters.

### Getting Started

#### Prerequisites
- Node.js (v16 or higher)
- Docker Desktop (must be running)
- Docker Compose (included with Docker Desktop)
- npm or yarn

#### Setup Instructions

1. **Start Docker Desktop** (if not already running)
   - Make sure Docker Desktop is installed and running on your system

2. **Start MongoDB using Docker:**
   ```bash
   docker-compose up -d
   ```
   This will start MongoDB on `localhost:27017` with the database `blackcoffer_dashboard`.
   
   To verify MongoDB is running:
   ```bash
   docker-compose ps
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Import data into MongoDB:**
   ```bash
   cd backend
   npm run import:data
   ```
   This will import all records from `jsondata.json` into MongoDB.

4. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend API will run on `http://localhost:4000`

5. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   # Set API base URL (Windows PowerShell)
   $env:NEXT_PUBLIC_API_BASE="http://localhost:4000"
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

6. **Access the dashboard:**
   Open your browser and navigate to `http://localhost:3000`

#### Docker Commands

**Important:** Make sure Docker Desktop is running before using these commands!

- **Start MongoDB:** `docker-compose up -d`
- **Stop MongoDB:** `docker-compose down`
- **View MongoDB logs:** `docker-compose logs -f mongodb`
- **Stop and remove volumes:** `docker-compose down -v` (⚠️ This will delete all data)
- **Check if container is running:** `docker-compose ps`

#### Troubleshooting Docker

If you get an error like `unable to get image` or `cannot find the file specified`:
1. **Start Docker Desktop** - Open Docker Desktop application and wait until it's fully started
2. **Verify Docker is running:** Open Docker Desktop and check the status shows "Running"
3. **Try again:** Run `docker-compose up -d` again

#### Alternative: Local MongoDB Installation

If you prefer not to use Docker, you can install MongoDB locally:
1. Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. The backend will connect to `mongodb://localhost:27017/blackcoffer_dashboard` automatically

#### Environment Variables

The backend uses the following default MongoDB connection string:
- `mongodb://localhost:27017/blackcoffer_dashboard`

You can override this by setting the `MONGODB_URI` environment variable in the backend directory.


