import path from "path"
import {init, emulator, executeScript} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("pass int dictionary", async () => {
  const code = `
    pub fun main(data: {UInt32: UInt32}, key: UInt32): UInt32?{
      return data[key]
    }
  `

  const args = [{0: 1, 1: 42}, 1]

  const [result] = await executeScript({code, args})
  expect(result).toBe("42")
})

afterEach(async () => {
  // Stop the emulator
  await emulator.stop()
})
