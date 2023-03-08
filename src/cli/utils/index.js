import {dirname} from "path"
import fs from "fs"

export const writeFile = (path, data) => {
  const targetDir = dirname(path)
  fs.mkdirSync(targetDir, {recursive: true})
  return fs.writeFileSync(path, data, {encoding: "utf8"})
}
