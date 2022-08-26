import {Logger, LOGGER_LEVELS} from "../src/emulator/logger"

describe("logger", () => {
  it("shall format logged message", () => {
    const input = {
      time: "2021-09-28T15:06:56+03:00",
      level: "info",
      msg: "🌱  Starting gRPC server on port 3569",
      port: 3659,
    }
    const msg = JSON.stringify(input)
    const [output] = new Logger().parseDataBuffer(msg)
    expect(output.level).toBe(LOGGER_LEVELS[input.level.toUpperCase()])
    expect(output.msg).toBe(input.msg)
  })
})
