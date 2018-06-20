DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml

start-dev: clean-dev build-up-dev
start-integration: clean-integration build-up-integration

clean-dev:
	${DC_DEV} kill
	${DC_DEV} rm -f

build-up-dev:
	${DC_DEV} build
	${DC_DEV} up

test:

clean-integration:
	${DC_INTEGRATION} kill
	${DC_INTEGRATION} rm -f

build-up-integration:
	${DC_INTEGRATION} build
	${DC_INTEGRATION} up
