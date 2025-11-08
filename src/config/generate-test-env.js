import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const setEnv = () => {
  const writeFile = fs.writeFile
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const targetPath = path.join(__dirname, '/environment.js')

  const configFile = `export const environment = {  
    api_url: '${process.env.API_URL_TEST}',
    max_file_size: '${process.env.MAX_FILE_SIZE}',
    public_token: '${process.env.PUBLIC_TOKEN}',
  };`
  writeFile(targetPath, configFile, (err) => {
    if (err) console.error(err)
    else console.log(`Front end environment.js file generated correctly at ${targetPath} \n`)
  })
}

setEnv()
