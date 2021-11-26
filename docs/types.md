### `AddressMap`

Object to use for address mapping of existing deployed contracts. Key shall be `string` and value shall be [Address](https://docs.onflow.org/fcl/reference/api/#address)

#### Example

```javascript
const addressMap = {
  Messanger: "0x01cf0e2f2f715450",
  Logger: "0x179b6b1cb6755e31",
};
```

### `Interaction`

Interaction is a Promise or function returning a promise.

#### Example

```javascript
const ix = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1337);
    });
  }, 500);
};
```
