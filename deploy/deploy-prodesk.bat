@echo off
chcp 65001 >nul
setlocal

REM FukaiBox ProDesk LXC Sandbox Deployment

set CTID=%1
set PROXMOX_HOST=%2

if "%CTID%"=="" set CTID=100
if "%PROXMOX_HOST%"=="" set PROXMOX_HOST=root@192.168.1.14

echo FukaiBox ProDesk Sandbox Deployment
echo.
echo Target: LXC Container %CTID% on %PROXMOX_HOST%
echo.

REM Transfer files to Proxmox
echo Transferring files to Proxmox...
scp -o StrictHostKeyChecking=no "%~dp0prodesk\sandbox-api.py" "%PROXMOX_HOST%:/tmp/sandbox-api.py"
scp -o StrictHostKeyChecking=no "%~dp0prodesk\fukaibox-sandbox.service" "%PROXMOX_HOST%:/tmp/fukaibox-sandbox.service"

REM Setup in LXC container
echo.
echo Setting up LXC container %CTID%...
ssh -o StrictHostKeyChecking=no %PROXMOX_HOST% "bash -s" << 'ENDSSH'
set -e

CTID=${CTID:-100}

# Copy files to container
pct push $CTID /tmp/sandbox-api.py /app/sandbox-api.py
pct push $CTID /tmp/fukaibox-sandbox.service /tmp/fukaibox-sandbox.service

# Setup inside container
pct exec $CTID -- bash -c '
    set -e
    
    # Install Flask
    pip3 install flask
   
    # Set permissions
    chown sandbox:sandbox /app/sandbox-api.py
    chmod +x /app/sandbox-api.py
    
    # Deploy systemd service
    mv /tmp/fukaibox-sandbox.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable fukaibox-sandbox
    systemctl restart fukaibox-sandbox
    
    echo "Sandbox API started successfully"
'

# Check service status
echo ""
echo "Service status:"
pct exec $CTID -- systemctl status fukaibox-sandbox --no-pager -l

echo ""
echo "Deployment complete!"
ENDSSH

echo.
echo [92mProDesk Sandbox Deployment Complete![0m
echo.
echo NOTE: Update Raspberry Pi .env file with:
echo    SANDBOX_HOST=(LXC container IP)
echo    SANDBOX_PORT=9000
