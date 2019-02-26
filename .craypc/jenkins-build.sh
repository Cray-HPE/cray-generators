#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose, and we're pushing appropriately with Jenkins

return_dir=$(pwd)
this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

cd $this_dir
docker-compose build generators generators-swagger-codegen-cli
IMAGE_TAG=latest docker-compose build generators generators-swagger-codegen-cli
docker-compose push generators generators-swagger-codegen-cli
IMAGE_TAG=latest docker-compose push generators generators-swagger-codegen-cli

cd $return_dir
