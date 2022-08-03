import path from "path"
import {init, emulator, getAccountAddress, isAddress} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("get account address", async () => {
  const Alice = await getAccountAddress("Alice")

  // Expect Alice to be address of Alice's account
  expect(isAddress(Alice)).toBe(true)
})

afterEach(async () => {
  await emulator.stop()
})
