import registry from "../src/generated";
const { FlowManagerTemplate } = registry.contracts;

describe("manager code", () => {
  test("FlowManager contract", async () => {

    const code = await FlowManagerTemplate()

    expect(code.includes("pub contract FlowManager")).toBe(true);
  });
});
