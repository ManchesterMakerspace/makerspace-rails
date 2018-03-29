#!/bin/bash
suites="${PWD}/spec/frontend/suites.txt"
while IFS='' read -r line || [[ -n "$line" ]]; do
    mkdir -p $PWD/test_results/$line
    echo "Starting suite: $line"
    rake protractor_test[$line]
    echo "Suite finished, saving results"
    cp -r $PWD/spec/frontend/reporter/* $PWD/test_results/$line
    RAILS_ENV=test rake db:db_reset
done < $suites
