#!/bin/bash
# set -e

max_wait_seconds=300
echo "Waiting.."
if [ ${SELENIUM_DOMAIN} ]; then
  echo "Waiting for selenium to start..."
  while true; do
    if ! curl --output /dev/null --silent --head --fail "http://${SELENIUM_DOMAIN}:4444/wd/hub" > /dev/null 2>&1; then
      sleep 1;
      ((max_wait_seconds--))
      ((max_wait_seconds%15==0)) && echo "...waiting for selenium"
      ((max_wait_seconds == 0)) && echo "FAILED waiting for selenium" && exit 1
    else
      echo "Selenium ready"
      break
    fi
  done
fi

echo "Waiting for application to start..."
while true; do
  if ! curl --output /dev/null --silent --head --fail "http://${APP_DOMAIN}:${PORT}" > /dev/null 2>&1; then
    sleep 5;
    ((max_wait_seconds-=5))
    ((max_wait_seconds%15==0)) && echo "...waiting for application"
    ((max_wait_seconds == 0)) && echo "FAILED waiting for application" && exit 1
  else
    echo "Application ready"
    break
  fi
done

echo "# All containers ready."
if [ "${INTERACTIVE}" == "TRUE" ]; then
  echo "Dev available"
  if [ ${SELENIUM_DOMAIN} ]; then
    echo "Selenium: 0.0.0.0:4444/wd/hub"
  fi
  echo "App: 0.0.0.0:${PORT}"
  /bin/bash
elif [ ${SELENIUM_DOMAIN} ]; then
  yarn install && echo "Starting testing..." && yarn test-functional
else
  yarn install && echo "Starting testing..." && yarn test
fi
