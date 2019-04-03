######## generators-swagger-codegen-cli ########
FROM swaggerapi/swagger-codegen-cli:2.4.1 as generators-swagger-codegen-cli

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node

USER node

VOLUME [ "/opt/cray-generators" ]
ENTRYPOINT []
CMD [ "/bin/sh" ]
