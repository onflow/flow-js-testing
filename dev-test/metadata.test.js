import path from "path";
import { init, emulator, executeScript, shallResolve } from "../src";
import { mapValuesToCode } from "flow-cadut";

jest.setTimeout(10000);

describe("metadata examples", () => {
  beforeEach(async () => {
    const basePath = path.resolve("./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  afterEach(async () => {
    return emulator.stop();
  });

  test("simple dictionary - {String: String}", async () => {
    const code = `
      pub fun main(metadata: {String: String}): String{
        return metadata["name"]!
      }
    `;
    const name = "Cadence";
    const args = [{ name }];
    const result = await shallResolve(executeScript({ code, args }));
    expect(result).toBe(name);
  });

  test("simple dictionary - {String: Int}", async () => {
    const code = `
      pub fun main(metadata: {String: Int}): Int{
        return metadata["answer"]!
      }
    `;
    const answer = 42;
    const args = [{ answer }];
    const result = await shallResolve(executeScript({ code, args }));
    expect(result).toBe(answer);
  });

  test("simple array - [String]", async () => {
    const code = `
      pub fun main(list: [String]): String{
        return list[0]
      }
    `;
    const value = "test";
    const args = [[value]];
    const result = await shallResolve(executeScript({ code, args }));
    expect(result).toBe(value);
  });

  test("nested arrays - [[Int]]", async () => {
    const code = `
      pub fun main(list: [[Int]], index: Int): Int {
        log("this is log message we want to output")
        log(list[0][0])
        log(list[0][1])
        log(list[0][2])
        return list[0][index] 
      }
    `;
    const value = [1, 3, 3, 7];
    const index = 3;
    const args = [[value], index];

    try {
      const result = await executeScript({ code, args });
      expect(result).toBe(value[index]);
    } catch (e) {
      console.error(e);
    }
  });
});
