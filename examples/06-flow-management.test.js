import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  getFlowBalance,
  mintFlow,
} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("flow management", async () => {
  // Get address for account with alias "Alice"
  const Alice = await getAccountAddress("Alice")

  // Get initial balance
  const [initialBalance] = await getFlowBalance(Alice)
  expect(initialBalance).toBe("0.00100000")

  // Add 1.0 FLOW tokens to Alice account
  await mintFlow(Alice, "1.0")

  // Check updated balance
  const [updatedBalance] = await getFlowBalance(Alice)
  const expectedBalance = parseFloat(initialBalance) + 1.0
  expect(parseFloat(updatedBalance)).toBe(expectedBalance)

  await emulator.stop()
})
