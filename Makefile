DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml
DC_TEST=docker-compose -f Docker/docker-compose/test.yml

start-dev: clean-dev build-up-dev
start-integration: clean-integration build-up-integration
test: clean-test build-up-test build-up-integration

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
	${DC_TEST} up

clean-integration:
	${DC_INTEGRATION} kill
	${DC_INTEGRATION} rm -f

build-up-integration:
	${DC_INTEGRATION} build
	${DC_INTEGRATION} up
