# Crawler for [data.gov.ua](http://data.gov.ua)

**PLEASE USE RESPONSIVELY WITH RESPECT TO DATA.GOV.UA INFRASTRUCTURE**

A full ETL component which crawls metadata of datasets from [data.gov.ua](http://data.gov.ua) utilizing a rotating proxy and uploads it to ElasticSearch exposing Kibana as the search UI.
To use crawler node.js application separately, check out [app folder](app)

![Kibana Screenshot](https://api.monosnap.com/rpc/file/download?id=7vr3NJUoP1t2NSwMJSnYV4WXzEwaj1)

## Prerequisite
* [Docker](https://www.docker.com/products/docker) (On OSX or Windows use only native docker distribution)

## Quickstart

```
docker-compose up
```

Wait a bit for some data to be downloaded and indexed in ES and then open [localhost:5601](localhost:5601) to access Kibana.

In the "Index Patterns" field, type `data.gov.ua-*` and then press "Create". Use kibana to query metadata and setup your visualizations.

## Cleaning Up

To stop containers, execute:
```
docker-compose stop
```

To fully cleanup the system removing all the downloaded data and containers, run:

```
docker-compose down --volumes
```

For any other commands, consult [Docker Compose Documentation](https://docs.docker.com/compose/)

## Kibana

To add default visualizations and dashboard like on the screenshot above, follow these steps:
1. Open Kibana - [localhost:5601](http://localhost:5601)
2. Go to `Management` -> `Saved Objects`
3. Click `Import` button and choose `dashboard.json` file from [kibana](kibana) folder

## How it works

It schedules a batch crawling job with the following cron string `0 10 0 * * 6`. This means that crawler will run every Saturday at 00:10. Check out [app folder](app) for more options. It also runs a [docker container with rotating proxy](https://github.com/mattes/rotating-proxy) installed based on [HAProxy](http://www.haproxy.org/) and [Tor](https://www.torproject.org/) as data.gov.ua has API request limits per IP.

## Services

* `crawler` - [node.js app](app) to crawl data and store it in a file. Has an `http_proxy` environment variable set to use rotating proxy server.
* `proxy` - Proxy server.
* `elasticsearch` - ElasticSearch service. Exposes 9200 port, so use [localhost:9200](http://localhost:9200) to access ES API.
* `logstash` - Logstash service. Configuration files can be found in [logstash folder](logstash)
* `kibana` - Kibana service. Exposes 5601 port, so open [localhost:5601](http://localhost:5601) to access Kibana UI.

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

## License

MIT
