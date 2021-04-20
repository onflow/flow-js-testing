# JavaScript Testing Framework for Flow
This repository contains utility methods that, in conjunction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps in Cadence.

# Emulator Setup
Most of the methods will not work, unless you have Flow Emulator running in the background.
You can install it alongside Flow CLI. Please refer to [Install Flow CLI](https://docs.onflow.org/flow-cli/install) 
for instructions.

If you have it already installed, run the `flow init` in your terminal to create `flow.json` config file.
Then start the emulator with `flow emulator`.

# Basic usage
> We are assuming you are using this framework under Node environment. You will need at least version **12.0.0** 

Before using any of the methods you need to `init` the framework, basically telling where you Cadence
code will live. In example below, we put all the Cadence code in the folder named `cadence` one level above the place
where you project script is located.

```javascript
const basePath = path.resolve(__dirname, "../cadence");
```

## Utilities
Utilities are grouped by domain.
### Accounts

#### getAccountAddress(name: string)
Will try to resolve name - represented as string - to a Flow address (`0x` prefixed).
If account with specific name does not exist on the `ledger` - framework will create new account and assign provided alias to it.
Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first
and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.
```javascript
import { getAccountAddress } from "flow-js-testing/dist";

// ...

const Alice = await getAccountAddress("Alice");
```

### Contracts

### Transactions and Scripts
### Scripts 

### Core - FlowToken

# Playground Integration
Every Playground project has the ability to `export` it's content as a set of files with Cadence template code and
basic test environment "out of the box".

If you want to use this functionality:
- Press "Export" button in the top right corner
- Pick the name of the project - or keep auto-generated version
- Press "Export" button within popup window

Playground will create a `zip` file for you, which you can save wherever you like.