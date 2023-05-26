const fs = require("fs")
const prettier = require("prettier")

const cliVersion = process.env.FLOW_VERSION
const packageVersion = process.env.PACKAGE_VERSION
const result = process.env.TEST_RESULT

const update = () => {
  const file = fs.readFileSync("./compatibility.json", "utf-8")
  const json = JSON.parse(file)

  if (!json[cliVersion]) {
    json[cliVersion] = {}
  }

  json[cliVersion][packageVersion] = {
    timestamp: new Date().getTime(),
    status: result,
  }

  const pretty = prettier.format(JSON.stringify(json), {
    parser: "json",
  })

  fs.writeFileSync("./compatibility.json", pretty)
}

update(cliVersion, packageVersion, result)

console.log({cliVersion, packageVersion, result})
console.log("Compatibility file has been updated")
