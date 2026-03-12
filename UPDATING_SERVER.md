# Updating the Tournament API Server

This guide explains how to update the server code on your VPS when you need to make changes.

## Prerequisites

- SSH access to the server as root
- Basic familiarity with Linux command line
- The updated server code ready to deploy

## Step 1: Connect to Your VPS

First, connect to your VPS using SSH:

```bash
ssh root@demo-api.tenimaleta.com
```

Enter your password when prompted.

## Step 2: Back Up the Current Server Code

Before making any changes, create a backup of your current server.js file:

```bash
# Navigate to your server directory
cd /var/www/torneig-api/server

# Create a backup with date stamp
cp server.js server.js.backup.$(date +%Y%m%d)
```

## Step 3: Update the Server Code

You have several options to update the server code:

### Option 1: Edit the file directly on the server

```bash
# Edit the file using nano editor
nano server.js

# Make your changes, then press Ctrl+X, Y, and Enter to save
```

### Option 2: Upload a new version from your local machine

First, on your local machine, copy the new server.js file to the VPS:

```bash
# Run this command on your LOCAL machine, not on the VPS
scp /path/to/your/new/server.js root@demo-api.tenimaleta.com:/var/www/torneig-api/server/
```

### Option 3: Pull changes from a Git repository

If your code is in a Git repository:

```bash
# Navigate to your server directory
cd /var/www/torneig-api/server

# Pull the latest changes
git pull origin main  # replace 'main' with your branch name
```

## Step 4: Restart the Server

After updating the code, restart the server to apply the changes:

```bash
# Restart the PM2 process
pm2 restart torneig-api

# Verify the server is running
pm2 status
```

## Step 5: Check Logs and Verify

Check the logs to make sure the server started correctly without errors:

```bash
# View the most recent logs
pm2 logs torneig-api --lines 50

# Monitor the logs in real-time
pm2 logs torneig-api
```

To verify the server is working correctly, test the API:

```bash
# Test the health endpoint
curl http://localhost:3001/api/health

# Or use the public URL
curl https://demo-api.tenimaleta.com/api/health
```

## Common Issues and Troubleshooting

### Server won't start after update

If the server fails to start, check the error logs:

```bash
pm2 logs torneig-api --err --lines 100
```

Common issues include:
- Syntax errors in the code
- Missing dependencies
- Configuration errors

### Reverting to a Previous Version

If you need to revert to the previous version:

```bash
# List your backups
ls -la server.js.backup.*

# Restore the most recent backup
cp server.js.backup.YOUR_BACKUP_DATE server.js

# Restart the server
pm2 restart torneig-api
```

### API Not Responding

If the API is not responding after a restart:

1. Check if the server is running:
   ```bash
   pm2 status
   ```

2. Check if Nginx is properly forwarding requests:
   ```bash
   systemctl status nginx
   ```

3. Test locally on the server:
   ```bash
   curl http://localhost:3001/api/health
   ```

## Additional Tips

### Installing New Dependencies

If your updates require new dependencies:

```bash
# Navigate to your server directory
cd /var/www/torneig-api/server

# Install the new packages
npm install new-package-name
```

### Modifying Data Files

If you need to update the tournament data:

```bash
# Edit the initialization script
nano initData.js

# Make your changes and save

# Run the script to update the data
node initData.js
```

### Checking Server Resource Usage

To monitor your server's resource usage:

```bash
# View server stats with PM2
pm2 monit

# View system resources
htop  # You might need to install this: apt install htop
``` 