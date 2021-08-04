# Types

Below you can find information about types used in description on methods' arguments and return values.

### `Address`
`0x` prefixed value of account address

### `AddressMap`

Object to use for address mapping of existing deployed contracts. Key shall be `string` and value shall be [Address](#Address)

#### Example

```javascript
const addressMap = {
  Messanger: "0x01cf0e2f2f715450",
  Logger: "0x179b6b1cb6755e31",
};
```
