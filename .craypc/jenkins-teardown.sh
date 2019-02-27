#!/bin/bash

# TODO: remove this file when we have a Jenkins build agent with docker-compose

this_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

uid="$1"

docker rm -f cpcgen-$uid || true
docker rm -f cpcgen-cg-$uid || true
docker network rm cpcgen-$uid || true
