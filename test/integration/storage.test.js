import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
  shallPass,
  sendTransaction,
} from "../../src"
import {getPaths, getStorageValue} from "../../src/storage"

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(10000)

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "../cadence")
  await init(basePath)
  return emulator.start({
    flags: "--contracts",
  })
})

afterEach(async () => {
  emulator.stop()
})

describe("Basic Usage test", () => {
  test("Basic inspection", async () => {
    const Alice = await getAccountAddress("Alice")
    const {publicPaths, privatePaths, storagePaths} = await getPaths(Alice)

    // Newly created account shall have 2 public and 1 storage slot occupied for FLOW Vault
    expect(publicPaths.size).toBe(2)
    expect(publicPaths.has("flowTokenBalance")).toBe(true)
    expect(publicPaths.has("flowTokenReceiver")).toBe(true)

    expect(privatePaths.size).toBe(0)

    expect(storagePaths.size).toBe(1)
    expect(storagePaths.has("flowTokenVault")).toBe(true)
  })

  test("Reading storage values", async () => {
    const Alice = await getAccountAddress("Alice")
    await shallPass(
      sendTransaction({
        code: `
        transaction{
          prepare(signer: AuthAccount){
            signer.save(42, to: /storage/answer)
          }
        }
      `,
        signers: [Alice],
      })
    )
    const {storagePaths} = await getPaths(Alice)
    const [vault] = await getStorageValue(Alice, "flowTokenVault")
    const [answer] = await getStorageValue(Alice, "answer")

    expect(storagePaths.has("answer")).toBe(true)
    expect(vault.balance).toBe("0.00100000")
    expect(answer).toBe("42")
    expect(answer).not.toBe(1337)
  })
})
