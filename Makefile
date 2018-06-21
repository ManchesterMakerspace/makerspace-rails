PROJECT_NAME=mmsinterface
DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start-dev: build-up-dev
start-integration: build-up-integration
test: build-up-test build-up-integration

build-up-dev:
	${DC_DEV} rm -f
	${DC_DEV} build
	${DC_DEV} up

build-up-test:
	${DC_TEST} rm -f
	${DC_TEST} build
	@echo 'Intializing...'
	@${DC_TEST} up

build-up-integration:
	${DC_INTEGRATION} rm -f
	${DC_INTEGRATION} build
	@echo 'Intializing...'
	@${DC_INTEGRATION} up
