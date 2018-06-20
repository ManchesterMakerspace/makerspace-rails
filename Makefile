PROJECT_NAME=mmsinterface
DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start-dev: clean-dev build-up-dev
start-integration: clean-integration build-up-integration
test: clean-test build-up-test

clean-dev:
	${DC_DEV} kill
	${DC_DEV} rm -f

build-up-dev:
	${DC_DEV} build
	${DC_DEV} up

clean-test:
	${DC_TEST} kill
	${DC_TEST} rm -f

build-up-test:
	${DC_TEST} build
	@echo 'Intializing...'
	${DC_TEST} up $(printenv | grep -E '^CI_' | sed 's/CI_/-e /g')

clean-integration:
	${DC_INTEGRATION} kill
	${DC_INTEGRATION} rm -f

build-up-integration:
	${DC_INTEGRATION} build
	@echo 'Intializing...'
	@${DC_INTEGRATION} up $(printenv | grep -E '^CI_' | sed 's/CI_/-e /g')

integration-down:
	${DC_INTEGRATION} down
