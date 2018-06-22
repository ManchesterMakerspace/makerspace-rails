PROJECT_NAME=mmsinterface
DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start-dev: build-up-dev
start-integration: clean-test build-up-integration
test: clean-test build-up-test build-up-integration
test-fast: clean-test test-up integration-up

build-up-dev:
	${DC_DEV} rm -f
	${DC_DEV} build
	${DC_DEV} up

clean-test:
	${DC_TEST} rm -f
	${DC_INTEGRATION} rm -f

test-up:
	@${DC_TEST} up --exit-code-from interface

build-up-test:
	${DC_TEST} build
	@echo 'Intializing...'
	@${DC_TEST} up --exit-code-from interface

build-up-integration:
	${DC_INTEGRATION} build
	@echo 'Intializing...'
	@${DC_INTEGRATION} up --exit-code-from tester

integration-up:
	@${DC_INTEGRATION} up --exit-code-from tester
