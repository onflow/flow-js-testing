import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  deployContract,
  executeScript,
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
        pub contract Wallet{
            pub let balance: UInt
            init(balance: UInt){
              self.balance = balance
            }
        }
    `
  const args = [1337]

  await deployContract({to, name, code, args})

  const [balance] = await executeScript({
    code: `
      import Wallet from 0x01
      pub fun main(): UInt{
        return Wallet.balance
      }
    `,
  })
  expect(balance).toBe("1337")
})

afterEach(async () => {
  await emulator.stop()
})
