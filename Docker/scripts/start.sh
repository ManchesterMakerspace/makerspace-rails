#!/bin/bash
rm -f tmp/pids/server.pid && bundle exec rails s -p 3002 -b '0.0.0.0'