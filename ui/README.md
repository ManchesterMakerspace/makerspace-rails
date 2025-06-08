# Makerspace React

A frontend UI to integrate with [makerspace-rails](https://github.com/ManchesterMakerspace/makerspace-rails), built on React/Redux. 

## Development

You can start a webpack-dev-server on localhost:3035 via `yarn && yarn start`. By default, the UI will proxy `/api` routes to localhost:3002 for the 
API endpoints in a `development` environment. This can be configured via the `API_DOMAIN` environment variable. Since this UI is expected to run on the 
API's server, it uses relative paths in `production`.  If you want to use an absolute API path in `production`, configure the build with `BASE_URL`.

## Testing

Tests are currently written as Jest selenium tests using a mocked backend via `mockserver-client`. It would be better to write unit tests with `react-testing-library` 
since selenium can be flaky. There are also integration tests for the real API written in Jest selenium.

## Automation

Branch pushes and PRs trigger Selenium Jest functional tests via TravisCI.

New versions can be cut by appending commit messages with `#patch`, `#minor`, or `#major`.  Without those strings, a new commit will not trigger a release. 
When a relase triggers, a duplicate version of [makerspace-react-rails](https://github.com/ManchesterMakerspace/makerspace-react-rails) will be published 
to RubyGems so the Rails server can consume it.

# CONTRIBUTIONS

Bug reports and pull requests are welcome on GitHub at https://github.com/ManchesterMakerspace/makerspace-react. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Contributor Covenant code of conduct.

All pull requests require Travis CI tests to pass before being merged.

# LICENSE

The app is available as open source under the terms of the MIT License.
