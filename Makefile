PROJECT_NAME=mmsinterface
DC_FUNCTIONAL=docker-compose -f Docker/docker-compose/functional.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start-dev: build-up-dev
start-unit: clean-test test-up
start-functional: clean-test functional-up
rebuild-functional: clean-test build-up-functional
test: clean-test test-up functional-up

build-up-dev:
	${DC_DEV} rm -f
	${DC_DEV} build
	${DC_DEV} up

clean-test:
	${DC_TEST} rm -f
	${DC_INTEGRATION} rm -f

test-up:
	@${DC_TEST} up --exit-code-from interface

build-up-functional:
	@${DC_FUNCTIONAL} up --build --exit-code-from tester
functional-up:
	@${DC_FUNCTIONAL} up --exit-code-from tester
