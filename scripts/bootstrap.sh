#!/bin/bash

export PROJECT_ROOT=`pwd`
export PROJECT_VENV=$PROJECT_ROOT/venv
export PROJECT_NODE=$PROJECT_ROOT/client/node_modules
export PROJECT_CONFIG=$PROJECT_ROOT/config
export LOGS=/home/qrobot/log

function production() {
  echo "Bootstrapping production environment"
  echo "Please enter host and port for the Nginx server"
  read -p "Host: " nginx_host
  read -p "Port: " nginx_port
  # Install system libraries
  apt-get update
  cat $PROJECT_CONFIG/production.apt | xargs apt-get install -y
  # Setup python virtual environment
  if [[ ! -d "$PROJECT_VENV" ]]; then
    virtualenv -p python3 venv
  fi
  $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/common.pip
  $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/production.pip
  # Create a folder for logs
  mkdir -p $LOGS
  # Generate flask config
  flask=$PROJECT_CONFIG/flask.py
  > $flask
  echo "SECRET_KEY = '`pwgen -s 32 1`'" >> $flask
  echo "SECRET_SALT = '`pwgen -s 16 1`'" >> $flask
  echo "# MONGODB_DB = 'qrobot'" >> $flask
  echo "# MONGODB_HOST = 'localhost'" >> $flask
  echo "# MONGODB_PORT = 27017" >> $flask
  echo "# MAIL_SERVER = 'localhost'" >> $flask
  echo "# MAIL_PORT = 25" >> $flask
  # Transfer ownership of created files to the qrobot user
  chown qrobot:qrobot $PROJECT_ROOT -R
  chown qrobot:qrobot $LOGS
  # Configure supervisor
  cp $PROJECT_CONFIG/supervisor /etc/supervisor/conf.d/qrobot.conf
  supervisorctl reread
  supervisorctl update
  # Configure nginx
  cp $PROJECT_CONFIG/nginx qrobot
  sed -i -e s/NGINX_HOST/$nginx_host/ qrobot
  sed -i -e s/NGINX_PORT/$nginx_port/ qrobot
  if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
  fi
  mv qrobot /etc/nginx/sites-available/qrobot
  if [ ! -f '/etc/nginx/sites-enabled/qrobot' ]; then
    ln -s /etc/nginx/sites-available/qrobot /etc/nginx/sites-enabled/qrobot
  fi
  /etc/init.d/nginx restart
  # Update to the latest version of the app
  bash scripts/update.sh
}

function development() {
  if [[ ! -d "$PROJECT_VENV" ]]; then
    virtualenv -p python3 venv
    $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/common.pip
    $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/development.pip
  fi
  if [[ ! -d "$PROJECT_NODE" ]]; then
    (cd client && npm install)
  fi
}

case $1 in
  production)   if [ "$EUID" -ne 0 ]; then
                  echo "Please run as root"
                  exit 3
                fi
                production;;
  development)  development;;
  *)            printf "Usage: %s (production|development)\n" $0
                exit 2;;
esac

