import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Granules Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/#/granules');
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    beforeEach(() => {
      cy.login();
      cy.task('resetState');
    });

    after(() => {
      cy.task('resetState');
    });

    it('should display a link to view granules', () => {
      cy.visit('/');

      cy.contains('nav li a', 'Granules').as('granules');
      cy.get('@granules').should('have.attr', 'href', '#/granules');
      cy.get('@granules').click();

      cy.url().should('include', 'granules');
      cy.contains('.heading--xlarge', 'Granules');
      cy.contains('.heading--large', 'Granule Overview');

      // shows a summary count of completed and failed granules
      cy.get('.overview-num__wrapper ul li')
        .first()
        .contains('li', '243 Completed')
        .next()
        .contains('li', '32 Failed')
        .next()
        .contains('li', '14 Running');

      // shows a list of granules
      const granulesFile = './test/fake-api-fixtures/granules/index.json';
      cy.readFile(granulesFile).as('granulesList');

      cy.get('table tbody tr').as('list');
      cy.get('@list').its('length').should('be.eq', 10);

      // compare data in each row with the data from fixture
      cy.get('@list').each(($el, index, $list) => {
        cy.wrap($el).children().as('rows');
        cy.get('@rows').its('length').should('be.eq', 8);

        cy.get('@granulesList').its('results').then((granules) => {
          const granule = granules[index];

          // granule Status column
          cy.get('@rows').eq(1).invoke('text')
            .should('be.eq', granule.status.replace(/^\w/, c => c.toUpperCase()));
          // has link to the granule list with the same status
          cy.get('@rows').eq(1).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `#/granules/${granule.status}`);

          // granule Name (id) column
          cy.get('@rows').eq(2).invoke('text')
            .should('be.eq', granule.granuleId);
          // has link to the detailed granule page
          cy.get('@rows').eq(2).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `#/granules/granule/${granule.granuleId}`);

          // Published column, only public granules have CMR link
          if (granule.published) {
            cy.get('@rows').eq(3).invoke('text')
              .should('be.eq', 'Yes');
            cy.get('@rows').eq(3).children('a')
              .should('have.attr', 'href')
              .and('include', 'https://cmr');
          } else {
            cy.get('@rows').eq(3).invoke('text')
              .should('be.eq', 'No');
            cy.get('@rows').eq(3).children('a')
              .should('not.exist');
          }

          // Collection ID column
          cy.get('@rows').eq(4).invoke('text')
            .should('be.eq', granule.collectionId.replace('___', ' / '));
          // has link to the detailed collection page
          cy.get('@rows').eq(4).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `#/collections/collection/${granule.collectionId.replace('___', '/')}`);

          // Execution column has link to the detailed execution page
          cy.get('@rows').eq(5).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `#/executions/execution/${granule.execution.split('/').pop()}`);

          // Duration column
          cy.get('@rows').eq(6).invoke('text')
            .should('be.eq', `${Number(granule.duration.toFixed(2))}s`);
          // Updated column
          cy.get('@rows').eq(7).invoke('text')
            .should('match', /.+ago$/);
        });
      });
    });

    it('returns CMR metadata for corresponding granule when a CMR link is clicked', () => {
      cy.server();

      cy.visit('/#/granules');

      cy.get('table tbody tr').its('length').should('be.eq', 10);

      // verify CMR links for two of the public granules
      const granuleIds = ['MOD09GQ.A5456658.rso6Y4.006.4979096122140', 'MOD09GQ.A1530852.CljGDp.006.2163412421938'];
      granuleIds.forEach((granuleId) => {
        cy.contains('table tbody tr', granuleId)
          .contains('td a', 'Yes')
          .should('have.attr', 'href')
          .then((link) => {
            const conceptId = link.split('=').pop();
            cy.route(link, `fixture:cmr/${conceptId}`);
            cy.request(link)
              .then((response) => expect(response.body.feed.entry[0].title).to.equal(granuleId));
          });
      });
    });
  });
});
