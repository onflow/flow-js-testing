import path from "path"
import {init, emulator, getAccountAddress} from "../src"

function isAddress(string) {
  return /^0x[0-9a-f]{16}$/.test(string)
}

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("get account address", async () => {
  const Alice = await getAccountAddress("Alice")

  console.log({Alice})
  expect(isAddress(Alice)).toBe(true)
})

afterEach(async () => {
  await emulator.stop()
})
