import path from "path"
import {init, emulator, executeScript, shallResolve} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("pass array of dictionaries", async () => {
  const code = `
    access(all) fun main(meta: [{String:String}], key: String): String?{
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

  const [result] = await shallResolve(executeScript({code, args}))
  expect(result).toBe("Giovanni Giorgio")
})

afterEach(async () => {
  // Stop the emulator
  await emulator.stop()
})
