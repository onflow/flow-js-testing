import path from "path"

import {
  emulator,
  init,
  getServiceAddress,
  getAccountAddress,
  shallPass,
  shallResolve,
  executeScript,
  sendTransaction,
  getBlockOffset,
  setBlockOffset,
  getTimestampOffset,
  setTimestampOffset,
} from "../src"
import {extractParameters} from "../src/interaction"
import {
  importExists,
  builtInMethods,
  playgroundImport,
} from "../src/transformers"
import {getManagerAddress, initManager} from "../src/manager"
import * as manager from "../src/manager"

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000)

describe("block height offset", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should return zero offset", async () => {
    const [zeroOffset] = await executeScript("get-block-offset")
    expect(zeroOffset).toBe("0")
  })

  it("should update offset", async () => {
    const manager = await getServiceAddress()
    const [zeroOffset] = await executeScript("get-block-offset")
    expect(zeroOffset).toBe("0")

    const offset = 42
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]))
    const [newOffset] = await executeScript("get-block-offset")
    expect(newOffset).toBe(String(offset))
  })

  it("should read offset with utility method", async () => {
    // CadUt version of sending transactions and execution scripts don't have
    // import resolver built in, so we need to provide addressMap to it
    const FlowManager = await getManagerAddress()
    const addressMap = {FlowManager}

    const [offSet] = await getBlockOffset({addressMap})

    expect(offSet).toBe("0")
  })

  it("should update offset with utility method", async () => {
    // CadUt version of sending transactions and execution scripts don't have
    // import resolver built in, so we need to provide addressMap to it
    const FlowManager = await getManagerAddress()
    const addressMap = {FlowManager}

    const [oldOffset] = await getBlockOffset({addressMap})

    expect(oldOffset).toBe("0")

    const offset = 42

    const [txResult] = await setBlockOffset(offset)
    expect(txResult.errorMessage).toBe("")

    const [newOffset] = await getBlockOffset({addressMap})

    expect(newOffset).toBe(String(offset))
  })
})

describe("block height offset utilities", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should return 0 for initial block offset", async () => {
    const [initialOffset] = await shallResolve(manager.getBlockOffset())
    expect(initialOffset).toBe("0")
  })

  it("should update block offset", async () => {
    const [offset] = await shallResolve(manager.getBlockOffset())
    expect(offset).toBe("0")

    const blockOffset = 42
    await shallPass(manager.setBlockOffset(blockOffset))

    const [newOffset] = await shallResolve(manager.getBlockOffset())
    expect(newOffset).toBe(String(blockOffset))
  })
})

describe("timestamp offset", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should return zero offset", async () => {
    const [zeroOffset] = await executeScript("get-timestamp-offset")
    expect(zeroOffset).toBe("0.00000000")
  })

  it("should update offset", async () => {
    const manager = await getServiceAddress()
    const [zeroOffset] = await executeScript("get-timestamp-offset")
    expect(zeroOffset).toBe("0.00000000")

    const offset = 42
    await shallPass(
      sendTransaction("set-timestamp-offset", [manager], [offset])
    )
    const [newOffset] = await executeScript("get-timestamp-offset")
    expect(newOffset).toBe(offset.toFixed(8))
  })

  it("should read offset with utility method", async () => {
    // CadUt version of sending transactions and execution scripts don't have
    // import resolver built in, so we need to provide addressMap to it
    const FlowManager = await getManagerAddress()
    const addressMap = {FlowManager}

    const [offSet] = await getTimestampOffset({addressMap})

    expect(offSet).toBe("0.00000000")
  })

  it("should update offset with utility method", async () => {
    // CadUt version of sending transactions and execution scripts don't have
    // import resolver built in, so we need to provide addressMap to it
    const FlowManager = await getManagerAddress()
    const addressMap = {FlowManager}

    const [oldOffset] = await getTimestampOffset({addressMap})

    expect(oldOffset).toBe("0.00000000")

    const offset = 42

    const [txResult] = await setTimestampOffset(offset)
    expect(txResult.errorMessage).toBe("")

    const [newOffset] = await getTimestampOffset({addressMap})

    expect(newOffset).toBe(offset.toFixed(8))
  })
})

describe("timestamp offset utilities", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should return 0 for initial timestamp offset", async () => {
    const [initialOffset] = await shallResolve(manager.getTimestampOffset())
    expect(initialOffset).toBe("0.00000000")
  })

  it("should update timestamp offset", async () => {
    const [offset] = await shallResolve(manager.getTimestampOffset())
    expect(offset).toBe("0.00000000")

    const blockOffset = 42
    await shallPass(manager.setTimestampOffset(blockOffset))

    const [newOffset] = await shallResolve(manager.getTimestampOffset())
    expect(newOffset).toBe(blockOffset.toFixed(8))
  })
})

describe("dev tests", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should return proper offset", async () => {
    const [zeroOffset] = await executeScript("get-block-offset")
    expect(zeroOffset).toBe("0")
  })

  it("should return proper offset, when changed", async () => {
    const offset = 42
    const manager = await getServiceAddress()
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]))
    const [newOffset] = await executeScript("get-block-offset")
    expect(newOffset).toBe(String(offset))
  })

  it("should return proper addresses", async () => {
    await initManager()
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
    for (const i in accounts) {
      await getAccountAddress(accounts[i])
    }

    const code = `
      pub fun main(address:Address):Address{
        return getAccount(address).address
      } 
    `

    const playgroundAddresses = ["0x01", "0x02", "0x03", "0x04", "0x05"]
    for (const i in playgroundAddresses) {
      const [result] = await executeScript({
        code,
        transformers: [playgroundImport(accounts)],
        args: [playgroundAddresses[i]],
      })
      const account = await getAccountAddress(accounts[i])
      expect(result).toBe(account)
    }
  })
})

describe("transformers and injectors", () => {
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence")
    await init({base})
  })

  it("should inject built in mock", async () => {
    const props = {
      code: `
      pub fun main(){
        log(getCurrentBlock().height);
      }
    `,
      transformers: [builtInMethods],
    }
    const extractor = extractParameters("script")
    const {code} = await extractor([props])
    expect(importExists("FlowManager", code)).toBe(true)
  })

  it("should replace getAccount", async () => {
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
    const props = {
      code: `
        pub fun main(){
          let Alice = getAccount(0x01)
          let Bob = getAccount(0x02)
          let Charlie = getAccount(0x03)
          let Dave = getAccount(0x04)
          let Eve = getAccount(0x05)
        } 
      `,
      transformers: [playgroundImport(accounts)],
    }
    const extractor = extractParameters("script")
    const {code} = await extractor([props])

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i]
      const substring = `let ${account} = getAccount(FlowManager.getAccountAddress("${account}")`
      expect(code.includes(substring)).toBe(true)
    }
  })

  it("should replace getAccount in script", async () => {
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
    const props = {
      code: `
        pub fun main(address:Address):Address{
          return getAccount(address).address
        } 
      `,
      transformers: [playgroundImport(accounts)],
    }
    const extractor = extractParameters("script")
    const {code} = await extractor([props])
    expect(code.includes("FlowManager.resolveDefaultAccounts(address)")).toBe(
      true
    )
  })
})
