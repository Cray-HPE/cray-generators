#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose, and we're pushing appropriately with Jenkins

# temporary location until we can get dtr.dev.cray.com/craypc up
image_repo="dtr.dev.cray.com/pforce"

return_dir=$(pwd)
this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

cd $this_dir

# TODO: Somehow the below might translate to what we'll do for the generic pipeline, not sure how in auto-detecting versions
# from other places in code or not, probably will end up being explicitly set though, or providing the project the ability
# to write a method to pull versions or something like that
generators_version=$(cat ../package.json | grep '"version":' | awk -F ':' '{print $2}' | awk -F '"' '{print $2}')
swagger_codgen_version=$(cat dockerfiles/generators-swagger-codegen-cli/Dockerfile | grep 'FROM swaggerapi/' | awk -F ':' '{print $2}' | awk '{print $1}')

CRAYPC_IMAGE_REPO="$image_repo" docker-compose build
docker tag $image_repo/generators:latest $image_repo/generators:$generators_version
docker tag $image_repo/generators-swagger-codegen-cli:latest $image_repo/generators-swagger-codegen-cli:$swagger_codgen_version
docker push $image_repo/generators:latest
docker push $image_repo/generators:$generators_version
docker push $image_repo/generators-swagger-codegen-cli:latest
docker push $image_repo/generators-swagger-codegen-cli:$swagger_codgen_version

cd $return_dir
