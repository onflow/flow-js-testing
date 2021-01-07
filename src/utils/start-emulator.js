const { spawn } = require("child_process");

function start() {
  const flow = spawn("flow", ["emulator", "start", "-v"]);

  // flow.stdout.on("data", (data) => {
  //   console.log(`${data}`);
  // });

  // flow.stderr.on("data", (data) => {
  //   console.log(`stderr: ${data}`);
  // });

  // flow.on("error", (error) => {
  //   console.log(`error: ${error.message}`);
  // });

  // flow.on("close", (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });

  return flow;
}

module.exports = {
  start,
};
