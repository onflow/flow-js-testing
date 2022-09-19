import path from "path"

import {
  emulator,
  init,
  getServiceAddress,
  shallPass,
  shallResolve,
  executeScript,
  sendTransaction,
  getBlockOffset,
  setBlockOffset,
  getTimestampOffset,
  setTimestampOffset,
  deployContract,
} from "../src"
import {extractParameters} from "../src/interaction"
import {
  importExists,
  builtInMethods,
  playgroundImport,
} from "../src/transformers"
import {getManagerAddress} from "../src/manager"
import * as manager from "../src/manager"
import {query} from "@onflow/fcl"

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

    const offset = "42"
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]))

    const [newOffset] = await executeScript("get-block-offset")
    expect(newOffset).toBe(offset)
  })

  it("should read offset with utility method", async () => {
    const [offset] = await getBlockOffset()
    expect(offset).toBe("0")
  })

  it("should update offset with utility method", async () => {
    const [oldOffset] = await getBlockOffset()
    expect(oldOffset).toBe("0")

    const offset = "42"
    await shallPass(setBlockOffset(offset))

    const [newOffset] = await getBlockOffset()
    expect(newOffset).toBe(offset)
  })

  it("should update offset in contract", async () => {
    await shallPass(
      deployContract({
        code: `
        pub contract BlockTest {
            pub fun currentHeight(): UInt64 {
                return getCurrentBlock().height
            }
        
            init() {}
        }
      `,
      })
    )

    const offset = "42"
    await shallPass(manager.setBlockOffset(offset))

    const realBlock = await query({
      cadence: `
      pub fun main(): UInt64 {
        return getCurrentBlock().height
      }
      `,
    })

    const [currentBlock] = await shallResolve(
      executeScript({
        code: `
        import BlockTest from 0x01
        pub fun main(): UInt64 {
          return BlockTest.currentHeight()
        }
      `,
      })
    )

    // Expect 1 higher than initial block height + offset due to sealed TX @ manager.setBlockOffset
    expect(Number(currentBlock)).toBe(Number(realBlock) + Number(offset))
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

    const blockOffset = "42"
    await shallPass(manager.setBlockOffset(blockOffset))

    const [newOffset] = await shallResolve(manager.getBlockOffset())
    expect(newOffset).toBe(blockOffset)
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

    const offset = "42"
    await shallPass(
      sendTransaction("set-timestamp-offset", [manager], [offset])
    )
    const [newOffset] = await executeScript("get-timestamp-offset")
    expect(newOffset).toBe(Number(offset).toFixed(8))
  })

  it("should read offset with utility method", async () => {
    const [offSet] = await getTimestampOffset()
    expect(offSet).toBe("0.00000000")
  })

  it("should update offset with utility method", async () => {
    const [oldOffset] = await getTimestampOffset()
    expect(oldOffset).toBe("0.00000000")

    const offset = "42"
    await shallPass(setTimestampOffset(offset))

    const [newOffset] = await getTimestampOffset()
    expect(newOffset).toBe(Number(offset).toFixed(8))
  })

  it("should update offset in contract", async () => {
    await shallPass(
      deployContract({
        code: `
        pub contract TimestampTest {
            pub fun currentTime(): UFix64 {
                return getCurrentBlock().timestamp
            }
        
            init() {}
        }
      `,
      })
    )

    const offset = "42"
    await shallPass(manager.setTimestampOffset(offset))

    const realTimestamp = await query({
      cadence: `
        pub fun main(): UFix64 {
          return getCurrentBlock().timestamp
        }
        `,
    })

    const [currentTimestamp] = await shallResolve(
      executeScript({
        code: `
        import TimestampTest from 0x01
        pub fun main(): UFix64 {
          return TimestampTest.currentTime()
        }
      `,
      })
    )

    expect(Number(currentTimestamp)).toBe(
      Number(realTimestamp) + Number(offset)
    )
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

    const blockOffset = "42"
    await shallPass(manager.setTimestampOffset(blockOffset))

    const [newOffset] = await shallResolve(manager.getTimestampOffset())
    expect(newOffset).toBe(Number(blockOffset).toFixed(8))
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
    const offset = "42"
    const manager = await getServiceAddress()
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]))
    const [newOffset] = await executeScript("get-block-offset")
    expect(newOffset).toBe(offset)
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
