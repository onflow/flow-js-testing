const fs = require("fs")

const setOutput = (name, output) => {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${output}\n`, "utf-8")
}

const getPackageVersion = () => {
  const file = fs.readFileSync("./package.json", "utf-8")
  const packageJSON = JSON.parse(file)

  return packageJSON.version
}

const checkPrevious = (cliVersion, packageVersion) => {
  const file = fs.readFileSync("./compatibility.json", "utf-8")
  const json = JSON.parse(file)

  if (json[cliVersion]) {
    const checkpoint = json[cliVersion][packageVersion]
    return !(!checkpoint || checkpoint.status === "fail")
  }

  return false
}

const getTestResult = () => {
  const pathName = "./jest.result.json"
  const file = fs.readFileSync(pathName, "utf-8")
  const json = JSON.parse(file)

  return json.success
}

module.exports = {
  setOutput,
  getTestResult,
  getPackageVersion,
  checkPrevious,
}
