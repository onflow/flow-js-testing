import path from "path"
import {
  emulator,
  init,
  deployContract,
  resolveImports,
  getServiceAddress,
  getAccountAddress,
} from "../../src"
import {defaultsByName} from "../../src"
import {DEFAULT_TEST_TIMEOUT} from "../util/timeout.const"
import {fixShorthandImports} from "../../src/imports"

jest.setTimeout(DEFAULT_TEST_TIMEOUT)

const emptyContract = name =>
  `access(all) contract ${name}{
        init(){}
    }
`

describe("import resolver", () => {
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

  test("use imports", async () => {
    const Dynamic = await getAccountAddress("Dynamic")
    await deployContract({code: emptyContract("First"), name: "First"})
    await deployContract({code: emptyContract("Second"), name: "Second"})
    await deployContract({code: emptyContract("Third"), name: "Third"})
    await deployContract({code: emptyContract("A"), name: "A"})
    await deployContract({code: emptyContract("B"), name: "B"})
    await deployContract({code: emptyContract("Dynamo"), name: "Dynamo", to: Dynamic})

    const code = `
            import First from 0xFIRST
            import Second from 0xSECOND
            import "Third"
            import "A", "B"
            
            import FungibleToken from 0xFUNGIBLETOKEN
            import FlowToken from 0xFLOWTOKEN
            
            import Dynamo from "DYNAMIC"
            import Direct from 0x0123456789012345
            import FlowFees from 0x0123456789012345
            
            access(all) fun main(){}
        `

    const testFixed = fixShorthandImports(code)
    expect(testFixed.includes("import.cdc")).toBe(false)

    const addressMap = await resolveImports(code)
    const Registry = await getServiceAddress()

    const {First, Second, Third, A, B, FungibleToken, FlowToken} = addressMap
    expect(First).toBe(Registry)
    expect(Second).toBe(Registry)
    expect(Third).toBe(Registry)
    expect(A).toBe(Registry)
    expect(B).toBe(Registry)
    expect(FungibleToken).toBe(defaultsByName.FungibleToken)
    expect(FlowToken).toBe(defaultsByName.FlowToken)
    const {Dynamo, Direct, FlowFees} = addressMap
    expect(Dynamo).toBe(Dynamic)
    expect(Direct).toBe('0x0123456789012345')
    expect(FlowFees).toBe('0x0123456789012345')
  })
})
