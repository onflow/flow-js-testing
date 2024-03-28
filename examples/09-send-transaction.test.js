import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  sendTransaction,
  shallPass,
} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("send transaction", async () => {
  emulator.addFilter(`debug`)

  const Alice = await getAccountAddress("Alice")
  const Bob = await getAccountAddress("Bob")

  const name = "log-signers"
  const code = `
    transaction(message: String){
      prepare(first: &Account, second: &Account){
          log(message)
          log(first.address)
          log(second.address)
      }
    }
  `
  const signers = [Alice, Bob]
  const args = ["Hello from Cadence"]

  // There are several ways to call "sendTransaction"
  // 1. Providing "code" field for Cadence template
  const [txInlineResult] = await shallPass(
    sendTransaction({code, signers, args})
  )
  // 2. Providing "name" field to read Cadence template from file in "./transaction" folder
  const [txFileResult, , fileLogs] = await shallPass(
    sendTransaction({name, signers, args})
  )

  // 3. Providing name of the file in short form (name, signers, args)
  const [txShortResult, , inlineLogs] = await shallPass(
    sendTransaction(name, signers, args)
  )

  // Expect logs to be as expected
  const expectedLogs = ["Hello from Cadence", Alice.toString(), Bob.toString()]
  expect(fileLogs).toEqual(expectedLogs)
  expect(inlineLogs).toEqual(expectedLogs)

  // Check that all transaction results are the same
  expect(txFileResult).toEqual(txInlineResult)
  expect(txShortResult).toEqual(txInlineResult)
})

afterEach(async () => {
  await emulator.stop()
})
