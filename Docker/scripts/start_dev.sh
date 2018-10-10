#!/bin/bash
# set -e

if [ "${INTERACTIVE}" == "TRUE" ]; then
  echo "Setting --interactive environment"
  API_DOMAIN=http://0.0.0.0:1080
  APP_DOMAIN=0.0.0.0
fi

echo "Removing any existing Rails instances"
rm -f tmp/pids/server.pid

if [ -z "${WEBPACKER_DEV_SERVER_HOST}"]; then
  echo "Building webpack"
  ./bin/webpack
fi
echo "Starting Rails"
bundle exec rails s -p 3002 -b '0.0.0.0'