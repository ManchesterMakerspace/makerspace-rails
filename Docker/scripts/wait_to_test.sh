#!/bin/bash
# set -e

max_wait_seconds=300
echo "Waiting.."
if [ ${SELENIUM_ADDRESS} ]; then
  echo "Waiting for selenium to start..."
  while true; do
    if ! curl --output /dev/null --silent --head --fail "${SELENIUM_ADDRESS}" > /dev/null 2>&1; then
      sleep 1;
      ((max_wait_seconds--))
      ((max_wait_seconds%15==0)) && echo "...waiting for selenium at ${SELENIUM_ADDRESS}"
      ((max_wait_seconds == 0)) && echo "FAILED waiting for selenium at ${SELENIUM_ADDRESS}" && exit 1
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
    ((max_wait_seconds%15==0)) && echo "...waiting for application at http://${APP_DOMAIN}:${PORT}"
    ((max_wait_seconds == 0)) && echo "FAILED waiting for application at http://${APP_DOMAIN}:${PORT}" && exit 1
  else
    echo "Application ready"
    break
  fi
done

echo "# All containers ready."
if [ "${INTERACTIVE}" == "TRUE" ]; then
  echo "Dev available"
  echo "Selenium: 0.0.0.0:4444/wd/hub"
  echo "App: 0.0.0.0:${PORT}"
  /bin/bash
else
  cd /usr/src/app && echo "Starting testing..."
  if [ ${SELENIUM_ADDRESS} ]; then
    if [ "${CONFIG}" == "integration" ]; then
      yarn test-integration
    else
      yarn test-functional
    fi
  else
    yarn test
  fi
fi
