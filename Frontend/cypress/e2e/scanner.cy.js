const scannerCases = [
  { prefix: 'K', item: 'Teclado ESENSES Basico USB' },
  { prefix: 'M', item: 'Mouse Alámbrico HP Óptico negro 100' },
  { prefix: 'DPVG', item: 'Cable Display Port a VGA 1,8' },
  { prefix: 'VGAV', item: 'Cable Display VGA a VGA 1,8' },
  { prefix: 'EXT', item: 'Extension de Cable eléctrico' },
  { prefix: 'DPHD', item: 'Cable Display Port a HDMI 1,8' },
  { prefix: 'HD', item: 'Cable HDMI a HDMI 1,8 Metros' },
  { prefix: 'CLAN', item: 'Cable LAN-RJ45 1,8 Metros' },
  { prefix: 'CVGAHD', item: 'Cable VGA a HDMI 1,8 Metros' },
  { prefix: 'CDPVGA', item: 'Conversores Displayport a VGA Hembra' },
  { prefix: 'ELU3', item: 'Ethernet 3,0 LAN a USB' },
  { prefix: 'ELU', item: 'Ethernet USB' },
  { prefix: 'ELUE', item: 'Ethernet USB 2,0' },
];

const nowStamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${min}${sec}`;
};

const serialFor = (prefix, index) => `${prefix}CYP${nowStamp()}${String(index + 1).padStart(2, '0')}`;

const getDate = () => new Date().toISOString().split('T')[0];

const openAdmin = () => {
  const baseUrl = (Cypress.config('baseUrl') || 'http://localhost:3000').replace(/\/$/, '');

  cy.visit(`${baseUrl}/admin`, {
    onBeforeLoad(win) {
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('auth_token', 'cypress-test-token');
      win.localStorage.setItem('csrf_token', 'cypress-csrf-token');
    },
  });

  cy.contains('OTD SUPPORT', { timeout: 10000 }).should('be.visible');
  cy.wait(4200);
  cy.contains('Admin', { timeout: 10000 }).should('be.visible');
};

const getAssetBySerial = (serial) => cy.request('GET', `http://localhost:8000/api/almacen?search=${encodeURIComponent(serial)}`)
  .its('body')
  .then((body) => body.find((asset) => asset.Serial === serial));

describe('Scanner menu e2e flow', () => {
  beforeEach(() => {
    openAdmin();
  });

  it('opens scanner config and help', () => {
    cy.contains('Scanner').click();
    cy.contains('Configure Scanner').should('be.visible');
    cy.contains('Scanner Help').click();
    cy.contains('Use the Scanner button in this order', { timeout: 10000 }).should('exist');
    cy.contains('Activate Scanner').should('exist');
  });

  it('can use every scanner mode with unique serials and no duplicates', () => {
    scannerCases.forEach((scannerCase, index) => {
      const serial = serialFor(scannerCase.prefix, index);
      const destination = `COL-ATT-${scannerCase.prefix}-008`;

      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/almacen',
        body: {
          Item: scannerCase.item,
          Serial: serial,
          Fecha_Ingreso: getDate(),
          Fecha_Salida: null,
          Destino: null,
          Tipo_Retorno: null,
          Observaciones_Retorno: null,
          Sede_Actual: 'Connecta 80',
        },
      }).its('status').should('be.oneOf', [200, 201]);

      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/almacen',
        failOnStatusCode: false,
        body: {
          Item: scannerCase.item,
          Serial: serial,
          Fecha_Ingreso: getDate(),
          Fecha_Salida: null,
          Destino: null,
          Tipo_Retorno: null,
          Observaciones_Retorno: null,
          Sede_Actual: 'Connecta 80',
        },
      }).its('status').should('eq', 400);

      getAssetBySerial(serial).then((asset) => {
        expect(asset, `asset for ${serial}`).to.exist;
        expect(asset.Item).to.eq(scannerCase.item);
        expect(asset.Serial).to.eq(serial);
        expect(asset.Sede_Actual).to.eq('Connecta 80');
      });

      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/almacen',
      }).its('body').then((assets) => {
        const created = assets.find((asset) => asset.Serial === serial);
        expect(created, `created asset ${serial}`).to.exist;
        cy.request({
          method: 'PUT',
          url: `http://localhost:8000/api/almacen/${created.ID}`,
          body: {
            Fecha_Salida: getDate(),
            Destino: destination,
            Tipo_Retorno: null,
            Observaciones_Retorno: null,
          },
        }).its('status').should('eq', 200);

        cy.request({
          method: 'PUT',
          url: `http://localhost:8000/api/almacen/${created.ID}`,
          body: {
            Fecha_Salida: null,
            Destino: null,
            Tipo_Retorno: 'Return',
            Observaciones_Retorno: `E2E return test for ${scannerCase.prefix}`,
          },
        }).its('status').should('eq', 200);
      });
    });

    cy.contains('Scanner').click();
    cy.contains('Scanner Help').click();
    cy.contains('Register saves immediately').should('exist');
  });
});