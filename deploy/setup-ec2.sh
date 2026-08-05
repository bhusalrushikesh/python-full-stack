#!/usr/bin/env bash
set -euo pipefail

# Run on Ubuntu EC2 as a user with sudo.
# Prerequisites: RDS MySQL reachable from this EC2 security group (port 3306).

APP_DIR=/var/www/nexus
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

sudo apt-get update
sudo apt-get install -y python3 python3-pip nginx curl

# Node 20 for frontend build
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

rsync -a --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude frontend/dist \
  "$REPO_DIR/" "$APP_DIR/"

# Backend — system Python (no venv)
cd "$APP_DIR/backend"
sudo pip3 install --upgrade pip
sudo pip3 install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Edit $APP_DIR/backend/.env with your RDS DATABASE_URL before starting the service."
fi

# Frontend build (nginx serves dist; leave VITE_API_URL empty)
cd "$APP_DIR/frontend"
npm install
npm run build
sudo mkdir -p /var/www/nexus/frontend
sudo rsync -a --delete dist/ /var/www/nexus/frontend/

# Systemd + Nginx
sudo cp "$APP_DIR/deploy/nexus-api.service" /etc/systemd/system/nexus-api.service
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/nexus
sudo ln -sfn /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/nexus
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable nexus-api
sudo systemctl restart nexus-api
sudo systemctl restart nginx

echo "Deploy complete."
echo "1) Set DATABASE_URL in $APP_DIR/backend/.env"
echo "2) sudo systemctl restart nexus-api"
echo "3) Open http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo YOUR-EC2-IP)"
