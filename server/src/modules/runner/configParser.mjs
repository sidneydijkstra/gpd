import fs from 'fs'
import YAML from 'yaml'

export function parseConfigFile(path){
    const file = fs.readFileSync(path, 'utf8')
    return YAML.parse(file)
}