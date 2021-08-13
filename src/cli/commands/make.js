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

import { writeFile } from "flow-cadut";
import testTemplate from "../templates/test";

const hashedTimestamp = () => {
  const s = new Date().getTime().toString();
  var hash = 0;
  if (s.length === 0) {
    return hash;
  }
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const command = {
  command: "make [name]",
  aliases: ["new"],
  describe: "Generate test suit",
  builder: (yargs) => {
    return yargs
      .positional("name", {
        describe: "- test suite and file prefix to use",
      })
      .option("clear", {
        alias: "c",
        type: "boolean",
        description: "Exclude comments from test suit code",
      })
      .option("base-path", {
        alias: "b",
        type: "string",
        description: "Exclude comments from test suit code",
      });
  },
  handler: (args) => {
    const name = args.name || `test-suit${hashedTimestamp()}`;
    const basePath = args.basePath || "../cadence";
    const clear = args.clear;

    console.log(`\n🔧 Generating test suit "${name}"`);
    const content = testTemplate(name, basePath, !clear);
    writeFile(`./${name}.test.js`, content);

    console.log("👍 Done! \n");
  },
};

export default command;
