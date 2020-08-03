const { testUtils } = require('@cumulus/api');
const { promiseS3Upload } = require('@cumulus/aws-client/S3');
const fs = require('fs');
const serveUtils = require('@cumulus/api/bin/serveUtils');
const { eraseDataStack } = require('@cumulus/api/bin/serve');
const {
  localUserName,
  localStackName,
  localSystemBucket,
} = require('@cumulus/api/bin/local-test-defaults');

const collections = require('../fixtures/seeds/collectionsFixture.json');
const executions = require('../fixtures/seeds/executionsFixture.json');
const granules = require('../fixtures/seeds/granulesFixture.json');
const providers = require('../fixtures/seeds/providersFixture.json');
const rules = require('../fixtures/seeds/rulesFixture.json');
const pdrs = require('../fixtures/seeds/pdrsFixture.json');
const reconciliationReports = require('../fixtures/seeds/reconciliationReportFixture.json');
const reconciliationReportDir = `${__dirname}/../fixtures/seeds/reconciliation-reports`;

function resetIt() {
  return Promise.all([
    eraseDataStack(),
    testUtils.setAuthorizedOAuthUsers([localUserName]),
  ]);
}

function seedProviders() {
  return serveUtils.addProviders(providers.results);
}

function seedCollections() {
  return serveUtils.addCollections(collections.results);
}

function seedGranules() {
  return serveUtils.addGranules(granules.results);
}

function seedExecutions() {
  return serveUtils.addExecutions(executions.results);
}

function seedReconciliationReports() {
  return serveUtils.addReconciliationReports(reconciliationReports.results);
}

function seedRules() {
  return serveUtils.addRules(rules.results);
}

function seedPdrs() {
  return serveUtils.addPdrs(pdrs.results);
}

function uploadReconciliationReportFiles() {
  const reconcileReportList = fs
    .readdirSync(reconciliationReportDir)
    .map((f) => ({
      filename: f,
      data: JSON.parse(
        fs.readFileSync(`${reconciliationReportDir}/${f}`).toString()
      ),
    }));

  return Promise.all(
    reconcileReportList.map((obj) => {
      const { filename, data } = obj;
      return promiseS3Upload({
        Bucket: `${localSystemBucket}`,
        Key: `${localStackName}/reconciliation-reports/${filename}`,
        Body: JSON.stringify(data),
      });
    })
  );
}

function seedEverything() {
  return Promise.all([
    resetIt()
      .then(seedPdrs)
      .then(seedRules)
      .then(seedCollections)
      .then(seedGranules)
      .then(seedExecutions)
      .then(seedProviders)
      .then(seedReconciliationReports),
    uploadReconciliationReportFiles(),
  ]);
}

module.exports = {
  resetIt,
  seedEverything,
  uploadReconciliationReportFiles,
};
