# OVHcloud Deployment Guide - Payslip Generator

This guide provides step-by-step instructions for deploying the Payslip Generator application on OVHcloud infrastructure.

## 📋 Prerequisites

### OVHcloud Requirements
- OVHcloud VPS or Dedicated Server (minimum 2GB RAM, 20GB storage)
- Domain name configured with OVHcloud DNS
- SSH access to your server
- Root or sudo privileges

### Local Requirements
- Git installed
- SSH client
- Domain DNS configured to point to your server IP

## 🚀 Quick Deployment

### Option 1: Automated Deployment Script

1. **Connect to your OVHcloud server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Download and run the deployment script:**
   ```bash
   wget https://raw.githubusercontent.com/your-repo/payslip-generator/main/ovhcloud-deploy.sh
   chmod +x ovhcloud-deploy.sh
   DOMAIN=your-domain.com EMAIL=admin@your-domain.com ./ovhcloud-deploy.sh
   ```

### Option 2: Manual Deployment

Follow the detailed steps below for manual deployment.

## 🔧 Manual Deployment Steps

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply Docker group changes
exit
```

### 2. Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/payslip-generator
sudo chown $USER:$USER /opt/payslip-generator
cd /opt/payslip-generator

# Clone or upload your application files
git clone https://github.com/your-repo/payslip-generator.git .
# OR upload the deployment package and extract it

# Set up environment variables
cp .env.example .env.production
nano .env.production  # Edit with your configuration
```

### 3. Environment Configuration

Edit `.env.production` with your specific values:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_APP_NAME=Payslip Generator

# Database Configuration (if using local PostgreSQL)
DATABASE_URL=postgresql://payslip_user:your-password@localhost:5432/payslip_db
DB_PASSWORD=your-secure-database-password

# Email Configuration (OVHcloud SMTP)
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password

# Security
SESSION_SECRET=your-secure-session-secret-min-32-characters
JWT_SECRET=your-jwt-secret-min-32-characters
```

### 4. Build and Deploy

```bash
# Build and start the application
docker-compose up -d --build

# Check if services are running
docker-compose ps
```

### 5. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/payslip-generator
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/payslip-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate Setup

```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 7. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 8. Database Migration

```bash
# Run database migrations (if using local PostgreSQL)
docker-compose exec database psql -U payslip_user -d payslip_db -f /docker-entrypoint-initdb.d/009_production_setup.sql
```

## 🔍 Verification and Testing

### 1. Health Check

```bash
# Check application health
curl https://your-domain.com/health

# Check Docker services
docker-compose ps
docker-compose logs -f
```

### 2. Application Testing

1. Open your browser and navigate to `https://your-domain.com`
2. Test user registration and login
3. Test payslip generation functionality
4. Test file upload and download features
5. Verify email notifications (if configured)

## 🔧 Maintenance and Monitoring

### Daily Operations

```bash
# View application logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up -d --build
```

### Backup Operations

```bash
# Manual backup
/opt/payslip-generator/backup.sh

# View backup files
ls -la /opt/backups/payslip-generator/
```

### Monitoring

```bash
# Check system resources
htop
df -h
docker stats

# Check database performance
docker-compose exec database psql -U payslip_user -d payslip_db -c "SELECT * FROM get_database_stats();"
```

## 🚨 Troubleshooting

### Common Issues

1. **Application not accessible:**
   ```bash
   # Check if services are running
   docker-compose ps
   
   # Check Nginx status
   sudo systemctl status nginx
   
   # Check firewall
   sudo ufw status
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Test database connection
   docker-compose exec database psql -U payslip_user -d payslip_db -c "SELECT 1;"
   ```

3. **SSL certificate issues:**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate manually
   sudo certbot renew
   ```

### Log Locations

- Application logs: `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- Backup logs: `/opt/backups/payslip-generator/`

## 📞 Support

### OVHcloud Resources
- [OVHcloud Documentation](https://docs.ovh.com/)
- [OVHcloud Support](https://www.ovhcloud.com/en/support/)
- [OVHcloud Community](https://community.ovh.com/)

### Application Support
- Check the application logs first
- Review this deployment guide
- Contact your development team

## 🔄 Updates and Upgrades

### Application Updates

```bash
cd /opt/payslip-generator
git pull
docker-compose up -d --build
```

### System Updates

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot  # If kernel updates were installed
```

### Database Maintenance

```bash
# Clean old audit logs (keeps 90 days)
docker-compose exec database psql -U payslip_user -d payslip_db -c "SELECT cleanup_old_audit_logs(90);"

# Refresh materialized views
docker-compose exec database psql -U payslip_user -d payslip_db -c "SELECT refresh_materialized_views();"
```

## 📊 Performance Optimization

### For High Traffic

1. **Enable Redis caching:**
   - Uncomment Redis service in `docker-compose.yml`
   - Configure application to use Redis

2. **Database optimization:**
   - Monitor slow queries
   - Add additional indexes as needed
   - Consider read replicas for high read loads

3. **CDN Setup:**
   - Configure OVHcloud CDN for static assets
   - Update `REACT_APP_CDN_URL` in environment

### Scaling Options

- **Vertical scaling:** Upgrade your OVHcloud VPS
- **Horizontal scaling:** Use OVHcloud Load Balancer with multiple instances
- **Database scaling:** Consider OVHcloud managed PostgreSQL

---

**Note:** Replace all placeholder values (your-domain.com, your-project-id, etc.) with your actual configuration values before deployment.