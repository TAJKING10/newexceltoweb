#!/bin/bash

# OVHcloud Deployment Script for Payslip Generator
# This script automates the deployment process on OVHcloud

set -e

echo "🚀 Starting OVHcloud deployment for Payslip Generator..."

# Configuration
PROJECT_NAME="payslip-generator"
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${EMAIL:-admin@your-domain.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
print_status "Installing Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx (for reverse proxy)
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create project directory
print_status "Setting up project directory..."
sudo mkdir -p /opt/$PROJECT_NAME
sudo chown $USER:$USER /opt/$PROJECT_NAME
cd /opt/$PROJECT_NAME

# Copy application files (assuming they're in current directory)
print_status "Copying application files..."
cp -r . /opt/$PROJECT_NAME/

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f .env.production ]; then
    print_warning "No .env.production file found. Please create one with your configuration."
    cp .env.example .env.production
    print_warning "Please edit .env.production with your actual configuration before continuing."
    read -p "Press enter when you've configured .env.production..."
fi

# Build and start services
print_status "Building and starting Docker services..."
docker-compose -f docker-compose.yml up -d --build

# Configure Nginx reverse proxy
print_status "Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Set up SSL certificate
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Set up automatic certificate renewal
print_status "Setting up automatic certificate renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/$PROJECT_NAME > /dev/null <<EOF
/opt/$PROJECT_NAME/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/$PROJECT_NAME.service > /dev/null <<EOF
[Unit]
Description=Payslip Generator Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/$PROJECT_NAME
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable $PROJECT_NAME.service

# Set up firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create backup script
print_status "Creating backup script..."
sudo tee /opt/$PROJECT_NAME/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/$PROJECT_NAME"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
docker-compose exec -T database pg_dump -U payslip_user payslip_db > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz /opt/$PROJECT_NAME --exclude=/opt/$PROJECT_NAME/logs

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/$PROJECT_NAME/backup.sh

# Schedule daily backups
echo "0 2 * * * /opt/$PROJECT_NAME/backup.sh" | crontab -

# Final status check
print_status "Checking service status..."
docker-compose ps

print_status "🎉 Deployment completed successfully!"
print_status "Your application should be available at: https://$DOMAIN"
print_status ""
print_status "Next steps:"
print_status "1. Configure your DNS to point to this server's IP address"
print_status "2. Update your Supabase configuration in .env.production"
print_status "3. Test the application functionality"
print_status "4. Monitor logs: docker-compose logs -f"
print_status ""
print_status "Useful commands:"
print_status "- Restart services: docker-compose restart"
print_status "- View logs: docker-compose logs -f"
print_status "- Update application: git pull && docker-compose up -d --build"
print_status "- Backup: /opt/$PROJECT_NAME/backup.sh"