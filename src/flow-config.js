import path from "path"
import fs from "fs"

const TARGET = "flow.json"
let configPath = null
let config = null

function isDir(dir) {
  return fs.lstatSync(dir).isDirectory()
}

function listFiles(dir) {
  return new Set(fs.readdirSync(dir))
}

function parentDir(dir) {
  return path.dirname(dir)
}

function findTarget(dir) {
  if (!isDir(dir)) throw new Error(`Not a directory: ${dir}`)
  return listFiles(dir).has(TARGET) ? path.resolve(dir, TARGET) : null
}

export function getConfigPath(dir) {
  if (configPath != null) return configPath

  const filePath = findTarget(dir)
  if (filePath == null) {
    if (dir === parentDir(dir)) {
      throw new Error("No flow.json found")
    }
    return getConfigPath(parentDir(dir))
  }

  configPath = filePath
  return configPath
}

export function flowConfig() {
  if (config != null) return config

  const filePath = getConfigPath(process.cwd())
  const content = fs.readFileSync(filePath, "utf8")
  config = JSON.parse(content)

  return config
}
