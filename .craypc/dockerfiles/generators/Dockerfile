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

VOLUME [ "/opt-cray-generators" ]
WORKDIR /opt/cray-generators
USER node
CMD [ "/bin/sh" ]
