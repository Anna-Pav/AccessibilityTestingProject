'use strict'

const chalk = require('chalk')
const boxen = require('boxen')
const {addEyesCypressPlugin} = require('./addEyesCypressPlugin')
const isPluginDefined = require('./isPluginDefined')
const isPluginDefinedESM = require('./isPluginDefinedESM')
const fs = require('fs')

function handlePlugin(pluginsFilePath) {
  const fileContent = fs.readFileSync(pluginsFilePath, 'utf-8')
  const isESMOrTS = fileContent.indexOf('module.export') === -1
  if (!isESMOrTS && !isPluginDefined(fileContent)) {
    fs.writeFileSync(pluginsFilePath, addEyesCypressPlugin(fileContent))
    console.log(chalk.cyan('Plugins defined.'))
  } else if (isESMOrTS && !isPluginDefinedESM(fileContent)) {
    console.log(
      boxen(
        `
We detected that you are using TS or ESM syntax. Please configure the plugin as follows:

${chalk.green.bold('import eyesPlugin from "@applitools/eyes-cypress"')}

export default ${chalk.green.bold('eyesPlugin(')}definedConfig({
  //...
})${chalk.green.bold(')')}

For more information, visit Eyes-Cypress documentation https://applitools.com/docs/api-ref/sdk-api/cypress/typescript
`,
        {padding: 1, borderColor: 'cyan'},
      ),
    )
  } else {
    console.log(chalk.cyan('Plugins already defined'))
  }
}

module.exports = handlePlugin
