import emulator from "../src/emulator";

describe("emulator - logging", () => {
  it("shall format single info line properly", async () => {
    const msg = "Hello, world";

    const output = emulator.parseDataBuffer(msg);
    expect(output.msg).toBe(msg)
    expect(output.level).toBe("parser")
  });

  it("shall format logged message", ()=>{
    const input = {
      time: "2021-09-28T15:06:56+03:00",
      level: "info",
      msg: "🌱  Starting gRPC server on port 3569",
      port: 3659
    }
    const msg = JSON.stringify(input)
    const output = emulator.parseDataBuffer(msg);
    expect(output.level).toBe(input.level)
    expect(output.msg).toBe(input.msg)
  })
});
