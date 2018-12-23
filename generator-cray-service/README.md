# `cray-service` generator

Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources

This generator is currently based on the following resources:
* https://connect.us.cray.com/confluence/display/DST/Pipeline+Standards+for+Docker+Builds
* https://connect.us.cray.com/confluence/pages/viewpage.action?pageId=100295358

The intention of the generator is to be able to create a new service/API at Cray, with the following resources:
* Initial set of development files, including Swagger spec template, etc.
* Standard Cray Jenkins-related resources for building, testing, etc.
* Kubernetes/Helm templates and resources files for being able to deploy the service to a cluster

## Usage

```
./generate cray-service [--sections=<service,kubernetes>]
```

The above will ask you some questions, generate/update files accordingly, and push a new branch up to your repo so you can open a pull request