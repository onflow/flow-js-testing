import {getConfigValue} from "../../src"

describe("configuration tests", () => {
  test("defaultComputeLimit - set default compute limit", async () => {
    const limit = await getConfigValue("fcl.limit")

    expect(limit).toBe(9999)
  })
})
