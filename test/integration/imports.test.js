import path from "path"
import {
  emulator,
  init,
  deployContract,
  resolveImports,
  getServiceAddress,
} from "../../src"
import {defaultsByName} from "../../src/file"

jest.setTimeout(10000)

const emptyContract = name =>
  `pub contract ${name}{
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
    await deployContract({code: emptyContract("First"), name: "First"})
    await deployContract({code: emptyContract("Second"), name: "Second"})

    const code = `
            import First from 0xFIRST
            import Second from 0xSECOND
            
            import FungibleToken from 0xFUNGIBLETOKEN
            import FlowToken from 0xFLOWTOKEN
            
            pub fun main(){}
        `

    const addressMap = await resolveImports(code)
    const Registry = await getServiceAddress()

    const {First, Second, FungibleToken, FlowToken} = addressMap
    expect(First).toBe(Registry)
    expect(Second).toBe(Registry)
    expect(FungibleToken).toBe(defaultsByName.FungibleToken)
    expect(FlowToken).toBe(defaultsByName.FlowToken)
  })
})
