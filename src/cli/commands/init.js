/*
 * Flow JS Testing
 *
 * Copyright 2021 Dapper Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { execSync } from "child_process";
import { writeFile } from "flow-cadut";

import babelConfig from "../templates/babel-config";
import jestConfig from "../templates/jest-config";

const command = {
  command: "init",
  describe: "Install dependencies and prepare config files",
  handler: () => {
    console.log("\n🔧 Installing dependencies");
    execSync("npm init --yes", { stdio: [0, 1, 2] });
    execSync(
      "npm install --save-dev flow-js-testing jest @babel/core @babel/preset-env babel-jest jest-environment-node",
      {
        stdio: [0, 1, 2],
      },
    );

    console.log("🏄 Generating Flow config");
    execSync("flow init --reset");

    console.log("🧪 Creating Babel and Jest config files");
    writeFile("./babel.config.js", babelConfig);
    writeFile("./jest.config.js", jestConfig);

    console.log("👍 Done! \n");
    console.log("\n 👉 You can create new test file with 'npx flow-js-testing make' command \n");
  },
};

export default command;
