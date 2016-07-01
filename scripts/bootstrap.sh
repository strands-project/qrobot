#!/bin/bash

export PROJECT_ROOT=`pwd`
export PROJECT_VENV=$PROJECT_ROOT/venv
export PROJECT_NODE=$PROJECT_ROOT/client/node_modules
export PROJECT_CONFIG=$PROJECT_ROOT/config
export LOGS=/home/qrobot/log

function production() {
  echo "Bootstrapping production environment"
  echo "Please enter configuration options:"
  read -p " * Host for the Nginx server: " nginx_host
  read -p " * Port for the Nginx server: " nginx_port
  read -p " * Admin e-mail address: " mail_admin
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
  echo "MAIL_ADMIN = '$mail_admin'" >> $flask
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
}

function development() {
  echo "Bootstrapping development environment"
  echo "Please enter host and ports for the development server"
  read -e -p "Development host: " -i "localhost" dev_host
  read -e -p "Development frontend port: " -i "8000" dev_front_port
  read -e -p "Development backend port: " -i "8001" dev_back_port
  local_env=$PROJECT_ROOT/.environment.local
  > $local_env
  echo "export DEV_HOST='$dev_host'" >> $local_env
  echo "export DEV_FRONTEND_PORT='$dev_front_port'" >> $local_env
  echo "export DEV_BACKEND_PORT='$dev_back_port'" >> $local_env

  if [[ ! -d "$PROJECT_VENV" ]]; then
    virtualenv -p python3 venv
    $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/common.pip
    $PROJECT_VENV/bin/pip install -r $PROJECT_CONFIG/development.pip
  fi
  if [[ ! -d "$PROJECT_NODE" ]]; then
    (cd client && npm install)
  fi
}

function staging() {
  echo "Bootstrapping staging environment"
  echo "Please enter host, ssh port, and admin account for the staging server"
  read -e -p "Staging host: " -i "localhost" staging_host
  read -e -p "Staging SSH port: " -i "2222" staging_ssh_port
  read -e -p "Staging admin account: " -i "`whoami`" staging_admin
  local_env=$PROJECT_ROOT/.environment.local
  echo "export STAGING_HOST='$staging_host'" >> $local_env
  echo "export STAGING_SSH_PORT='$staging_ssh_port'" >> $local_env
  echo "export STAGING_ADMIN='$staging_admin'" >> $local_env
  source $local_env
  fab -f $PROJECT_ROOT/scripts/fabfile.py setup_staging
}

case $1 in
  production)   if [ "$EUID" -ne 0 ]; then
                  echo "Please run as root"
                  exit 3
                fi
                production;;
  development)  development;;
  staging)      staging;;
  *)            printf "Usage: %s (production|development|staging)\n" $0
                exit 2;;
esac

