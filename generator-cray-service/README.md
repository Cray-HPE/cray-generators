# `cray-service` generator

Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources

The intention of the generator is to be able to create a new service/API at Cray or update and existing service with the following auto-generated resources:
* Swagger codegenerated API code, including Swagger spec template, etc.
* Standard Cray DST Jenkins-related resources for building, testing, etc.
* Kubernetes/Helm templates and resources files for being able to deploy the service to a cluster
* Support for automating CLI integration

This service generator will ask some questions, including the Stash location of your service repository. It will clone your repository locally, make changes in this local clone based on your answers, push up a branch and automatically submit a pull request on your Stash repository.
