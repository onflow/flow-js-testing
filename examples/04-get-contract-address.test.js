import path from "path"
import {init, emulator, deployContractByName, getContractAddress} from "../src"

function isAddress(string) {
  return /^0x[0-9a-f]{16}$/.test(string)
}

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()
})

test("get contract address", async () => {
  // if we omit "to" it will be deployed to Service Account
  // but let's pretend we don't know where it will be deployed :)
  await deployContractByName({name: "Hello"})

  const contractAddress = await getContractAddress("Hello")

  expect(isAddress(contractAddress)).toBe(true)
  console.log({contractAddress})
})

afterEach(async () => {
  await emulator.stop()
})
