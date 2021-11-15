# WAI SDG Portal

[![Build Status](https://akvo.semaphoreci.com/badges/wai-sdg-portal/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/wai-sdg-portal) [![Repo Size](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal)](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal) [![Languages](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal
)](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal
) [![Issues](https://img.shields.io/github/issues/akvo/wai-sdg-portal
)](https://img.shields.io/github/issues/akvo/wai-sdg-portal
) [![Last Commit](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main
)](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main)

## Development

#### 1. Environment Setup

##### Auth Service

This app requires [Auth0](https://auth0.com) to provides Single sign-on (SSO) that allow users to log in with single ID and password such as Gmail or other variety of available providers, and a diverse set of user-friendly tools the developer will really like.

Environment Setup:
```
export AUTH0_DOMAIN="string_url"
export AUTH0_CLIENT_ID="string"
export AUTH0_SECRET="string"
export AUTH0_AUDIENCE="string"
```

##### Storage Service

When running the test, any upload and download activities will not uploaded directly as Storage object (offered by Google Cloud). It stored inside **./backend/tmp/fake-storage**

Environment Setup:
```
export GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```

##### Email Service
Environment Setup:
```
export MAILJET_SECRET="string"
export MAILJET_APIKEY="string"
```

#### 2. Start the App

Now you have all the required environment ready, then run the App using:

```bash
export WEBDOMAIN=notset
docker-compose up -d
```

To stop:

```bash
docker-compose down
```

Reset the app:

```bash
docker-compose down -v
```

The app should be running at: [localhost:3000](http://localhost:3000). Any endpoints with prefix
- `/api` is redirected to [localhost:5000](http://localhost:5000)
- `/worker` is for worker service in [localhost:5001](http://localhost:5001)
- `/config.js` is a static config that redirected to [localhost:5001/config.js](http://localhost:5000/config.js)

see: [setupProxy.js](https://github.com/akvo/wai-sdg-portal/blob/main/frontend/src/setupProxy.js)

#### 3. Database Seeder

Before you seed the baseline data, please make sure that you have all the required file in the following structure:

Folder Path: **/backend/source/**

```
/backend/source.
└── project-name
    ├── config.js
    ├── config.min.js
    ├── data
    │   ├── administration.csv
    │   ├── baseline.xlsx
    │   ├── cascade.csv
    │   └── organisation.csv
    ├── forms
    │   ├── 01-clts.json
    │   ├── 02-health.json
    │   ├── 03-hh.json
    │   ├── 04-school.json
    │   └── 05-wp.json
    └── topojson.js

```

##### Administration Level Seeder
Assuming that you have `administration.csv` inside `./backend/source/data` folder you will be able to run.
```
docker-compose exec backend python -m seeder.administration
```
##### Organisation Seeder
Assuming that you have `organisation.csv` inside `./backend/source/data` folder you will be able to run.
```
docker-compose exec backend python -m seeder.organisation
```
##### Add Super Admin
Note you wont be able to use some of the backend API if you haven't confirmed your email address with **Auth0** tenant which you will received once your account is registered. You also have to perform [Administration](#administration-level-seeder) and [Organisation Seeder](#organisation-seeder) first
```
docker-compose exec backend python -m seeder.admin youremail@akvo.org "Your Name" Akvo
```
##### Seed Random User
```
docker-compose exec backend python -m seeder.user <number_of_user> Akvo
```
##### Form Seeder
Assuming that you have **id-form_name.json** inside `./backend/source/forms/` folder you should be able to run.
```
docker-compose exec backend python -m seeder.form
```
##### Datapoint Seeder
Assuming that you have **baseline.xlsx** inside `./backend/source` folder you should be able to run.
```
docker-compose exec backend python -m seeder.datapoint youremail@akvo.org
```
##### Run all the seeder in one command
If you wish to run all the necessary seeder, you could also run
```
docker-compose exec backend ./seed.sh youremail@akvo.org "Your Name" Akvo
```

#### Running Test

```bash
docker-compose exec backend ./test.sh
```
-----------------

## Production

```bash
export CI_COMMIT='local'
./ci/build.sh
```
This will generate two docker images with prefix `eu.gcr.io/akvo-lumen/wai-sdg-portal` for backend and frontend

```bash
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d
```

Then visit: [localhost:8080](http://localhost:8080). Any endpoints with prefix
- `/api` is redirected to backend API: [localhost:5000](http://localhost:5000)
- `/worker` is redirected to service worker: [localhost:5001](http://localhost:5001)
- `/config.js` is a static config that redirected to [localhost:5001/config.js](http://localhost:5000/config.js)
inside the network container

see:
- [nginx](https://github.com/akvo/wai-sdg-portal/blob/main/frontend/nginx/conf.d/default.conf) config
- [mainnetwork](https://github.com/akvo/wai-sdg-portal/blob/0aa961abd05b3611533f47133aac0fe4f682c2cd/docker-compose.ci.yml#L75-L81) container setup


### Contact

For further information about the file formats please contact tech.consultancy@akvo.org
