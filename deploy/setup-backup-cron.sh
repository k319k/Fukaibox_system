#!/bin/bash
# Setup script for PostgreSQL backup automation using systemd timer
# Run this script on the Raspberry Pi to configure automated backups

set -e

echo "Setting up FukaiBox database backup automation..."

# Create systemd service file
cat > /tmp/fukaibox-backup.service << 'EOF'
[Unit]
Description=FukaiBox Database Backup
After=postgresql.service

[Service]
Type=oneshot
User=fukaibox
Group=fukaibox
ExecStart=/opt/fukaibox/deploy/backup-database.sh
StandardOutput=journal
StandardError=journal
EOF

# Create systemd timer file (daily at 3:00 AM)
cat > /tmp/fukaibox-backup.timer << 'EOF'
[Unit]
Description=FukaiBox Database Backup Timer
Requires=fukaibox-backup.service

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Copy files to systemd directory
sudo mv /tmp/fukaibox-backup.service /etc/systemd/system/
sudo mv /tmp/fukaibox-backup.timer /etc/systemd/system/

# Set correct permissions for backup script
sudo chmod +x /opt/fukaibox/deploy/backup-database.sh

# Create backup directory
sudo mkdir -p /opt/fukaibox/db-backups
sudo chown fukaibox:fukaibox /opt/fukaibox/db-backups

# Create log file
sudo touch /var/log/fukaibox-backup.log
sudo chown fukaibox:fukaibox /var/log/fukaibox-backup.log

# Reload systemd and enable timer
sudo systemctl daemon-reload
sudo systemctl enable fukaibox-backup.timer
sudo systemctl start fukaibox-backup.timer

echo ""
echo "✅ Backup automation configured successfully!"
echo ""
echo "Timer status:"
sudo systemctl status fukaibox-backup.timer --no-pager
echo ""
echo "Next scheduled run:"
sudo systemctl list-timers fukaibox-backup.timer --no-pager
echo ""
echo "To run backup manually: sudo systemctl start fukaibox-backup.service"
echo "To view logs: sudo journalctl -u fukaibox-backup.service"
