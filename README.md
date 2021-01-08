# JavaScript Testing Framework for Flow

This repository contains utility methods that, in conjuction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps in Cadence.



*TODO:*
- [ ] Move to `@onflow` npm namespace
- [ ] Example tests
- [ ] Pass arguments to tx and contract


Load Cadence files. Once configured, `flow-js-testing` can load Cadence files by name
```
const NFTContract = await contract("NonFungibleToken");
const FTContract = await contract("FungibleToken");
const MarketplaceContract = await contract("MarketPlace");

const tx1 = await tx("tx_01_check_nft");
const tx2 = await tx("tx_02_configure_user_account");

const script1 = await script("check_balance")
```

Create accounts for testing purposes. Users can create a Flow account, and alias it for lookup later. In this case, If an account named "Bob" already exists, it returns the account.

```
let Bob = account("Bob")
let Alice = account("Bob")
```



Explicit functions for updating protocol state
```
Bob = await F.createAccount(Bob) // Bob is now a 'DeployedAccount' object

const DeployedNFTContract = await F.deployContract(Bob, NFTContract)
const DeployedFTContract = await F.deployContract(Alice, FTContract)
const DeployedMarketplaceContract = await F.deployContract(Alice, MarketplaceContract)

const txResult = await F.sendTx(tx1)

F.addBalance(Bob, 200);
F.addBalance(Alice, 200)

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
})

MarketplaceContract.importing({
  NonFungibleToken: DeployedNFTContract.address,
  FungibleToken: DeployedFTContract.address
})
```
