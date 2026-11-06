describe('Event creation /event/new', () => {
  it('submits a valid event and shows success', () => {
    cy.visit('/event/new');

    cy.get('#event-nome').type('DevFest Cypress 2026');
    cy.get('#event-endereco').type('Rua das Flores, 123');
    cy.get('#event-capacidade').type('250');
    cy.get('#event-data').type('2026-11-20');

    cy.get('button.event-creation__submit').click();

    cy.get('.event-creation__success')
      .should('be.visible')
      .and('contain', 'DevFest Cypress 2026')
      .and('contain', 'cadastrado com sucesso');
  });

  it('shows native validation messages when submitting empty form', () => {
    cy.visit('/event/new');

    cy.get('button.event-creation__submit').click();

    cy.get('#event-nome:invalid').should('exist');
    cy.get('#event-nome').should(($el) => {
      expect(($el[0] as HTMLInputElement).validationMessage).to.not.equal('');
    });

    cy.get('.event-creation__success').should('not.exist');
  });
});
