# JavaScript Testing Framework for Flow

This repository contains utility methods that, in conjuction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps in Cadence. 
_Note:_ This project has only been tested against the Flow Emulator.


*TODO:*
- [ ] Move to `@onflow` npm namespace
- [ ] Example tests
- [ ] Pass arguments to tx and contract
- [ ] Start and restart the Emulator from tests

Point to your Cadence files. This can be set at any point in code, and file loading methods will load from specified `basePath`
```
const basePath = './src/cadence';
setCadenceLocation(basePath);
```
*Important:* Currently `flow-js-testing` expects your folders to be structured like (with no subfolders): 
```
basePath
   - contracts
       - MyContract.cdc
   - transactions
      - MyTx.cdc
   - scripts
      - MyScript.cdc
```

Imports
```
import F, {
  getContractCode as contract,
  getScriptCode as script,
  getTransactionCode as tx,
  createAccount as account,
  setCadenceLocation
} from 'flow-js-testing';
```


Load Cadence files. Once configured, `flow-js-testing` can load Cadence files by name
```
const NFTContract = await contract("NonFungibleToken");
const FTContract = await contract("FungibleToken");
const MarketplaceContract = await contract("MarketPlace");

const tx1 = await tx("tx_01_check_nft");
const tx2 = await tx("tx_02_configure_user_account");

const script1 = await script("check_balance");
```

Users can create Flow accounts, and alias them for lookup later. In this case, If an account named "Bob" already exists, it returns the account.

```
let Bob = account("Bob");
let Alice = account("Alice");
```



Explicit functions for updating protocol state
```
Bob = await F.createAccount(Bob); // Bob is now a 'DeployedAccount' object

const DeployedNFTContract = await F.deployContract(Bob, NFTContract);
const DeployedFTContract = await F.deployContract(Alice, FTContract);
const DeployedMarketplaceContract = await F.deployContract(Alice, MarketplaceContract);

const txResult = await F.sendTx(tx1);

F.addBalance(Bob, 200);
F.addBalance(Alice, 200);

```

Easily replace imports (Done before execution / deployment)

```
tx1.importing({
   NonFungibleToken: DeployedNFTContract.address,
});

tx1.replace({
   "getAccount(0x01)": `getAccount(${Bob.address})`, // can also use regex replace
});

tx1.signers(Bob.address);

script1.importing({
   FungibleToken: DeployedFTContract.address
});

MarketplaceContract.importing({
  NonFungibleToken: DeployedNFTContract.address,
  FungibleToken: DeployedFTContract.address
});
```

Example usage in Jest tests: *important:* When using `jest` tests should be run with the `-i` flag to make sure tests run in the order they are defined.

Before running tests, start the Emulator: `flow emulator start -v` passing the `-v` flag so you can see execution errors in the output.

```
import { fail } from "assert";
import path from "path";
import promiseSeries from 'promise.series'

import F, {
  getContractCode as contract,
  getScriptCode as script,
  getTransactionCode as tx,
  createAccount as account,
  setCadenceLocation
} from 'flow-js-testing';

const basePath = path.resolve(
  __dirname,
  "../../../../cadence/03-non-fungible-tokens"
);

let Alice,
  Bob,
  NFTContract,
  AliceNFTContract,
  tx1,
  tx2;

beforeAll(async () => {
  setCadenceLocation(basePath);

  // Accounts
  // -----------------------
  Alice = await F.createAccount(account("Alice"));
  Bob = await F.createAccount(account("Bob"));

  // Load Cadence from files
  // -----------------------
  /* Contracts */
  NFTContract = await contract("NonFungibleToken");

  /* Transactions */
  tx1 = await tx("tx_01_check_nft");
  tx2 = await tx("tx_02_configure_user_account");

 
  // Deploy contracts
  // -----------------------
  AliceNFTContract = F.deployContract(Alice, NFTContract);
   
  // Do this so Jest waits...
  return AliceNFTContract;
});

describe("Testing 'Non-Fungible Tokens' Tutorial", () => {
  it("Transactions", async () => {

    tx1.importing({
      NonFungibleToken: AliceNFTContract.address,
    })
    .signers(Alice.address);
    
    tx2.importing({
      NonFungibleToken: AliceNFTContract.address,
    })
    .signers(Bob.address);


    try {
       await promiseSeries([
         () => F.sendTx(tx1)
         () => F.sendTx(tx2)
       ])
    } catch(e) {
       fail()      
    }
  });

 // ...

});
```
