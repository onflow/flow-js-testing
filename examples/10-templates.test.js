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

  const withPath = await getTemplate(
    path.resolve(__dirname, "./cadence/scripts/replace-address.cdc"),
    addressMap
  )
  expect(withPath).toBeTruthy()
  console.log({withPath})

  const contractTemplate = await getContractCode({name: "Greeting", addressMap})
  expect(contractTemplate).toBeTruthy()
  console.log({contractTemplate})

  const transactionTemplate = await getTransactionCode({
    name: "log-signers",
    addressMap,
  })
  expect(transactionTemplate).toBeTruthy()
  console.log({transactionTemplate})

  const scriptTemplate = await getScriptCode({name: "log-args", addressMap})
  expect(scriptTemplate).toBeTruthy()
  console.log({scriptTemplate})
})

afterEach(async () => {
  await emulator.stop()
})
