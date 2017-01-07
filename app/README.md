# Node.js crawler app for [data.gov.ua](http://data.gov.ua)

**PLEASE USE RESPONSIVELY WITH RESPECT TO DATA.GOV.UA INFRASTRUCTURE**

A simple node.js application to get metadata of datasets from [data.gov.ua](http://data.gov.ua) and store it in file with retry and backoff strategies.

## Quickstart

```sh
npm i
node app.js
```

## Download Strategies
By default a batch download strategy is used. This means that metadata of datasets will be downloaded and appended to file page by page from [datasets catalog](http://data.gov.ua/datasets). This is recommended strategy as the whole array of metadata is not stored in memory but freed and appended in batches.

If you by any chance want to process all the pages in bulk and then store the entire array in file, simply run:

```
node app.js --bulk
```

## Executing batch job with cron schedule

The cron format consists of:
```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

Examples with the cron format:

```
node app.js --cron "0 17 ? * 0,4-6"
```

To start job immediately after startup use `--run` option.

## Proxy
The app uses [global-tunnel](https://www.npmjs.com/package/global-tunnel) package to override `http.Agent` to use proxy settings if it is needed. This can be done by setting `http_proxy` environment variable. For any other options consult [package's doc](https://www.npmjs.com/package/global-tunnel).

## TODO
* Add ability to override default options
* Add EventEmitter functionality
* Refactor for programmatical usage
* Extract to separate repository and publish to npm


## Alternatives
https://github.com/mishkinstvo/DataGovUaParser

## License

MIT
