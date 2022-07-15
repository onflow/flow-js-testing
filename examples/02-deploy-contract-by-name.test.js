import path from "path"
import {init, emulator, deployContractByName, executeScript} from "../src"

beforeEach(async () => {
  // Init framework
  const basePath = path.resolve(__dirname, "./cadence")
  await init(basePath)

  // Start Emulator
  await emulator.start()
})

test("deploy contract by name", async () => {
  // Deploy contract Greeting with single argument
  await deployContractByName({
    name: "Greeting",
    args: ["Hello from Emulator"],
  })

  // Read contract field via script
  const [greetingMessage] = await executeScript({
    code: `
      import Greeting from 0x1
      
      pub fun main(): String{
        return Greeting.message
      } 
  `,
  })
  expect(greetingMessage).toBe("Hello from Emulator")

  // Deploy contract Hello with no arguments
  await deployContractByName({name: "Hello"})
  const [helloMessage] = await executeScript({
    code: `
      import Hello from 0x01
      
      pub fun main():String{
        return Hello.message
      }
    `,
  })
  expect(helloMessage).toBe("Hi!")
})

afterEach(async () => {
  // Stop Emulator
  await emulator.stop()
})
