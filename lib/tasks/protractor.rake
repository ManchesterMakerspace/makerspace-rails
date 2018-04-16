desc "Task to run one or multiple suites. List desired specs as CSV w/o spaces"
task :protractor_test do |t, args|
  sh "protractor protractor_conf.js --suite=#{args.extras.join(",")}"
end
