/// <reference types="cypress"/>

describe('Todo application', ()=>{

    beforeEach(()=>{
        cy.visit('https://example.cypress.io/todo')
        cy.injectAxe() //always after cy.visit
    })

    it('should log any accessibility issues', ()=>{
        cy.checkA11y() //scans webpage for ally failures
    })

    it('should exclude specific elements on the page', ()=>{
        cy.checkA11y({
            exclude: ['.toggle'] //will exclude the .toggle elements from the issues
        }) 
    })

    it('should only test specific elements on the page', ()=>{
        cy.checkA11y('.toggle') //will only test the .toggle element
    })

    it('should only test specific rules with critical impact', ()=>{
        //will only test rules with impact: critical
        cy.checkA11y(null, {includedImpacts:['critical']}) 
    })

    it('should exclude specific accessibility rules', ()=>{
        //will exclude rules with impact: critical
        cy.checkA11y(null, {includedImpacts:['critical']}) 
    })
})