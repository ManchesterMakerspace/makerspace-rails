require 'git'

desc 'Run integration tests for frontend library'
task :integration do
  # Checkout this repo
  gem_loc = `bundle show makerspace-react-rails`
  version = gem_loc.match(/\d+.\d+.\d+$/).to_a[0]
  react_repo_dir = File.expand_path("tmp/makerspace-react");
  react_repo_url = "https://github.com/ManchesterMakerspace/makerspace-react.git"
  if !File.directory?(react_repo_dir)
    react_git = Git.clone(react_repo_url, react_repo_dir, log: Logger.new("/dev/null")) # Silence logs to prevent cred leak
  else
    react_git = Git.open(react_repo_dir, log: Logger.new("/dev/null")) # Silence logs to prevent cred leak
    react_git.pull
  end

  react_git.fetch

  if version 
    react_git.checkout(version)
  end

  server_started = system("RAILS_ENV=test rake db:db_reset && LOG_TESTS=true RAILS_ENV=test rails s -b 0.0.0.0 -p 3002 -d")
  if server_started
    Dir.chdir(react_repo_dir)
    tests_pass = system("APP_DOMAIN=localhost PORT=3002 make integration")
    unless tests_pass
      puts("--------------- TESTS FAILED ---------------")
      exit(-1)
    end
  else
    puts("--------------- FAILED STARTING SERVER ---------------")
    exit(-1)
  end
end

