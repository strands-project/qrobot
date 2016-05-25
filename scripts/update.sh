#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 3
fi

git fetch --all --tags
tag=$(git describe --tags `git rev-list --tags --max-count=1`)
git checkout $tag -f
chown qrobot:qrobot . -R

/etc/init.d/nginx restart
supervisorctl reread qrobot
supervisorctl restart qrobot
