# Generators for Cray Projects

To begin, clone this repo and make sure you're on the master branch:

```
git clone https://stash.us.cray.com/scm/cloud/cray-generators.git
git checkout master
```

To run generators, there are really only two local machine requirements:

* A *nix system
* [Docker installed](https://docs.docker.com/install/)

## The following generators are available

* **`cray-service`**: if you're starting a new project for an internal Cray service/API, or if you need to update an existing service with Cray standard resources
* **`cray-generator`**: A generator for creating a new Cray generator, in an oh-so meta way

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

