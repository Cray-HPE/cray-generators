# Generators for Cray Projects

The following generators are available:

* **`cray-service`**: if you're starting a new project for an internal Cray service/API, or if you need to update an existing service with Cray standard resources
* **`cray-generator`**: A generator for creating a new Cray generator, in an oh-so meta way

There are only two local requirements for generating (TODO: remove *nix requirement, maybe Docker too):

* A *nix system
* [Docker installed](https://docs.docker.com/install/)

Then,

```
./generate <generator name>
```

The above will kick off a process that will ask you some questions to generate what you need in your given project. For help on the `generate` command and available generator names:

```
./generate help
```

## Developing New Generators

```
./generate cray-generator
```

Run the above, it'll ask you some questions, and then create a new named generator directory here. You can then begin development on the generator itself locally. Refer to the README in the newly-created generator for more info on developing it out.

