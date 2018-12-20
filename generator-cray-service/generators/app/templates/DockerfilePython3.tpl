## Cray Artifact Repository Service Dockerfile
## Copyright 2018, Cray Inc. All rights reserved.

# Create 'base' image target
FROM dtr.dev.cray.com:443/cache/nginx:1.13.12-alpine as base
WORKDIR /app
EXPOSE 80
RUN apk update
ONBUILD RUN apk update
RUN apk add gcc musl-dev python3-dev python3 py-gunicorn
RUN mkdir -p /app/<%= projectName %>
ADD requirements.txt constraints.txt /app/
RUN pip3 install --upgrade pip
RUN pip3 install --no-cache-dir -r /app/requirements.txt -c constraints.txt
COPY <%= projectName %>/ /app/<%= projectName %>/

# Run unit tests
FROM base as testing
ADD requirements-test.txt /app/
RUN pip3 install -r /app/requirements-test.txt -c constraints.txt
COPY tests /app/tests
ARG FORCE_TESTS=null

# Currently, with only the framework code in place, tests can't reach
# a few cases that will be reached once we have real code in place.
# Test coverage is about 93%.  Bump that up once we have more
# functionality...
RUN pytest -W ignore::DeprecationWarning --cov=tests --cov-append --cov-config=.coveragerc --cov-report= --cov-fail-under=93 /app/tests

# Run code style checkers
FROM testing as codestyle
ADD .pycodestyle /app/
ARG FORCE_STYLE_CHECKS=null
RUN pycodestyle --config=/app/.pycodestyle /app/<%= projectName %> || true

# Run linting tests
FROM testing as lint
ADD .pylintrc /app/
RUN cd <%=projectName %> && pylint || true


# Build Application Image
FROM base as application

# App-only dependencies
RUN apk add uwsgi-python3

# Route nginx server logs to stdout/err
RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
RUN mkdir -p /var/log/<%= projectName %>

# Application and proxy server configuration
COPY config/uwsgi.ini config/entrypoint.sh /app/
COPY config/nginx.conf /etc/nginx/

ENTRYPOINT ["/app/entrypoint.sh"]