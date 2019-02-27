######## base ########
FROM node:10-alpine AS base

RUN apk add --no-cache git docker

####### dependencies ########
FROM base AS dependencies

RUN mkdir /opt/cray-generators
COPY ./package.json /opt/package.json
COPY . /opt/cray-generators
WORKDIR /opt
RUN npm install --no-package-lock
COPY .craypc/dockerfiles/generators/links.sh /usr/local/bin/links.sh
RUN chmod +x /usr/local/bin/links.sh && /usr/local/bin/links.sh
ENV PATH /opt/node_modules/.bin:$PATH
ENV NODE_PATH /opt/cray-generators:/opt/node_modules
RUN chown -R node:node /opt/cray-generators

######## craypc-generators #########
FROM dependencies as craypc-generators

# Used by craypc to download/use additional stable assets from the master branch of the repo
# TODO: we're going to work towards a model where artifacts will be published to expected locations,
#       but the below is how we'll ensure that craypc can put the pieces together of where to clone
#       the relevant repo and pull in the resources needed other than container images
LABEL "stash.project"="CLOUD"
LABEL "stash.repo"="cray-generators"
LABEL "stash.branch"="master"
# any additional containers that need to be pulled
LABEL "registry.containers"="generators-swagger-codegen-cli"

VOLUME [ "/opt/cray-generators" ]
WORKDIR /opt/cray-generators
USER node
CMD [ "/bin/sh" ]
