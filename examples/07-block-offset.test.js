import path from "path"
import {
  init,
  emulator,
  getBlockOffset,
  setBlockOffset,
  builtInMethods,
  executeScript,
} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("block offset", async () => {
  const [initialBlockOffset] = await getBlockOffset()
  expect(initialBlockOffset).toBe("0")

  // "getCurrentBlock().height" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().height
    }
  `

  // We can check that non-transformed code still works just fine
  const [normalResult] = await executeScript({code})
  expect(normalResult).toBe("1")

  // Offset current block height by 42
  await setBlockOffset(42)
  // Let's check that offset value on Manager is actually changed to 42
  const [blockOffset] = await getBlockOffset()
  expect(blockOffset).toBe("42")

  // "transformers" field expects array of functions to operate update the code.
  // We will pass single operator "builtInMethods" provided by the framework to alter how getCurrentBlock().height is calculated
  const transformers = [builtInMethods]
  const [transformedResult] = await executeScript({code, transformers})
  expect(transformedResult).toBe("44")
})

afterEach(async () => {
  // Stop the emulator
  await emulator.stop()
})
