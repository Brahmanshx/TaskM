# Walkthrough: Starting the Task Management System

This guide provides the necessary steps to set up and start the full-stack AI Task Management System on your local machine.

## Prerequisites
- **Node.js** (v18 or higher)
- **Docker Desktop** (Installed and Running)
- **PowerShell** (for Windows users)

---

## Step 1: Start Docker Desktop
Before running any services, ensure Docker Desktop is open and the engine is running.
- Search for "Docker Desktop" in your start menu and launch it.
- Wait until the status icon turns green.

## Step 2: Start the Backend (Databases & Microservices)
The backend is powered by a microservices architecture managed via Docker Compose.

1. Open a terminal in the project root directory (`d:\task`).
2. Run the following command to build and start all services in detached mode:
   ```powershell
   docker-compose up -d --build
   ```
3. Verify that all containers are running:
   ```powershell
   docker-compose ps
   ```
   *The following services should be UP:*
   - `postgres`, `mongo`, `redis`
   - `api-gateway` (Port 3000)
   - `user-service`, `task-service`, `goal-service`, `analytics-service`, `notification-service`, `ai-service`

## Step 3: Start the Frontend
The frontend is a React application built with Vite.

1. Open a new terminal window.
2. Navigate to the frontend directory:
   ```powershell
   cd d:\task\frontend
   ```
3. Install dependencies (only required the first time):
   ```powershell
   npm install
   ```
4. Start the development server:
   ```powershell
   npm run dev
   ```
5. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

---

## Troubleshooting

### Services not starting?
If a service fails to start, check its logs using:
```powershell
docker-compose logs <service-name>
# Example: docker-compose logs user-service
```

### Database Connection Issues?
The services are configured to wait for the databases, but if you encounter persistent connection Refused errors, try restarting the specific service:
```powershell
docker-compose restart <service-name>
```

### Environment Variables
Ensure all `.env` files (if any) are correctly configured in each service directory. The `docker-compose.yml` file already handles default configurations for local development.
