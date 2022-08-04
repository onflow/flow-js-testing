/* eslint-disable jest/expect-expect */
/* eslint-disable no-unused-vars */
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
  const [txInlineResult] = await shallPass(
    sendTransaction({code, signers, args})
  )
  // 2. Providing "name" field to read Cadence template from file in "./transaction" folder
  const [txFileResult] = await shallPass(sendTransaction({name, signers, args}))

  // 3. Providing name of the file in short form (name, signers, args)
  const [txShortResult] = await shallPass(sendTransaction(name, signers, args))
})

afterEach(async () => {
  await emulator.stop()
})
