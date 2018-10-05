PROJECT_NAME=mmsinterface
DC_FUNCTIONAL=docker-compose -f Docker/docker-compose/functional.yml -p $(PROJECT_NAME)
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_TEST=docker-compose -f Docker/docker-compose/test.yml -p $(PROJECT_NAME)

start: clean-dev dev-up
test: clean-test test-up functional-up

rebuild-dev: clean-dev build-up-dev
start-unit: clean-test test-up
start-functional: clean-test functional-up
start-functional-interactive: clean-test functional-up-interactive
rebuild-functional: clean-test build-up-functional
rebuild-functional-interactive: clean-test build-up-functional-interactive

clean-dev:
	${DC_DEV} rm -f

build-up-dev:
	${DC_DEV} build
	${DC_DEV} up

dev-up:
	${DC_DEV} up

clean-test:
	${DC_TEST} rm -f
	${DC_INTEGRATION} rm -f

test-up:
	${DC_TEST} up --exit-code-from interface

build-up-functional:
	./Docker/scripts/functional_test.sh --build
build-up-functional-interactive:
	./Docker/scripts/functional_test.sh --build --interactive
functional-up:
	./Docker/scripts/functional_test.sh
functional-up-interactive:
	./Docker/scripts/functional_test.sh --interactive
