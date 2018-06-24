PROJECT_NAME=mmsinterface
DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start-dev: build-up-dev
start-unit: clean-test test-up
start-integration: clean-test integration-up
test: clean-test test-up integration-up

build-up-dev:
	${DC_DEV} rm -f
	${DC_DEV} build
	${DC_DEV} up

clean-test:
	${DC_TEST} rm -f
	${DC_INTEGRATION} rm -f

test-up:
	@${DC_TEST} up --exit-code-from interface

integration-up:
	@${DC_INTEGRATION} up --exit-code-from tester
