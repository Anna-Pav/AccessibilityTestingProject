/// <reference types="cypress"/>
/// <reference types="@applitools/eyes-cypress"/>

describe('Contrast Advisor Demo', ()=>{

    //demo using ApplitoolsEyes Accessibility tool
    it('should show contrast issues on Applitools dashboard', ()=>{
       cy.eyesOpen({
        appName: 'Contrast Advisor Demo',
        batchName: 'Contast Advisor Demo'
       });

       cy.visit('https://www.themarginalian.org/');
       cy.eyesCheckWindow();
       cy.eyesClose();
    });

})