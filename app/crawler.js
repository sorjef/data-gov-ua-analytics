const request = require('request-promise');
const BlueBirdQueue = require('bluebird-queue');
const cheerio = require('cheerio');
const retry = require('bluebird-retry');
const fs = require('fs-bluebird');

const config = {
  structuredFormats: ['json', 'xml', 'csv', 'xls', 'xlsx', 'yaml'],
  catalogUrl: 'http://data.gov.ua/datasets',
  baseCatalogPageUrl: 'http://data.gov.ua/datasets?field_organization_value=&title=&sort_bef_combine=created%20DESC&sort_order=DESC&sort_by=created&page=',
  datasetsCountElement: '.view-category-dataset-views .field-content .field-content',
  datasetLinkElement: '.views-field-field-big-title a',
  metadataFile: `../data/metadata-${new Date().toISOString()}.json`,
  retryOptions: {
    max_tries: 100,
    interval: 300,
    backoff: 2,
  },
  catalogRequestQueue: {
    concurrency: 10,
  },
  datasetInfosQueue: {
    concurrency: 10,
    delay: 1000,
    interval: 300,
  },
  metadataRequestQueue: {
    concurrency: 10,
    delay: 300,
  },
};

const log = console.log;

const requestCatalog = function requestCatalog() {
  log('Requesting data.gov.ua main page');
  return retry(() => request(config.catalogUrl), config.retryOptions);
};

const getPagesCount = function getPagesCount(res) {
  const $ = cheerio.load(res);
  const datasetCatalogElements = $(config.datasetsCountElement).toArray();
  const datasetsCount = datasetCatalogElements.reduce((prev, elem) =>
    prev + parseInt($(elem).text(), 10)
  , 0);

  const pagesCount = Math.floor(datasetsCount / 10);

  log('Datasets count', datasetsCount);
  log('Pages count', pagesCount);

  return pagesCount;
};

const requestCatalogPage = function requestCatalogPage(i) {
  return request(config.baseCatalogPageUrl + i);
};

const requestCatalogPages = function requestCatalogPages(pagesCount) {
  const queue = new BlueBirdQueue(config.catalogRequestQueue);
  for (let i = 1; i < pagesCount; i += 1) {
    queue.add(() => {
      const requestPageI = requestCatalogPage.bind(null, i);
      return retry(requestPageI, config.retryOptions);
    });
  }
  return queue.start();
};

const getDatasetInfos = function getDatasetInfos(page) {
  const $ = cheerio.load(page);
  const datasets = $(config.datasetLinkElement).toArray().map((elem) => {
    const link = $(elem).attr('href');
    const id = link.substr(link.lastIndexOf('/') + 1);
    return {
      id,
      link,
      view: `http://data.gov.ua/view-dataset/dataset.json?dataset-id=${id}`,
    };
  });
  return datasets;
};

const flattenDatasetInfos = function flattenDatasetInfos(prev, cur) {
  return prev.concat(cur);
};

const logInfos = function logInfos(datasets) {
  log('Found', datasets.length, 'datasets');
  return datasets;
};

const requestSingleMetadata = function requestSingleMetadata(dataset) {
  log(dataset.view);
  return request({
    uri: dataset.view,
    json: true,
  });
};

const requestMultipleMetadata = function requestMultipleMetadata(datasets) {
  const queue = new BlueBirdQueue(config.metadataRequestQueue);
  datasets.forEach((dataset) => {
    const retryRequestSingleMetadata =
      retry.bind(retry, requestSingleMetadata.bind(null, dataset), config.retryOptions);
    queue.add(retryRequestSingleMetadata);
  });
  return queue.start();
};

// const filterStructured = function filterStructured(dataset) {
//   return dataset.files
//     && dataset.files.some(file => config.structuredFormats.includes(file.format));
// };

const appendToFile = function appendToFile(datasets) {
  const promise = fs.appendFileAsync(config.metadataFile, `\n${JSON.stringify(datasets)}`, 'utf8');
  log('Metadata appended to', config.metadataFile);
  return promise;
};

const writeToFile = function writeToFile(datasets) {
  const promise = fs.writeFileAsync(config.metadataFile, JSON.stringify(datasets), 'utf8');
  log('Metadata saved to', config.metadataFile);
  return promise;
};

const strategies = {
  // TODO Add an ability to pass options
  bulk: () => requestCatalog()
    .then(getPagesCount)
    .then(requestCatalogPages)
    .map(getDatasetInfos)
    .reduce(flattenDatasetInfos, [])
    .then(logInfos)
    .then(requestMultipleMetadata)
    // .filter(filterStructured)
    .map(writeToFile),

  // TODO Add an ability to pass options
  batch: () =>
    requestCatalog()
    .then(getPagesCount)
    .then((pagesCount) => {
      const queue = new BlueBirdQueue(config.datasetInfosQueue);
      for (let i = 1; i < pagesCount; i += 1) {
        queue.add(() => {
          const requestPageI = requestCatalogPage.bind(null, i);
          log(`Processing page ${i}. ${pagesCount - i} pages left.`);
          return retry(requestPageI, config.retryOptions)
            .then(getDatasetInfos)
            .then(logInfos)
            .then(requestMultipleMetadata)
            .then(appendToFile);
        });
      }
      return queue.start();
    }),
};

module.exports = strategies;
