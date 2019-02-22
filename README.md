# Generators for Cray Projects

To run generators, there are three local machine requirements:

* A *nix system
* [Docker installed](https://docs.docker.com/install/)
* [yq](https://github.com/mikefarah/yq) (not to be confused with Python's yq)


The recommended way to run generators from your machine is using the [`craypc`](https://stash.us.cray.com/projects/CLOUD/repos/craypc/browse) tool:

1. Install [`craypc`](https://stash.us.cray.com/projects/CLOUD/repos/craypc/browse/README.md)
2. Run the `craypc` tool for generators:

```
craypc generators ...
```

## The following generators are available

* **`cray-service`**: if you're starting a new project for an internal Cray service/API, or if you need to update an existing service with Cray standard resources
* **`cray-generator`**: A generator for creating a new Cray generator, in an oh-so meta way

You can run these generators by:

```
craypc generators generate <generator name>
```

The above will kick off a process that will ask you some questions to generate what you need in your given project. For help on the `generate` command and available generator names:

```
craypc generators generate help
```

## Development on the Project

Requirements:

* Git >= 2.9

After cloning this repo locally to your machine, you'll want to initialize

## Starting New Generators

You'll want a local clone for this, then you can run the generate command from the clone:

```
./generate cray-generator
```

Run the above, it'll ask you some questions, and then create a new named generator directory here. You can then begin development on the generator itself locally. Refer to the README in the newly-created generator for more info on developing it out.

