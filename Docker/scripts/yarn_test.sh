#!/bin/bash
# set -e

max_wait_seconds=100
echo "Waiting.."
echo "Waiting for selenium to start..."
while true; do
  if ! curl --output /dev/null --silent --head --fail "http://selenium:4444/wd/hub" > /dev/null 2>&1; then
    sleep 1;
    ((max_wait_seconds--))
    ((max_wait_seconds%15==0)) && echo "...waiting for selenium"
    ((max_wait_seconds == 0)) && echo "FAILED waiting for selenium" && exit 1
  else
    echo "Done"
    break
  fi
done

echo "Waiting for application to start..."
while true; do
  if ! curl --output /dev/null --silent --head --fail "http://interface:3002" > /dev/null 2>&1; then
    sleep 5;
    ((max_wait_seconds-=5))
    ((max_wait_seconds%15==0)) && echo "...waiting for application"
    ((max_wait_seconds == 0)) && echo "FAILED waiting for application" && exit 1
  else
    echo "Done"
    break
  fi
done

echo "# Starting testing"
yarn install && yarn test-functional
