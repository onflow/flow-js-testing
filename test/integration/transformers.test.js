import {builtInMethods, emulator, init} from "../../src"
import {importManager} from "../../src/transformers"
import path from "path"

describe("transformers", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  it("should inject contract for built-in methods", async () => {
    const code = `
      pub fun main() : UInt64 {
        return getCurrentBlock().height
      }
    `

    const transformed = await builtInMethods(code)
    const importStatement = await importManager()
    expect(transformed.includes(importStatement)).toBe(true)
  })
})
