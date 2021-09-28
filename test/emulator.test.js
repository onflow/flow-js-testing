import emulator from "../src/emulator";

describe("emulator - logging", () => {
  it("shall format single info line properly", async () => {
    const msg = "Hello, world";

    const output = emulator.parseDataBuffer(msg);
    console.log({ output });
  });

  it("shall format logged message", ()=>{
    const msg =`time="2021-09-28T15:06:56+03:00" level=info msg="🌱  Starting gRPC server on port 3569" port=3569`

    const output = emulator.parseDataBuffer(msg);
    console.log({ output })
    expect(output.level).toBe("info")
  })
});
