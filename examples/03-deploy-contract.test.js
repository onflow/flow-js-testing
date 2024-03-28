import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  deployContract,
  executeScript,
  shallResolve,
  shallPass,
} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()
})

test("deploy contract", async () => {
  // We can specify, which account will hold the contract
  const to = await getAccountAddress("Alice")

  const name = "Wallet"
  const code = `
        access(all) contract Wallet{
            access(all) let balance: UInt
            init(balance: UInt){
              self.balance = balance
            }
        }
    `
  const args = ["1337"]

  await shallPass(deployContract({to, name, code, args}))

  const [balance] = await shallResolve(
    executeScript({
      code: `
      import Wallet from 0x01
      access(all) fun main(): UInt{
        return Wallet.balance
      }
    `,
    })
  )
  expect(balance).toBe("1337")
})

afterEach(async () => {
  await emulator.stop()
})
