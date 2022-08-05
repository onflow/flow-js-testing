import path from "path"
import {
  init,
  emulator,
  getTemplate,
  getContractCode,
  getScriptCode,
  getTransactionCode,
} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("templates", async () => {
  const addressMap = {
    Profile: "0xf8d6e0586b0a20c7",
  }

  const withPath = getTemplate(
    path.resolve(__dirname, "./cadence/scripts/replace-address.cdc"),
    addressMap
  )

  const contractTemplate = await getContractCode({name: "Greeting", addressMap})

  const transactionTemplate = await getTransactionCode({
    name: "log-signers",
    addressMap,
  })

  const scriptTemplate = await getScriptCode({name: "log-args", addressMap})

  expect(withPath).toBeDefined()
  expect(contractTemplate).toBeDefined()
  expect(transactionTemplate).toBeDefined()
  expect(scriptTemplate).toBeDefined()
})

afterEach(async () => {
  await emulator.stop()
})
