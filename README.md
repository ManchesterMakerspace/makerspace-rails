# Makerspace Interface
Application to handle member management at the Manchester Makerspace.  Connects with
key fob system for facility entry and PayPal API for payment processing.

# Docker Installation
1. [Install Docker](https://docs.docker.com/compose/install/#prerequisites)
2. Configure `.env` file
See `sample.env` for required environment variables per feature.
Contact @lynch16 for variables for the Manchester Makerspace.
3. Start local server `make start-dev`
4. Application available at `http://localhost:3002`

# Local Installation
1. [Install MongoDB](https://docs.mongodb.com/manual/installation/)
2. Spin up mongodb on default port 27017 and create a database
```
$ mongod &
$ mongo
>use <db_name>
>quit()
```
3. Fork and clone repository
4. Install Ruby dependencies
```
$ ruby -v
$ gem install bundler
$ bundle install
```
5. Install JS dependencies
```
$ npm -v
$ npm install
```
6. Configure `.env` file
See `sample.env` for required environment variables per feature.
Contact @lynch16 for variables for the Manchester Makerspace.
7. Spin up rails server
```
$ rails s
```

# Importing an archived db
Note: Need to have the same name for source and target db for this to work.
```
mongorestore --host <host:port> -d <target_db> --username <name> --password <password> --archive=<path>
```
If need to change db names, allegedly you can use --nsInclude but I haven't had success.  Instead, I restored to the same named db then dumped that db into a folder instead of an archive, and then used the following:
```
mongorestore --db <target_db> -h <host:port> --username <name> --password <password> <folder_path>/<source_db_name>/

```

# Testing
Rspec is used for unit testing the ruby backend.  Can be run with Docker using Make.
```
$ make start-unit
```
Selenium integration tests using Protractor can also be run with Docker using Make.
```
$ make start-integration
```
Test both together with `make test`

# CONTRIBUTIONS

Bug reports and pull requests are welcome on GitHub at https://github.com/ManchesterMakerspace/makerspace-interface. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Contributor Covenant code of conduct.

All pull requests require Travis CI tests to pass before being merged.

# LICENSE

The app is available as open source under the terms of the MIT License.
