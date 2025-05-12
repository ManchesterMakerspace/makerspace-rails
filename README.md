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

## With Docker

1. Install [Docker](https://docs.docker.com/get-started/get-docker/)
2. Run `docker compose up` in the repo directory. Will take several minutes on the first run.
3. Visit http://localhost:3000
4. **To stop the server:** `docker compose down`
5. **To open a Rails console:** `docker compose exec web rails console`
6. **To open a [Mongo console](https://www.mongodb.com/docs/mongodb-shell/):** `docker compose exec db mongosh admin`

# Importing an archived db or Restoring production to development
First dump production to a local backup folder
```
mongodump --uri "<uri for prod db>" -o ./dump
```
Then restore to development server
```
mongorestore --uri "<uri for dev db>" dump/ --drop
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
