@echo off
REM WealthFlow TLS Certificate Setup Script for Windows
REM This script helps get a free Let's Encrypt certificate using Docker

echo 🔒 WealthFlow TLS Certificate Setup (Windows)
echo ============================================
echo.

REM Get domain name
set /p DOMAIN="Enter your domain name (e.g., example.com): "

if "%DOMAIN%"=="" (
    echo ❌ Domain name is required
    exit /b 1
)

REM Get email
set /p EMAIL="Enter your email for Let's Encrypt: "

if "%EMAIL%"=="" (
    echo ❌ Email is required
    exit /b 1
)

REM Create certificates directory
if not exist "infra\nginx\certs" mkdir infra\nginx\certs
echo ✅ Created certificates directory
echo.

REM Check if Docker is available
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop.
    exit /b 1
)

echo.
echo 🔐 Requesting certificate from Let's Encrypt...
echo    Domain: %DOMAIN%
echo    Email: %EMAIL%
echo.

REM Get certificate using Docker (Certbot)
docker run -it --rm --name certbot ^
  -v "%CD%\infra\nginx\certs:/etc/letsencrypt" ^
  certbot/certbot certonly --standalone ^
  -d %DOMAIN% ^
  -d www.%DOMAIN% ^
  -m %EMAIL% ^
  --agree-tos ^
  --no-eff-email

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to get certificate
    exit /b 1
)

REM Check if certificate was created
if not exist "infra\nginx\certs\live\%DOMAIN%\fullchain.pem" (
    echo ❌ Certificate not found
    exit /b 1
)

echo.
echo 📋 Copying certificates...
REM Copy from live directory to certs root
copy "infra\nginx\certs\live\%DOMAIN%\fullchain.pem" "infra\nginx\certs\" /Y >nul
copy "infra\nginx\certs\live\%DOMAIN%\privkey.pem" "infra\nginx\certs\" /Y >nul
echo ✅ Certificates copied to infra\nginx\certs\
echo.

REM Verify files exist
if not exist "infra\nginx\certs\fullchain.pem" (
    echo ❌ Certificate copy failed
    exit /b 1
)

echo 🔍 Verifying certificates...
dir /B infra\nginx\certs\*.pem
echo.

echo 📝 Next steps:
echo.
echo 1. Update your .env file with HTTPS URLs:
echo    FRONTEND_URL=https://%DOMAIN%
echo    VITE_API_URL=https://%DOMAIN%/api
echo.
echo 2. Build and start services:
echo    docker compose -f docker-compose.prod.yml build
echo    docker compose -f docker-compose.prod.yml up -d
echo.
echo 3. Verify services are running:
echo    docker compose -f docker-compose.prod.yml ps
echo.
echo ✅ Certificate setup complete!
echo.
echo 📅 Certificate expires in 90 days. You can renew it later with:
echo    docker run -it --rm --name certbot -v "^!CD^!\infra\nginx\certs:/etc/letsencrypt" ^
echo    certbot/certbot renew
echo.
pause
