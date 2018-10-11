PROJECT_NAME=mmsinterface
DC_FUNCTIONAL=docker-compose -f Docker/docker-compose/functional.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start: clean-dev dev-up
test: clean-test test-up functional-up

rebuild-dev: clean-dev build-up-dev
start-unit: clean-test test-up
start-func: clean-test functional-up
start-func-dev: clean-test functional-up-interactive
start-func-local: clean-test functional-up-interactive-local

rebuild-func: clean-test build-up-functional
rebuild-func-dev: clean-test build-up-functional-interactive
rebuild-func-local: clean-test build-up-functional-interactive-local

clean-dev:
	${DC_DEV} rm -f

build-up-dev:
	${DC_DEV} build
	${DC_DEV} up

dev-up:
	${DC_DEV} up

clean-test:
	${DC_TEST} rm -f
	${DC_FUNCTIONAL} rm -f

test-up:
	${DC_TEST} up --exit-code-from interface

functional-up:
	./Docker/scripts/functional_test.sh
build-up-functional:
	./Docker/scripts/functional_test.sh --build
functional-up-interactive:
	./Docker/scripts/functional_test.sh --interactive
build-up-functional-interactive:
	./Docker/scripts/functional_test.sh --build --interactive
functional-up-interactive-local:
	./Docker/scripts/functional_test.sh --interactive --local
build-up-functional-interactive-local:
	./Docker/scripts/functional_test.sh --build --interactive --local


# These functions are for running Yarn functional tests manually with docker interactive containers.
# Can be used with Docker or Local Selenium instance.
# The yarn environment also sets the mockserver-client and test environment.  If Selenium is running locally, we need
# to set APP to the local domain because they are in the same scope and vice versa.  However, MOCKSERVER is
# always set to the local domain because it is scoped to yarn, which is running locally in.
MOCKSERVER_DOMAIN=0.0.0.0
SELENIUM_ADDRESS=http://0.0.0.0:4444/wd/hub
APP_DOCKER_DOMAIN=interface
APP_LOCAL_DOMAIN=0.0.0.0
FUNC_INT_DOCKER=bash -c "SELENIUM_ADDRESS=${SELENIUM_ADDRESS} MOCKSERVER_DOMAIN=${MOCKSERVER_DOMAIN} APP_DOMAIN=${APP_DOCKER_DOMAIN} yarn test-functional"
FUNC_INT_LOCAL=bash -c "MOCKSERVER_DOMAIN=${MOCKSERVER_DOMAIN} APP_DOMAIN=${APP_LOCAL_DOMAIN} yarn test-functional"
test-functional:
	${FUNC_INT_DOCKER}
test-functional-local:
	${FUNC_INT_LOCAL}
