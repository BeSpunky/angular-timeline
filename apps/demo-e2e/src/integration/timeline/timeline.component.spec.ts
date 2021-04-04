describe('demo', () => {
  beforeEach(() => cy.visit('/iframe.html?id=timelinecomponent--primary'));

  it('should render the component', () => {
    cy.get('app-timeline').should('exist');
  });
});
