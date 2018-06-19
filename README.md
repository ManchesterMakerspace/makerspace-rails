# README
This is an interface to review which members are signed off on which stations.  This can be expanded to handle the access points.  If logged in (feature for officers & admin), you can also see member expiration dates and renew members.  

Entry point is config.ru.
"app" folder contains MVC framework.
config/routes.rb contains routes for MVC.

# Importing an archived db
Note: Need to have the same name for source and target db for this to work.

```
mongorestore --host <host:port> -d <target_db> --username <name> --password <password> --archive=<path>
```
If need to change db names, allegedly you can use --nsInclude but I haven't had success.  Instead, I restored to the same named db then dumped that db into a folder instead of an archive, and then used the following:
```
mongorestore --db <target_db> -h <host:port> --username <name> --password <password> <folder_path>/<source_db_name>/

```

# INSTALLATION
Must have MongoDB makerauth running on localhost:27017.

Clone to local, cd into repo.

run: bundle install  #Bundler is Ruby library that will install and load all required libraries for this app.

run: rails s or rails server #Ruby on Rails server defaults to port 3000. Application will be immediately viewable at localhost:3000.

# CONTRIBUTIONS

Bug reports and pull requests are welcome on GitHub at https://github.com/ManchesterMakerspace/makerspace-interface. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Contributor Covenant code of conduct.

#LICENSE

The app is available as open source under the terms of the MIT License.
