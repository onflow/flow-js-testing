# Transitions

## 0002 Depreaction of `builtInMethods` code transformer

- **Date:** Aug 8 2022
- **Type:** Depreaction of `builtInMethods` code transformer

The `builtInMethods` code transformer is now deprecated and will not be exported by the Flow JS Testing library in future versions. It is now applied by default to all cadence code processed by the Flow JS Testing library and passing this transformer manually is redundant and uncessary.

It was previously used to replace segments of cadence code related to `setBlockOffset`/`setTimestampOffset` utilties, but its implementation has now been handled internally by the Flow JS Testing library.

Please remove this transformer from all your existing `sendTransaction` & `executeScript` calls if you were using any block or timestamp offset utilities.

## 0001 Deprecate `emulator.start()` port argument

- **Date:** Jun 28 2022
- **Type:** Depreaction of `port` argument for `emulator.start()`

`emulator.start` was previously called with the arguments: `emulator.start(port, options = {})`. The `port` argument has now been removed and manual specification of the ports is no longer recommended.

However, the `adminPort`, `restPort`, and `grpcPort` of the emulator may be overriden as fields in `options` (i.e. `options.restPort = 1234`) if absolutely necessary - however their use is not advisable and may cause unintended consequences.

Instead, it is recommended omit supplying a static a port and allow flow-js-testing to automatically determine available ports to supply the emululator. Flow-js-testing will automatically configure @onflow/fcl to use these ports for all of its functionality.
