const {setOutput, getPackageVersion, checkPrevious} = require("./utils")

const cliVersion = process.env.FLOW_VERSION
const packageVersion = getPackageVersion()
const finish = checkPrevious(cliVersion, packageVersion)

setOutput("cliVersion", cliVersion)
setOutput("packageVersion", packageVersion)
setOutput("finish", finish)
