import { replaceImportAddresses } from "../src";

describe("replace", () => {
  test("deployed address", async () => {
    const Basic = "0x01";
    const code = `import Basic from 0xTEMPLATE_STRING`;
    const result = replaceImportAddresses(code, {
      Basic,
    });
    const reference = `import Basic from ${Basic}`;
    expect(result).toEqual(reference);
  });

  test("multiple deployed addresses", async () => {
    const Basic = "0x01";
    const Advanced = "0x02";

    const code = `
    import Basic from 0xBASIC_TEMPLATE
    import Advanced from 0xADVANCED_TEMPLATE
    `;

    const result = replaceImportAddresses(code, {
      Basic, Advanced
    });

    const reference = `
    import Basic from ${Basic}
    import Advanced from ${Advanced}
    `;

    expect(result).toEqual(reference);
  });

  test("local imports", async () => {
    const Basic = "0x01";
    const code = `import Basic from "../cadence/script"`;
    const result = replaceImportAddresses(code, {
      Basic,
    });
    const reference = `import Basic from ${Basic}`;
    expect(result).toEqual(reference);
  });

  test("multiple local imports", async () => {
    const Basic = "0x01";
    const Advanced = "0x02";

    const code = `
    import Basic from "../cadence/Basic.cdc"
    import Advanced from "../cadence/Advanced.cdc"
    `;

    const result = replaceImportAddresses(code, {
      Basic, Advanced
    });

    const reference = `
    import Basic from ${Basic}
    import Advanced from ${Advanced}
    `;

    expect(result).toEqual(reference);
  });
});
