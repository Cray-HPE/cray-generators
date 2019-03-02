# `cray-service` generator

Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources

The intention of the generator is to be able to create a new service/API at Cray, with the following resources:
* Initial set of development files, including Swagger spec template, etc.
* Standard Cray Jenkins-related resources for building, testing, etc.
* Kubernetes/Helm templates and resources files for being able to deploy the service to a cluster
