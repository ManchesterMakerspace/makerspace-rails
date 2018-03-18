task :webdriver_start do
  sh 'sudo webdriver-manager update'
  sh 'webdriver-manager start'
end

task :rails_integration do
  sh 'RAILS_ENV=test rails server'
end

multitask :integration_testing => [:rails_integration, :webdriver_start]
