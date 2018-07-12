#!/bin/bash
frontend="$PWD/spec/frontend"
suites=$(find $frontend/suites/ -type d -mindepth 1 -exec basename {} \;)
results="$frontend/test_results"

if [ -e $results ]; then
  rm -r $results
fi
mkdir -p $results
for d in  $suites; do
  line=$(basename $d)
  if [ -e $results/$line ]; then
    rm -r $results/$line
  fi
  mkdir -p $results/$line
  echo "Starting suite: $line"
  bundle exec rake protractor_test[$line]
  echo "Suite finished, saving results"
  cp -r $frontend/reporter/* $results/$line
  RAILS_ENV=test bundle exec rake db:db_reset
done
echo "Integration Tests complete. Compiling all suites..."
node $frontend/compile_test_results.js
