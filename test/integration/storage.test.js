import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
  shallPass,
  sendTransaction,
} from "../../src"
import {
  getPaths,
  getPathsWithType,
  getStorageStats,
  getStorageValue,
} from "../../src/storage"
import {shallHavePath, shallHaveStorageValue} from "../../src/jest-asserts"

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000)

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "../cadence")
  await init(basePath)
  return emulator.start({
    flags: "--contracts",
  })
})

afterEach(async () => {
  await emulator.stop()
})

describe("Storage Inspection", () => {
  test("Paths inspection", async () => {
    const Alice = await getAccountAddress("Alice")
    const {publicPaths, storagePaths} = await getPaths(Alice)

    // Newly created account shall have 2 public and 1 storage slot occupied for FLOW Vault
    expect(publicPaths.size).toBe(2)
    expect(publicPaths.has("flowTokenBalance")).toBe(true)
    expect(publicPaths.has("flowTokenReceiver")).toBe(true)

    expect(storagePaths.size).toBe(1)
    expect(storagePaths.has("flowTokenVault")).toBe(true)
  })
  test("Reading storage values", async () => {
    const Alice = await getAccountAddress("Alice")
    await shallPass(
      sendTransaction({
        code: `
        transaction{
          prepare(signer: auth(SaveValue) &Account){
            signer.storage.save(42, to: /storage/answer)
          }
        }
      `,
        signers: [Alice],
      })
    )
    const {storagePaths} = await getPaths(Alice)
    const vault = await getStorageValue(Alice, "flowTokenVault")
    const answer = await getStorageValue("Alice", "answer")
    const empty = await getStorageValue(Alice, "empty")

    expect(storagePaths.has("answer")).toBe(true)
    expect(vault.balance).toBe("0.00100000")
    expect(answer).toBe("42")
    expect(answer).not.toBe(1337)
    expect(empty).toBe(null)
  })
  test("Reading types", async () => {
    const {publicPaths} = await getPathsWithType("Alice")
    const refTokenBalance = publicPaths.flowTokenBalance

    expect(refTokenBalance).not.toBe(undefined)
  })
  test("Read storage stats", async () => {
    const {capacity, used} = await getStorageStats("Alice")

    expect(capacity).toBe(100000)
    expect(used > 0).toBe(true)
  })
  test("Jest helper - shallHavePath - pass name", async () => {
    await shallHavePath("Alice", "/storage/flowTokenVault")
  })
  test("Jest helper - shallHavePath - pass address", async () => {
    const Alice = await getAccountAddress("Alice")
    await shallHavePath(Alice, "/storage/flowTokenVault")
  })
  test("Jest helper - shallHaveStorageValue - check simple storage value", async () => {
    const expectedValue = 42
    const pathName = "answer"

    const Alice = await getAccountAddress("Alice")
    await shallPass(
      sendTransaction({
        code: `
        transaction{
          prepare(signer: auth(SaveValue) &Account){
            signer.storage.save(${expectedValue}, to: /storage/${pathName})
          }
        }
      `,
        signers: [Alice],
      })
    )

    await shallHaveStorageValue(Alice, {
      pathName,
      expect: expectedValue.toString(),
    })
  })
  test("Jest helper - shallHaveStorageValue - check complex storage value", async () => {
    const Alice = await getAccountAddress("Alice")
    await shallHaveStorageValue(Alice, {
      pathName: "flowTokenVault",
      key: "balance",
      expect: "0.00100000",
    })
  })
})
