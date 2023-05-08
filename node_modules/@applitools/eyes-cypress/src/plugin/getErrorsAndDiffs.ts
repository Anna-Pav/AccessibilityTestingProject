export default function getErrorsAndDiffs(testResultsArr: any) {
  return testResultsArr.reduce(
    ({failed, diffs, passed}: any, testResults: any) => {
      if (testResults instanceof Error || testResults.error) {
        failed.push(testResults)
      } else {
        const testStatus = testResults.status
        if (testStatus === 'Passed') {
          passed.push(testResults)
        } else {
          if (testStatus === 'Unresolved') {
            if (testResults.isNew) {
              testResults.error = new Error(`${testResults.name}. Please approve the new baseline at ${testResults.url}`)
              failed.push(testResults)
            } else {
              diffs.push(testResults)
            }
          } else if (testStatus === 'Failed') {
            failed.push(testResults)
          }
        }
      }

      return {failed, diffs, passed}
    },
    {failed: [], diffs: [], passed: []},
  )
}
