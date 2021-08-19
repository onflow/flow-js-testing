import { mockBuiltIn } from "../src";
import { IMPORT_UTILITIES } from "../src/transformers";

describe("transformers", () => {
  it("should inject contract for built-in methods", function () {
    const code = `
      pub fun main() : UInt64 {
        return getCurrentBlock().height
      }
    `;

    const transformed = mockBuiltIn(code);
    expect(transformed.includes(IMPORT_UTILITIES)).toBe(true);
  });
});
