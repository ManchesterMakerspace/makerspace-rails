# Makerspace Rails
Application to handle member management at the Manchester Makerspace.  Connects with
key fob system for facility entry and PayPal API for payment processing.

# Development

1. Configure `.env` file
See `sample.env` for required environment variables per feature.
Contact @lynch16 for variables for the Manchester Makerspace.
2. Spin up rails server
```
$ rails s
```

# Importing an archived db
Note: Need to have the same name for source and target db for this to work.
```
mongorestore --host <host:port> -d <target_db> --username <name> --password <password>
```
If need to change db names, allegedly you can use --nsInclude but I haven't had success.  Instead, backup the db to a local folder, rename the db folder at <folder_path>/<source_db_name>, and then used the following:
```
mongorestore --db <target_db> -h <host:port> --username <name> --password <password> <folder_path>/<target_db_name>/

```

# Testing
Rspec is used for unit testing the ruby backend.
```
$ rspec
```
Selenium integration tests for the [makerspace-react](https://github.com/ManchesterMakerspace/makerspace-react) can be run with
```
$ rake integration
```
Emails in the development environment are published to MailTrap under the adgrants@ user in Lastpass. To preview emails, you can view them in the browser by starting a server with `TEST_MAIL=true rails s`; this will start a development server, which will preview emails, using a test database to hydrate values for all the mocks. If you need to test that the emails actually sent, you may use `MAILTRAP_API_TOKEN` environment variable in the development environment. 

# Swagger
An OpenSwagger spec of the JSON API can be generated or updated with `rake rswag:specs:swaggerize`. To view an interactive version of this swagger, start a development server with `rails s` and navigate to `/api-docs`

# CONTRIBUTIONS

Bug reports and pull requests are welcome on GitHub at https://github.com/ManchesterMakerspace/makerspace-interface. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Contributor Covenant code of conduct.

All pull requests require Travis CI tests to pass before being merged.

# LICENSE

The app is available as open source under the terms of the MIT License.
