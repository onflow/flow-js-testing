import path from "path"
import {init, emulator, getAccountAddress, sendTransaction} from "../src"

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
      prepare(first: AuthAccount, second: AuthAccount){
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
  const [txInlineResult] = await sendTransaction({code, signers, args})
  // 2. Providing "name" field to read Cadence template from file in "./transaction" folder
  const [txFileResult] = await sendTransaction({name, signers, args})

  expect(txInlineResult).toBeTruthy()
  expect(txFileResult).toBeTruthy()
  expect(txInlineResult.statusCode).toBe(0)
  expect(txFileResult.statusCode).toBe(0)

  // 3. Providing name of the file in short form (name, signers, args)
  const [txShortResult] = await sendTransaction(name, signers, args)
  expect(txShortResult).toBeTruthy()
  expect(txShortResult.statusCode).toBe(0)
})

afterEach(async () => {
  await emulator.stop()
})
