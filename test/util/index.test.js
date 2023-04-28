import {getValueByKey} from "../../src/utils"

describe("testing utilities", function () {
  test("extract object value - simple key", () => {
    const expected = 42

    const key = "answer"
    const obj = {
      [key]: expected,
    }
    const actual = getValueByKey(key, obj)
    expect(actual).toBe(expected)
  })
  test("extract object value - nested key", () => {
    const expected = 42

    const key = "some.nested.value"
    const obj = {
      some: {
        nested: {
          value: expected,
        },
      },
    }
    const actual = getValueByKey(key, obj)
    expect(actual).toBe(expected)
  })
  test("extract object value - not an object", () => {
    const expected = null

    const key = "some.nested.value"
    const obj = "not an object"
    const actual = getValueByKey(key, obj)
    expect(actual).toBe(expected)
  })
})
