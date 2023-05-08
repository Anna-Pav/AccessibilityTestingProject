/// <reference types="cypress" />
import {type CypressCheckSettings, type CypressEyesConfig, type CypressTestResultsSummary} from './expose'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Create an Applitools test.
       * This will start a session with the Applitools server.
       * @example
       * cy.eyesOpen({ appName: 'My App' })
       */
      eyesOpen(config?: CypressEyesConfig): null

      /**
       * Generate a screenshot of the current page and add it to the Applitools Test.
       * @example
       * cy.eyesCheckWindow()
       *
       * OR
       *
       * cy.eyesCheckWindow({
       *  target: 'region',
       *  selector: '.my-element'
       * });
       */
      eyesCheckWindow(...args: [tag?: string] | [settings?: CypressCheckSettings]): null

      /**
       * Close the applitools test and check that all screenshots are valid.
       * @example cy.eyesClose()
       */
      eyesClose(): null

      /**
       * Returns an object with the applitools test results from a given test / test file. This should be called after close.
       * @example
       * after(() => {
       *  cy.eyesGetAllTestResults().then(summary => {
       *    console.log(summary)
       *  })
       * })
       */
      eyesGetAllTestResults(): Chainable<CypressTestResultsSummary>
    }
  }
}

import exposeDefault from './expose'
export default exposeDefault
