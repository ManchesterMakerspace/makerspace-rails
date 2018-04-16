#!/bin/bash
frontend="$PWD/spec/frontend"
suites="$frontend/suites.txt"
rm -r $frontend/test_results
mkdir -p $frontend/test_results
while IFS='' read -r line || [[ -n "$line" ]]; do
    rm -r $frontend/test_results/$line
    mkdir -p $frontend/test_results/$line
    echo "Starting suite: $line"
    rake protractor_test[$line]
    echo "Suite finished, saving results"
    cp -r $frontend/reporter/* $frontend/test_results/$line
    RAILS_ENV=test rake db:db_reset
done < $suites
node $frontend/compile_test_results.js
