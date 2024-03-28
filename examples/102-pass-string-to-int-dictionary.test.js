import path from "path"
import {init, emulator, executeScript, shallResolve} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("pass string to int dictionary", async () => {
  const code = `
    access(all) fun main(data: {String: UInt32}, key: String): UInt32?{
      return data[key]
    }
  `

  const args = [{cadence: "0", test: "1337"}, "cadence"]

  const [result] = await shallResolve(executeScript({code, args}))
  expect(result).toBe("0")
})

afterEach(async () => {
  // Stop the emulator
  await emulator.stop()
})
