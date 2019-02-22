#!/bin/bash
# set -e

if [ "${INTERACTIVE}" == "TRUE" ]; then
  # Things need to be scoped to the services that are using it.
  # If starting for selenium tests, we need to make sure services Selenium,
  # Mockserver, and Interface are all using the same network.
  # (i.e. if Selenium is docker network, so is Mockserver)
  # This is confirmed for interactive because other arguments can be set changing
  # these ENVs.  Corrections are not needed for automated testing; the
  # docker image will take care of everything.
  echo "Setting --interactive environment"
  if [ "${LOCAL}" == "TRUE" ]; then
    echo "Setting --interactive local env"
    API_DOMAIN=http://0.0.0.0:1080
    APP_DOMAIN=0.0.0.0
    MOCKSERVER_DOMAIN=0.0.0.0
  fi
fi

echo "Mockserver set to: ${API_DOMAIN}"
echo "Removing any existing Rails instances"
rm -f tmp/pids/server.pid

if [ -z "${WEBPACKER_DEV_SERVER_HOST}" ]; then
  echo "Building webpack"
  npm rebuild node-sass
  ./bin/webpack
fi
echo "Starting Rails"
bundle exec rails s -p 3002 -b '0.0.0.0'