FROM node:8
RUN npm -g install yo
ADD generator-cray-docker-generator generator-cray-docker-generator
WORKDIR generator-cray-docker-generator
RUN npm link
RUN mkdir /workdir
VOLUME [ "/workdir", "/root/.config" ]
WORKDIR /workdir
ENTRYPOINT [ "/usr/local/bin/yo", "cray-docker-generator" ] 
