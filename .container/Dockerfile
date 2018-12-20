######## base ########
FROM node:10-alpine AS base

RUN apk add --no-cache git
RUN mkdir /cray-generators

######## dependencies ########
FROM base AS dependencies

RUN npm install -g yo
COPY . /cray-generators/
WORKDIR /cray-generators
RUN npm install --only=production --no-package-lock
RUN /cray-generators/.container/links
RUN chown -R node:node /cray-generators

######## cray-generator #########
FROM dependencies as cray-generator

USER node
CMD [ "/bin/sh" ]