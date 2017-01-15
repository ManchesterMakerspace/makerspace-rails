namespace :db do
  desc "This task backs up the Mongo DB to local dump as compressed gzip."
  task :backup do
    sh("mongodump --db makerauth --collection members --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/memberBackup#{Time.now.strftime('%s%L')}.gzip")
  end
end
