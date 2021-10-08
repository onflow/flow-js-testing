import { builtInMethods } from "../src";
import { importManager } from "../src/transformers";

describe("transformers", () => {
  it("should inject contract for built-in methods", async () => {
    const code = `
      pub fun main() : UInt64 {
        return getCurrentBlock().height
      }
    `;

    const transformed = await builtInMethods(code);
    const importStatement = await importManager();
    expect(transformed.includes(importStatement)).toBe(true);
  });
});
