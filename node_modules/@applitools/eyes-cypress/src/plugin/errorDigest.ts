type Color = 'reset' | 'green' | 'red' | 'teal' | 'orange'
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  teal: '\x1b[38;5;86m',
  orange: '\x1b[38;5;214m',
  reset: '\x1b[0m',
}
const formatByStatus: Record<string, {color: Color; symbol: string; title: (tests: number) => string}> = {
  Passed: {
    color: 'green',
    symbol: '\u2713',
    title: (tests: number) => `Passed - ${tests} tests`,
  },
  Failed: {
    color: 'red',
    symbol: '\u2716',
    title: (tests: number) => `Errors - ${tests} tests`,
  },
  Unresolved: {
    color: 'orange',
    symbol: '\u26A0',
    title: (tests: number) => `Diffs detected - ${tests} tests`,
  },
}

function stringifyTestResults(testResults: any) {
  const hostDisplaySize = testResults.hostDisplaySize
  const viewport = hostDisplaySize ? `[${hostDisplaySize.width}x${hostDisplaySize.height}]` : ''
  const testName = `${testResults.name} ${viewport}`
  return testName + (testResults.error ? ` : ${testResults.error}` : '')
}

function testResultsSection(title: string, results: any) {
  return results.length ? `${indent()}${title}${indent(3)}${results.join(indent(3))}` : ''
}

function stringifyError(testResults: any) {
  return testResults.error ? stringifyTestResults(testResults) : `[Eyes test not started] : ${testResults}`
}

function indent(spaces = 2) {
  return `\n   ${'  '.repeat(spaces)}`
}

function hasError(testResult: any) {
  return testResult.error || testResult instanceof Error
}

export default function errorDigest({passed, failed, diffs, logger, isInteractive}: any) {
  logger.log('errorDigest: diff errors', diffs)
  logger.log('errorDigest: test errors', failed)

  const testResultsUrl = diffs.length ? colorify(` ${diffs[0].url} `, 'teal') : '' // the space around the url is for the link to be clickable in the cypress run
  const testResultsPrefix = testResultsUrl ? 'See details at:' : ''
  const footer = testResultsUrl ? `\n${indent()}${colorify(testResultsPrefix)}${testResultsUrl}` : ''
  return (
    colorify('Eyes-Cypress detected diffs or errors during execution of visual tests.') +
    colorify(` ${testResultsPrefix}${testResultsUrl}`) +
    testResultsToString(passed, 'Passed') +
    testResultsToString(diffs, 'Unresolved') +
    testResultsToString(failed, 'Failed') +
    footer +
    '\n\n'
  )

  function testResultsToString(testResultsArr: any, category: 'Passed' | 'Failed' | 'Unresolved') {
    const {color, title, symbol} = formatByStatus[category]
    const results = testResultsArr.reduce((acc: any, testResults: any) => {
      if (!testResults.isEmpty) {
        const error = hasError(testResults) ? stringifyError(testResults) : undefined
        acc.push(`${colorify(symbol, color)} ${colorify(error || stringifyTestResults(testResults))}`)
      }
      return acc
    }, [])

    const coloredTitle = results.length ? colorify(title(results.length), color) : ''
    return testResultsSection(coloredTitle, results)
  }

  function colorify(msg: any, color: Color = 'reset') {
    return isInteractive ? msg : `${colors[color]}${msg}${colors.reset}`
  }
}
