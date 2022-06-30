# Transitions

## 0001 Deprecate `emulator.start()` port argument

- **Date:** Jun 28 2022
- **Type:** Depreaction of `port` argument for `emulator.start()`

`emulator.start` was previously called with the arguments: `emulator.start(port, options = {})`. The `port` argument has now been removed and manual specification of the ports is no longer recommended.

However, the `adminPort`, `restPort`, and `grpcPort` of the emulator may be overriden as fields in `options` (i.e. `options.restPort = 1234`) if absolutely necessary - however their use is not advisable and may cause unintended consequences.

Instead, it is recommended omit supplying a static a port and allow flow-js-testing to automatically determine available ports to supply the emululator. Flow-js-testing will automatically configure @onflow/fcl to use these ports for all of its functionality.
