import * as fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const rootPath = process.cwd()
const packageJSONPath = resolve(rootPath, 'lib/preactopod/package.json')
const adaptorPackageJSONPath = resolve(
  rootPath,
  'lib/preactopod/adaptor/package.json'
)

Promise.all([
  readFile(packageJSONPath, 'utf8')
    .then(JSON.parse)
    .then(packageJSON =>
      writeFile(
        packageJSONPath,
        JSON.stringify(patchPackageJSON(packageJSON), null, 2)
      )
    ),

  writeFile(
    adaptorPackageJSONPath,
    JSON.stringify({ main: './preact' }, null, 2)
  )
]).catch(err => {
  console.error(err)
  process.exit(1)
})

type PackageJSON = {
  name: string
  description: string
  keywords: string[]
  peerDependencies: { [key: string]: string }
  [key: string]: any
}

function patchPackageJSON(packageJSON: PackageJSON): PackageJSON {
  return Object.assign({}, packageJSON, {
    name: '@typesaurus/preact',
    description: packageJSON.description.replace('React', 'Preact'),
    keywords: packageJSON.keywords.reduce(
      (acc, keyword) => acc.concat(keyword.replace('React', 'Preact')),
      [] as string[]
    ),
    peerDependencies: Object.assign({}, packageJSON.peerDependencies, {
      preact: '*'
    })
  })
}
