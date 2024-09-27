import path from "path"
import {init, emulator, executeScript, shallResolve} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("execute script", async () => {
  // We have created a file called "log-args.cdc" under "./cadence/scripts" folder.
  // It's available for use since we configured framework to use "./cadence" folder as root
  const code = `
    access(all) fun main(a: Int, b: Bool, c: String, d: UFix64, e: [Int], f: {String: String}, res: Int): Int{
      log(a)
      log(b)
      log(c)
      log(d)
      log(e)
      log(f)
      
      return res
    }
  `

  // args is just an array of values in the same order as they are defined in script code
  const args = [
    "1337",
    true,
    "Hello, Cadence",
    "1.337",
    ["1", "3", "3", "7"],
    {
      name: "Cadence",
      status: "active",
    },
    "42",
  ]
  const name = "log-args"

  const [fromCode, , logsFromCode] = await shallResolve(
    executeScript({code, args})
  )
  const [fromFile, , logsFromFile] = await shallResolve(
    executeScript({name, args})
  )

  // Expect logs to be as expected
  const expectedLogs = [
    "1337",
    "true",
    "Hello, Cadence",
    "1.33700000",
    "[1, 3, 3, 7]",
    '{"name": "Cadence", "status": "active"}',
  ]
  expect(logsFromCode).toEqual(expectedLogs)
  expect(logsFromFile).toEqual(expectedLogs)

  expect(fromCode).toBe(fromFile)
  expect(fromCode).toBe("42")
  expect(fromFile).toBe("42")

  // "executeScript" also supports short form, accepting name of the file in "scripts folder
  // and array of arguments
  const [shortForm] = await executeScript("hello")
  expect(shortForm).toBe("Hello from Cadence")
})

afterEach(async () => {
  await emulator.stop()
})
