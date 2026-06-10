#!/bin/bash

# WealthFlow TLS Certificate Setup Script
# This script helps get a free Let's Encrypt certificate

set -e

echo "🔒 WealthFlow TLS Certificate Setup"
echo "===================================="
echo ""

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain name is required"
    exit 1
fi

# Get email
read -p "Enter your email for Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "❌ Email is required"
    exit 1
fi

# Create certificates directory
mkdir -p infra/nginx/certs
echo "✅ Created certificates directory"

# Check if certbot is available
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot not found. Installing..."
    # Try to install based on OS
    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        brew install certbot
    elif [ "$(uname)" = "Linux" ]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y certbot
    else
        echo "❌ Please install Certbot manually from: https://certbot.eff.org/"
        exit 1
    fi
fi

echo ""
echo "🔐 Requesting certificate from Let's Encrypt..."
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Get certificate
certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -m "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -n

# Find the certificate path (usually /etc/letsencrypt/live/$DOMAIN/)
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

if [ ! -f "$CERT_PATH/fullchain.pem" ]; then
    echo "❌ Certificate not found at $CERT_PATH"
    exit 1
fi

# Copy certificates
echo ""
echo "📋 Copying certificates..."
sudo cp "$CERT_PATH/fullchain.pem" infra/nginx/certs/
sudo cp "$CERT_PATH/privkey.pem" infra/nginx/certs/
sudo chown -R $USER:$USER infra/nginx/certs/

echo "✅ Certificates copied to infra/nginx/certs/"
echo ""

# Verify
echo "🔍 Verifying certificates..."
openssl x509 -in infra/nginx/certs/fullchain.pem -text -noout | grep -A 1 "Not Before\|Not After"
echo ""

# Update .env
echo "📝 Next steps:"
echo "1. Update your .env file with HTTPS URLs:"
echo "   FRONTEND_URL=https://$DOMAIN"
echo "   VITE_API_URL=https://$DOMAIN/api"
echo ""
echo "2. Build and start services:"
echo "   docker compose -f docker-compose.prod.yml build"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "3. Verify services are running:"
echo "   docker compose -f docker-compose.prod.yml ps"
echo ""
echo "✅ Certificate setup complete!"
echo ""
echo "📅 Certificate expires in 90 days. Set up renewal:"
echo "   sudo certbot renew --dry-run"
echo "   # Add to crontab: 0 3 * * * certbot renew --quiet"
