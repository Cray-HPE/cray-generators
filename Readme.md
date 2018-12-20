# Generators for Cray Projects

The following generators are available:

1. [`cray-service`](generator-cray-service/): if you're starting a new project for an internal Cray service/API, or if you need to update an existing service with Cray standard resources

There are only two local requirements for generating (TODO: remove *nix requirement, maybe Docker too):

1. A *nix system
2. [Docker installed](https://docs.docker.com/install/)

Then,

```
./generate <generator name>
```

The above will kick off a process that will ask you some questions to generate what you need in your given project. For help on the `generate` command and available generator names:

```
./generate help
```

## Developing New Generators

TODO: fill this out

