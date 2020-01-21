require 'git'

desc 'Tag repo and, if swagger changed, publish updated makerspace-ts-api-client package'
task :publish do
  # Checkout this repo
  rails_repo_dir = File.expand_path("tmp/makerspace-rails");
  rails_repo_url = "https://#{ENV["USERNAME"]}:#{ENV["PASSPHRASE"]}@github.com/ManchesterMakerspace/makerspace-rails.git"
  rails_git = clone_repo(rails_repo_url, rails_repo_dir)

  changed_swagger = swagger_changed?(rails_git)
  
  # Tag rails repo
  next_rails_tag = tag_repo(rails_git)

  # If need to tag rails repo, also will tag ts repo
  if next_rails_tag

    # Get relative path to updated swagger
    if changed_swagger
      swagger_path = File.expand_path(changed_swagger)
      puts "Swagger changed. Updating TS Client."
      # Pull down ts client
      ts_client_repo_dir = File.expand_path("tmp/makerspace-ts-api-client");
      ts_client_repo_url = "https://#{ENV["USERNAME"]}:#{ENV["PASSPHRASE"]}@github.com/ManchesterMakerspace/makerspace-ts-api-cllient.git"
      ts_git = clone_repo(ts_client_repo_url, ts_client_repo_dir)

      # Generate an updated client
      puts "Generating new client."
      Dir.chdir(ts_client_repo_dir)
      system("yarn && yarn generate -f #{swagger_path}")

      # Copy commit message from rails
      last_rails_commit = rails_git.log.first
      ts_git.add
      ts_git.commit(last_rails_commit.message, { allow_empty: true })

      # Tag and publish new package
      next_ts_tag = tag_repo(ts_git)
      if next_ts_tag
        publish_package(next_ts_tag)
      end
    end
  end
end

def swagger_changed?(git)
  swagger_changed = false

  last_commit = git.log.first
  last_tag = git.describe(last_commit.sha, { tags: true })
  last_tag = last_tag.split("-")[0] unless last_tag.nil?

  swagg_diff = git.diff("HEAD", last_tag).find { |d| /^(swagger\/)/.match(d.path) }

  if swagg_diff
    swagger_changed = swagg_diff.path
  end

  return swagger_changed
end

def clone_repo(repo, dir)
  if !File.directory?(dir)
    git = Git.clone(repo, dir, log: Logger.new("/dev/null")) # Silence logs to prevent cred leak
  else
    git = Git.open(dir, log: Logger.new("/dev/null")) # Silence logs to prevent cred leak
    git.pull
  end
  return git
end

def tag_repo(git)
  patchRegex = /#(patch)\b/m;
  minorRegex = /#(minor)\b/m;
  majorRegex = /#(major)\b/m;

  last_commit = git.log.first
  last_tag = git.describe(last_commit.sha, { tags: true })
  last_tag = last_tag.split("-")[0] unless last_tag.nil?

  if last_tag.nil?
    puts "No tags for repo. Setting initial tag 0.0.0"
    next_tag = "0.0.0"
    push_tag(next_tag, git)
    return next_tag
  end

  begin
    commit_tag = git.describe(last_commit.sha, { tags: true, exact_match: true })
  rescue Git::GitExecuteError
  end

  if commit_tag
    last_tag = commit_tag.split("-")[0]
    puts "Commit already tagged with #{last_tag}. Skipping tagging..."
    return last_tag
  end

  commit_message = last_commit.message
  major, minor, patch = last_tag.match(/\d+.\d+.\d+/)[0].split(".")
  if !!majorRegex.match(commit_message)
    next_tag = "#{major.to_i + 1}.0.0"
  elsif !!minorRegex.match(commit_message)
    next_tag = "#{major}.#{minor.to_i + 1}.0"
  elsif !!patchRegex.match(commit_message)
    next_tag = "#{major}.#{minor}.#{patch.to_i + 1}"
  end

  if !next_tag
    puts "No tagging for this commit"
  else
    push_tag(next_tag, git)
  end

  return next_tag
end

def push_tag(next_tag, git)
  puts "Tagging repo: #{next_tag}"
  git.add_tag(next_tag)
  git.push("origin", "master", { tags: true })
  puts "Tagging complete"
end

def publish_package(version)
  puts "Publishing package to npm"
  system('echo "//registry.yarnpkg.com/:_authToken=$NPM_TOKEN" >>~/.npmrc')
  system("yarn publish --non-interactive --new-version #{version}")
  puts "Publishing complete"
end