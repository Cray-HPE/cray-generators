#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose

this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

cd "$this_dir/../"
existing_bridge=$(docker network ls --filter name=^craypc\-generators$ --quiet)
if [ -z "$existing_bridge" ]; then
  docker network create -d bridge craypc-generators
fi

exited_container=$(docker ps -a --filter name=^craypc\-generators$ --filter status=exited --quiet)
if [ ! -z "$exited_container" ]; then
  docker rm craypc-generators &> /dev/null
fi
if [ -z "$(docker ps -a --filter name=^craypc\-generators$ --quiet)" ]; then
  docker build -f .craypc/dockerfiles/generators/Dockerfile -t craypc/generators .
  docker run --network craypc-generators -d --name craypc-generators \
    -v "${CRAYPC_VOLUME:-cray-generators}:/opt/cray-generators" \
    -v "/opt/cray-generators/node_modules" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    craypc/generators:latest tail -f /dev/null
fi

exited_container=$(docker ps -a --filter name=^craypc\-generators-swagger-codegen$ --filter status=exited --quiet)
if [ ! -z "$exited_container" ]; then
  docker rm craypc-generators-swagger-codegen-cli &> /dev/null
fi
if [ -z "$(docker ps -a --filter name=^craypc\-generators\-swagger\-codegen\-cli$ --quiet)" ]; then
  docker build -f .craypc/dockerfiles/generators-swagger-codegen-cli/Dockerfile -t craypc/generators-swagger-codegen-cli .
  docker run --network craypc-generators -d --name craypc-generators-swagger-codegen-cli \
    -v "${CRAYPC_VOLUME:-cray-generators}:/opt/cray-generators" \
    craypc/generators-swagger-codegen-cli:latest tail -f /dev/null
fi
