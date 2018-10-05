#!/bin/bash
# set -e

max_wait_seconds=300
echo "Waiting.."
if [ -z ${SELENIUM_DOMAIN} ]; then
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

echo "# All containers ready. Starting testing..."
if [ -z ${INTERACTIVE} ]; then
  /bin/bash
elif [ -z ${SELENIUM_DOMAIN} ]
  yarn test-functional
else
  yarn test
fi
