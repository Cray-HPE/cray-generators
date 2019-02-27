#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose

this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

uid="$1"

cd "$this_dir/../"
docker network create -d bridge cpcgen-$uid

# remove any exited containers
docker rm $(docker ps -a --filter name=^cpcgen\- --filter status=exited --quiet) &> /dev/null

docker build -f .craypc/dockerfiles/generators/Dockerfile -t craypc/generators:$uid .
docker run --network cpcgen-$uid -d --name cpcgen-$uid \
    -e CRAY_GENERATOR_SWAGGER_CODEGEN_CONTAINER="cpcgen-cg-$uid" \
    -v "cray-generators:/opt/cray-generators" \
    -v "/opt/cray-generators/node_modules" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    craypc/generators:$uid tail -f /dev/null

docker build -f .craypc/dockerfiles/generators-swagger-codegen-cli/Dockerfile -t craypc/generators-swagger-codegen-cli:$uid .
docker run --network cpcgen-$uid -d --name cpcgen-cg-$uid \
  -v "cray-generators:/opt/cray-generators" \
  craypc/generators-swagger-codegen-cli:$uid tail -f /dev/null
