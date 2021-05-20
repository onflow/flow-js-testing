# JavaScript Testing Framework for Flow Network

This repository contains utility methods which, in conjunction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps with Cadence.

## Requirements

### Node

We are assuming you are using this framework under Node environment. You will need at least version **12.0.0**

### Emulator

Most of the methods will not work, unless you have Flow Emulator running in the background.
You can install it alongside Flow CLI. Please refer to [Install Flow CLI](https://docs.onflow.org/flow-cli/install)
for instructions.

If you have it already installed, run the `flow init` in your terminal to create `flow.json` config file.
Then start the emulator with `flow emulator -v`.

## Documentation
- [Installation](/docs/installation.md)
- [API](/docs/api.md)
- Examples
  - [Basic Usage](/docs/examples/basic.md)
  - [Pass Metadata](/docs/examples/metadata.md)

## Playground Integration

Every Playground project has the ability to `export` it's content as a set of files with Cadence template code and
basic test environment "out of the box".

If you want to use this functionality:

- Press "Export" button in the top right corner
- Pick the name of the project - or keep auto-generated version
- Press "Export" button within popup window

Playground will create a `zip` file for you, which you can save wherever you like.
