const http = require('http');
const HttpProxyAgent = require('http-proxy-agent');
const program = require('commander');
const CronJob = require('cron').CronJob;
const crawler = require('./crawler');


// Initialize global agent to use proxy configured with the http_proxy environment variable
const proxy = process.env.http_proxy;
if (proxy) {
  http.globalAgent = new HttpProxyAgent(proxy);
}

const log = console.log;

// TODO Add more options
program
  .option('-b, --bulk', 'Use bulk mode crawling strategy')
  .option('-c, --cron <str>', 'Use cron string to reschedule batch crawling continuously. Only batch mode supported')
  .option('-r, --run', 'If cron parameter specified also runs job immediately after the startup')
  .parse(process.argv);

if (!program.cron) {
  if (program.bulk) {
    crawler.bulk();
  } else {
    crawler.batch();
  }
} else {
  log(`Using cron ${program.cron} to schedule batch download. Run immediately flag is set to ${program.run}`);
  const job = new CronJob({
    cronTime: program.cron,
    onTick: () => crawler.batch(),
    runOnInit: program.run,
  });
  job.start();
}
