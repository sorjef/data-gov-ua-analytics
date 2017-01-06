const program = require('commander');
const CronJob = require('cron').CronJob;
const crawler = require('./crawler');

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
