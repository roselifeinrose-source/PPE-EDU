import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, 'db')

export function readJSON(filename) {
  try {
    const filePath = path.join(DB_DIR, filename)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`readJSON ${filename}:`, err.message)
    return null
  }
}

export function writeJSON(filename, data) {
  try {
    const filePath = path.join(DB_DIR, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error(`writeJSON ${filename}:`, err.message)
  }
}
