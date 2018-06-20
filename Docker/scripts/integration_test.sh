#!/bin/bash
frontend="$PWD/spec/frontend"
suites="$frontend/suites.txt"
results="$frontend/test_results"
if [ -e $results ]; then
  rm -r $results
fi
mkdir -p $results
while IFS='' read -r line || [[ -n "$line" ]]; do
  if [ -e $results/$line ]; then
    rm -r $results/$line
  fi
  mkdir -p $results/$line
  echo "Starting suite: $line"
  bundle exec rake protractor_test[$line]
  echo "Suite finished, saving results"
  cp -r $frontend/reporter/* $results/$line
  RAILS_ENV=test bundle exec rake db:db_reset
done < $suites
node $frontend/compile_test_results.js
