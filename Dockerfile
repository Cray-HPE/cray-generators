FROM node:8
RUN npm -g install yo
ADD generator-cray-docker-generator generator-cray-docker-generator
ADD node_config/configstore_update-notifier-npm.json /home/node/.config/configstore/update-notifier-npm.json
ADD node_config/insight-nodejs_insight-yo.json /home/node/.config/insight-nodejs/insight-yo.json
RUN chown -R node /home/node/.config
WORKDIR generator-cray-docker-generator
RUN npm install -g
RUN mkdir /workdir
VOLUME [ "/workdir" ]
USER node
WORKDIR /workdir
SHELL [ "/bin/bash", "-c"]
ENTRYPOINT [ "/usr/local/bin/yo", "cray-docker" ] 
