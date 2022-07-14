import path from "path"
import {init, emulator, getAccountAddress} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("get account address", async () => {
  const Alice = await getAccountAddress("Alice")

  // Expect Alice to be address of Alice's account
  expect(Alice).toMatch(/^0x[0-9a-f]{16}$/)
})

afterEach(async () => {
  await emulator.stop()
})
