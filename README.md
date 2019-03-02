# Generators for Cray Projects

### Running Generators

Local machine requirements:

* [`craypc` and it's requirements](https://stash.us.cray.com/projects/CLOUD/repos/craypc/browse/README.md)

Once `craypc` is installed, you can get further help:

```
craypc generators help
```

### The following generators are available

* **`cray-service`**: if you're starting a new project for an internal Cray service/API, or if you need to update an existing service with Cray standard resources
* **`cray-generator`**: A generator for creating a new Cray generator, in an oh-so meta way

You can run these generators by:

```
craypc generators generate [generator name]
```

The above will kick off a process that will ask you some questions to generate what you need in your given project. For help on the `generate` command and available generator names:

```
craypc generators generate help
```

## Developing

### Working with the generators here

See each of the individual generator directories for more info on working with them, developing them:

* [`generator-cray-generator`](generator-cray-generator/): for creating new generators here
* [`generator-cray-service`](generator-cray-service/): generator for cray services, swagger codegen, helm charts, cli integration, etc.

### Starting New Generators

You'll want a local clone for this, then run from within the clone:

```
craypc local generate cray-generator
```

Run the above, it'll ask you some questions, and then create a new named generator directory here. You can then begin development on the generator itself locally. Refer to the README in the newly-created generator for more info on developing it out.

