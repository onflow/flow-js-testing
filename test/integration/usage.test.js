import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
  getContractAddress,
  deployContractByName,
  getScriptCode,
  executeScript,
  sendTransaction,
  mintFlow,
  getFlowBalance,
  shallRevert,
  shallResolve,
  shallPass,
  shallThrow,
  getServiceAddress,
} from "../../src"
import {DEFAULT_TEST_TIMEOUT} from "../util/timeout.const"

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(DEFAULT_TEST_TIMEOUT)

describe("Basic Usage test", () => {
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

  test("create Accounts", async () => {
    const Alice = await getAccountAddress("Alice")

    await deployContractByName({name: "HelloWorld", to: Alice})

    const addressMap = {HelloWorld: Alice}
    const code = await getScriptCode({name: "get-message", addressMap})
    const [message] = await shallResolve(
      executeScript({
        code,
      })
    )
    expect(message).toBe("Hello, from Cadence")

    await shallPass(mintFlow(Alice, "13.37"))
    const [balance] = await shallResolve(getFlowBalance(Alice))
    expect(balance).toBe("13.37100000")
  })

  test("deploy nested contract", async () => {
    await deployContractByName({
      name: "utility/Message",
    })
    const address = await getContractAddress("Message")
    const service = await getServiceAddress()
    expect(address).toBe(service)

    const [message] = await shallResolve(
      executeScript({
        code: `
        import Message from 0x01
        
        access(all) fun main():String{
          return Message.data
        }
      `,
      })
    )
    expect(message).toBe("This is Message contract")
  })
})

describe("jest methods", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("shall throw and revert properly", async () => {
    await shallRevert(
      sendTransaction({
        code: `
          transaction{
            prepare(signer: &Account){
              panic("not on my watch!")
            }
          }
        `,
      })
    )
  })

  test("shall resolve properly", async () => {
    const [result, err] = await shallResolve(
      executeScript({
        code: `
          access(all) fun main(): Int{
            return 42
          }
        `,
      })
    )
    expect(result).toBe("42")
    expect(err).toBe(null)
  })

  test("shall pass tx", async () => {
    await shallPass(
      sendTransaction({
        code: `
          transaction{
            prepare(signer: &Account){}
          }
        `,
      })
    )
  })

  test("shall throw error", async () => {
    await shallThrow(
      executeScript({
        code: `
          access(all) fun main(){
            panic("exit here")
          }
        `,
      })
    )
  })
})

describe("Path arguments", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)

    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("shall work with Path variables in code", async () => {
    const [result] = await shallResolve(
      executeScript({
        code: `
        access(all) fun main(): Bool{
          let path = StoragePath(identifier: "foo")
          log(path)
          
          return true
        }
      `,
      })
    )
    expect(result).toBe(true)
  })

  it("shall be possible to pass Path argument", async () => {
    const [result] = await shallResolve(
      executeScript({
        code: `
        access(all) fun main(path: Path): Bool{
          log("this is awesome")
          log(path)
          
          return true
        }
      `,
        args: ["/storage/foo"],
      })
    )
    expect(result).toBe(true)
  })

  it("shall show debug logs", async () => {
    const [result] = await shallResolve(
      executeScript({
        code: `
        access(all) fun main(): Bool{
          return true
        }
      `,
      })
    )
    expect(result).toBe(true)
  })
})
