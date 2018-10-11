#!/bin/bash
# set -e

PROJECT_NAME=mmsinterface
INTERACTIVE=FALSE
LOCAL=FALSE
start() {
  INTERACTIVE=${INTERACTIVE} LOCAL=${LOCAL} docker-compose -f Docker/docker-compose/functional.yml -p ${PROJECT_NAME} ${@}
}

for argument in "$@"; do
    case $argument in
        --build)
            BUILD=TRUE
            shift
            ;;
        --interactive)
            INTERACTIVE=TRUE
            shift
            ;;
        --local)
            LOCAL=TRUE
            shift
            ;;
        *)
            echo "# ERROR: invalid argument $argument"
            exit 1
            ;;
    esac
done

cleanup(){
    exit_code=$?
    echo "# Closing docker" && start down -v --remove-orphans
    exit $exit_code
}

trap 'cleanup' EXIT
if [ "${BUILD}" == "TRUE" ]; then
  start up --build --exit-code-from tester
else
  start up --exit-code-from tester
fi
