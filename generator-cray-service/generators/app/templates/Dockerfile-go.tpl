# Debian image with latest Go version
FROM golang

# Create and set working directory
RUN mkdir -p /go/src/<%= serviceName %>
WORKDIR /go/src/<%= serviceName %>

# Copy repo files to working directory
ADD . /go/src/<%= serviceName %>

# Go download packages and dependencies
RUN go get github.com/go-openapi/errors
RUN go get github.com/go-openapi/loads
RUN go get github.com/go-openapi/runtime
RUN go get github.com/docker/go-units
RUN go get github.com/go-openapi/validate
RUN go get github.com/jessevdk/go-flags

# Build service
RUN go build ./cmd/golang-microservice-server

# Run sample app service exposing port <%= servicePort %>
CMD ["./golang-microservice-server", "--scheme=http", "--port=<%= servicePort %>", "--host=0.0.0.0"]
EXPOSE <%= servicePort %>
