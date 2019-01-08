const fse = require('fs-extra')
const path = require('path')

const inDir = 'public'
const outDir = 'build'

;(async () => {
  // await cleanAndMoveFromPublic()

  const result = await fse.readdir(inDir)
  const experiments = result.filter(x => !x.includes('.'))//?
  await fse.writeFile(path.join(outDir, 'experiments.json'), JSON.stringify(experiments))

})()

async function cleanAndMoveFromPublic() {
  try {
    await fse.remove(outDir)
  } catch(e) {
    throw e
  }
  try {
    await fse.copy(inDir, outDir)
  } catch(e) {
    throw e
  }
}
