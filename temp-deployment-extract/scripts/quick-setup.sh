#!/bin/bash
echo "Payslip Generator - Quick Setup"
echo "==============================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root for security reasons"
   exit 1
fi

# Set default values
DOMAIN=${DOMAIN:-localhost}
EMAIL=${EMAIL:-admin@localhost}

echo "Configuration:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

# Copy environment file if needed
if [ ! -f .env.production ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.production
        echo "Created .env.production from example"
    fi
fi

# Make deployment script executable
chmod +x ovhcloud-deploy.sh

echo ""
echo "Setup completed!"
echo "Next steps:"
echo "1. Edit .env.production with your configuration"
echo "2. Run: ./ovhcloud-deploy.sh"
