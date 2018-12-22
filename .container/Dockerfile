######## base ########
FROM node:10-alpine AS base

RUN apk add --no-cache git

######## dependencies ########
FROM base AS dependencies

RUN mkdir /opt/cray-generators
COPY ./package.json /opt/package.json
COPY . /opt/cray-generators
WORKDIR /opt
RUN npm install --no-package-lock
RUN /opt/cray-generators/.container/links
ENV PATH /opt/node_modules/.bin:$PATH
ENV NODE_PATH /opt/cray-generators:/opt/node_modules

RUN mkdir /repos
RUN chown -R node:node /opt/cray-generators && \
    chown -R node:node /repos

######## cray-generator #########
FROM dependencies as cray-generator

VOLUME [ "/opt/cray-generators" ]
WORKDIR /opt/cray-generators
USER node
CMD [ "/bin/sh" ]