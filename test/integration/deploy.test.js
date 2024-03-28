import path from "path"
import {
  emulator,
  init,
  executeScript,
  deployContract,
  deployContractByName,
  getContractAddress,
  getAccountAddress,
  getServiceAddress,
  shallPass,
  shallResolve,
} from "../../src"
import {DEFAULT_TEST_TIMEOUT} from "../util/timeout.const"

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(DEFAULT_TEST_TIMEOUT)

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("deploy basic contract - to service account", async () => {
    const name = "HelloWorld"
    await deployContractByName({name})
    const address = await getContractAddress(name)
    const serviceAccount = await getServiceAddress()
    expect(address).toBe(serviceAccount)
  })

  test("deploy basic contract - captures logs", async () => {
    const name = "HelloWorld"
    const [, , logs] = await shallPass(deployContractByName({name}))
    expect(logs).toEqual(["contract added to account"])
  })

  test("deploy basic contract - to service account, short notation", async () => {
    const name = "HelloWorld"
    await deployContractByName(name)
    const address = await getContractAddress(name)
    const serviceAccount = await getServiceAddress()
    expect(address).toBe(serviceAccount)
  })

  test("deploy basic contract - to Alice account", async () => {
    const Alice = await getAccountAddress("Alice")
    const name = "HelloWorld"
    await deployContractByName({name, to: Alice})
    const address = await getContractAddress(name)
    expect(address).toBe(Alice)
  })

  test("deploy basic contract - to Alice account, short notation", async () => {
    const name = "HelloWorld"
    const Alice = await getAccountAddress("Alice")
    await deployContractByName(name, Alice)
    const address = await getContractAddress(name)
    expect(address).toBe(Alice)
  })

  test("deploy basic contract - check", async () => {
    const name = "HelloWorld"
    await deployContractByName(name)
    const [result, err] = await executeScript({
      code: `
        import HelloWorld from 0x1
        
        access(all) fun main():String{
          return HelloWorld.message
        }
      `,
    })
    expect(result).toBe("Hello, from Cadence")
    expect(err).toBe(null)
  })

  test("deploy custom contract with arguments", async () => {
    const message = "Hello, Cadence"
    const number = "42"
    await shallPass(
      deployContract({
        code: `
        access(all) contract Basic{
          access(all) let message: String
          access(all) let number: Int
          init(message: String, number: Int){
            self.message = message
            self.number = number
          }
        }
      `,
        args: [message, number],
      })
    )

    // Read message
    const [messageResult, messageErr] = await shallResolve(
      executeScript({
        code: `
        import Basic from 0x1
        
        access(all) fun main():String{
          return Basic.message
        }
      `,
      })
    )
    expect(messageResult).toBe(message)
    expect(messageErr).toBe(null)

    // Read number
    const [numberResult, numberErr] = await shallResolve(
      executeScript({
        code: `
        import Basic from 0x1
        
        access(all) fun main():Int{
          return Basic.number
        }
      `,
      })
    )
    expect(numberResult).toBe(number)
    expect(numberErr).toBe(null)
  })
})
