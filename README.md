# Crawler for [data.gov.ua](http://data.gov.ua)

A full ETL component which crawls metadata of datasets from [data.gov.ua](http://data.gov.ua) and uploads it to ElasticSearch exposing Kibana as the search UI.
To use crawler node.js application separately, check out [app folder](app)

![Kibana Screenshot](https://api.monosnap.com/rpc/file/download?id=6NCgrFjiOxdZlVmwp5XoQou124JBYn)

## Prerequisite
* [Docker](https://www.docker.com/products/docker) (On OSX or Windows use only native docker distribution)

## Quickstart

```
docker-compose up
```

Wait a bit for some data to be downloaded and indexed in ES and then open [localhost:5601](localhost:5601) to access Kibana.

In the "Index Patterns" field, type `data.gov.ua-*` and then press "Create". Use kibana to query metadata and setup your visualizations.

To stop containers, execute:
```
docker-compose stop
```

To fully cleanup the system removing all the downloaded data and containers, run:

```
docker-compose down
```

For any other commands, consult [Docker Compose Documentation](https://docs.docker.com/compose/)

## How it works

It schedules a batch crawling job with the following cron string `0 10 0 * * *`. This means that crawler will run every day at 00:10. Check out [app folder](app) for more options.

## Services

* `crawler` - [node.js app](app) to crawl data and store it in a file.
* `elasticsearch` - ElasticSearch service. Exposes 9200 port, so use [localhost:9200](localhost:9200) to access ES API.
* `logstash` - Logstash service. Configuration files can be found in [logstash folder](logstash)
* `kibana` - Kibana service. Exposes 5601 port, so open [localhost:5601](localhost:5601) to access Kibana UI.

## Data Volumes

* `metadata` - stores crawled metadata files
* `elasticsearch_config` - stores ElasticSearch configuration files
* `elasticsearch_data` - stores ElasticSearch data files
* `kibana_config` - stores Kibana configuration files

To list names of the data volumes, run:

```sh
docker volume ls
```

then

```sh
docker volume inspect [volume_name]
```

`Mountpoint` field represents a path to files on your local filesystem.

## Troubleshooting
If you by any chance stop seeing any data after removing all the containers and restarting docker, try checking whether you've reached your daily limit by opening any dataset link [for example this one](http://data.gov.ua/view-dataset/dataset.json?dataset-id=1746ff75-dc39-4460-8035-f25006695d58). If you see a message like "You have reached your limit for today", consider using VPN or [http://proxylist.hidemyass.com/](proxy). If you have a production server consider implementing rotating proxy or using third-party servers like https://crawlera.com/, http://proxymesh.com/ or https://luminati.io/, etc.

## License

MIT © [O(one)](http://oone.tech)
