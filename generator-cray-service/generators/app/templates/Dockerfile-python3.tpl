# Use the alpine image from the DST docker registry as the base.
FROM dtr.dev.cray.com/cache/alpine:latest

# Install required packages
RUN apk add --no-cache python3

# Directory for our application.
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install required python packages
COPY requirements.txt /usr/src/app/

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /usr/src/app

# The server uses this port by default.
EXPOSE <%= servicePort %>

# The command to run.
ENTRYPOINT ["python3"]

# Arguments to the command.
CMD ["-m", "swagger_server"]

# Build-time metadata, ARGs below are replaced during pipeline build
ARG BUILD_DATE=null
ARG VCS_REF=null
ARG VERSION=dev
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="<%= serviceName %>" \
      org.label-schema.description="OpenAPI for <%= serviceName %>" \
      org.label-schema.url="http://www.cray.com/" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="<%= repoUrl %>" \
      org.label-schema.vendor="Cray Inc" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"
