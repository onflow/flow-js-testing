import path from "path"
import {init, emulator, executeScript} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("pass array of dictionaries", async () => {
  const code = `
    pub fun main(meta: [{String:String}], key: String): String?{
      return meta[0]![key]
    }
  `
  const args = [
    [
      {
        name: "Giovanni Giorgio",
        nickname: "Giorgio",
      },
    ],
    "name",
  ]

  const result = await executeScript({code, args})
  expect(result[0]).toBe("Giovanni Giorgio")
  expect(result[1]).toBeNull()
})

afterEach(async () => {
  // Stop the emulator
  await emulator.stop()
})
