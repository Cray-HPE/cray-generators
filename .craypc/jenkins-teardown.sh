#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose

this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [ ! -z "$(docker ps -a --filter name=^craypc\-generators$ --quiet)" ]; then
  docker rm -f craypc-generators
fi

if [ ! -z "$(docker ps -a --filter name=^craypc\-generators-swagger-codegen-cli$ --quiet)" ]; then
  docker rm -f craypc-generators-swagger-codegen-cli
fi

cd "$this_dir/../"
existing_bridges=$(docker network ls --filter name=^craypc\-generators$ --quiet)
if [ ! -z "$existing_bridges" ]; then
  for existing_bridge in $existing_bridges; do
    docker network rm $existing_bridge
  done
fi

if [[ "$1" == "images" ]]; then
  if [ ! -z "$(docker images 'craypc/generators' --quiet)" ]; then
    docker rmi craypc/generators
  fi
  if [ ! -z "$(docker images 'craypc/generators-swagger-codegen-cli' --quiet)" ]; then
    docker rmi craypc/generators-swagger-codegen-cli
  fi
fi