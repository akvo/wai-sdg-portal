# WAI SDG Portal

[![Build Status](https://akvo.semaphoreci.com/badges/wai-sdg-portal/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/wai-sdg-portal) [![Repo Size](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal)](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal) [![Coverage Status](https://coveralls.io/repos/github/akvo/wai-sdg-portal/badge.svg?branch=main)](https://coveralls.io/github/akvo/wai-sdg-portal?branch=main) [![Languages](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal
)](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal
) [![Issues](https://img.shields.io/github/issues/akvo/wai-sdg-portal
)](https://img.shields.io/github/issues/akvo/wai-sdg-portal
) [![Last Commit](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main
)](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main) [![Documentation Status](https://readthedocs.org/projects/wai-sdg-portal/badge/?version=latest)](https://wai-sdg-portal.readthedocs.io/en/latest/?badge=latest) [![GitHub license](https://img.shields.io/github/license/akvo/wai-sdg-portal.svg)](https://github.com/akvo/wai-sdg-portal/blob/main/LICENSE)

## Development

#### 1. Environment Setup

##### Auth Service

This app requires [Auth0](https://auth0.com) to provides Single sign-on (SSO) that allow users to log in with single ID and password such as Gmail or other variety of available providers, and a diverse set of user-friendly tools the developer will really like.

1. Sign up to [Auth0.com](https://auth0.com)
2. Create a new tenant for obtaining the service.
3. Go to Applications: Create Applications, then select **Single Web Page Applications**
4. Go to the Application Setings:
  4.1 Upload your Application Logo
	4.2 In the Application URI's section Set:
	- Allowed Callback URL & Allowed Origins (CORS)
		```plain
		https://your_domain.com, http://localhost:3000
		```
	- Allowed Logout URL
	```plain
	https://your_domain.com, https://your_domain.com/login, http://localhost:3000
	```
5. Create another applications: Select **Machine to Machine Application**
6. Once you clieck create, grant all authorization access by **Selecting all** then click **Authorize**
7. Repeat the step #4.

Environment Setup:
```
export WAI_AUTH0_DOMAIN="string_url"
export WAI_AUTH0_CLIENT_ID="string"
export WAI_AUTH0_SECRET="string"
export WAI_AUTH0_AUDIENCE="string"
export WAI_AUTH0_SECRET="string"
export WAI_AUTH0_SPA_DOMAIN="string_url"
export WAI_AUTH0_SPA_CLIENT_ID="string"
export INSTANCE_NAME="wai-demo"
```

Note: `WAI_AUTH0_AUDIENCE` is comming from Grant ID (API's tab) in your **Auth0 Machine to Machine applications**

##### Storage Service

When running the test, any upload and download activities will not uploaded directly as Storage object (offered by Google Cloud). It stored inside **./backend/tmp/fake-storage**

Environment Setup:
```
export GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```
###### Using Storage Service
If you want to use custom storage location (e.g storage in local backend container). add `STORAGE_LOCATION` to the backend environment. Example format: "/tmp/storage".

```
export STORAGE_LOCATION=/tmp/storage
```

##### Email Service

To use the Mailjet Email API, you need to create a Mailjet account, then retrieve your API and Secret keys. They will be used for authentication purposes.

```
export MAILJET_SECRET="string"
export MAILJET_APIKEY="string"
```

#### 2. Start the App

Now you have all the required environment ready, then run the App using:

```bash
export INSTANCE_NAME=<project-name>
docker compose up -d
```

To stop:

```bash
docker compose down
```

Reset the app:

```bash
docker compose down -v
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
    │   └── organisation.csv
    ├── forms
    │   ├── 01-clts.json
    │   ├── 02-health.json
    │   ├── 03-hh.json
    │   ├── 04-school.json
    │   └── 05-wp.json
    └── topojson.js

```
Note that project-name should be same as [**INSTANCE_NAME**](#2.-start-the-app) that you exported

##### Administration Level Seeder
Assuming that you have **topojson.js** inside `./backend/source/{project_name}` folder you will be able to run.
```
docker compose exec backend python -m seeder.administration
```
##### Organisation Seeder
To seed organisation, you need to have **organisation.csv** inside `./backend/source/{project_name}/data` folder you will be able to run.
```
docker compose exec backend python -m seeder.organisation
```
##### Add Super Admin
Note you wont be able to use some of the backend API if you haven't confirmed your email address with **Auth0** tenant which you will received once your account is registered. You also have to perform [Administration](#administration-level-seeder) and [Organisation Seeder](#organisation-seeder) first
```
docker compose exec backend python -m seeder.admin youremail@akvo.org "Your Name" Akvo
```
##### Seed Random User
```
docker compose exec backend python -m seeder.user <number_of_user> Akvo
```
##### Form Seeder
Assuming that you have **id-form_name.json** inside `./backend/source/{project_name}/forms/` folder you should be able to run.
```
docker compose exec backend python -m seeder.form
```
##### Datapoint Seeder
Assuming that you have **baseline.xlsx** inside `./backend/source` folder you should be able to run.
```
docker compose exec backend python -m seeder.datapoint youremail@akvo.org
```
##### Run all the seeder in one command
If you wish to run all the necessary seeder, you could also run
```
docker compose exec backend ./seed.sh youremail@akvo.org "Your Name" Akvo
```

#### Running Test

```bash
docker compose exec backend ./test.sh
```
-----------------

## Production

Please read the full documentation here: [https://wai-sdg-portal.readthedocs.io/en/latest](https://wai-sdg-portal.readthedocs.io/en/latest/)

## Test Instances

![Website JMP-Explorer](https://img.shields.io/website?down_color=red&down_message=offline&label=JMP-Explorer&up_color=green&up_message=online&url=https%3A%2F%2Fjmp-explorer.akvotest.org) ![Website Ethiopia](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Ethiopia&up_color=green&up_message=online&url=https%3A%2F%2Fwai-ethiopia.akvotest.org) ![Website Uganda](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Uganda&up_color=green&up_message=online&url=https%3A%2F%2Fwai-uganda.akvotest.org) ![Website Nepal](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Nepal&up_color=green&up_message=online&url=https%3A%2F%2Fwai-nepal.akvotest.org) ![Website Bangladesh](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Bangladesh&up_color=green&up_message=online&url=https%3A%2F%2Fwai-bangladesh.akvotest.org)

### Contact

For further information about the file formats please contact tech.consultancy@akvo.org
