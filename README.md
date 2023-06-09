# WAI SDG Portal

[![Build Status](https://akvo.semaphoreci.com/badges/wai-sdg-portal/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/wai-sdg-portal) [![Repo Size](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal)](https://img.shields.io/github/repo-size/akvo/wai-sdg-portal) [![Coverage Status](https://coveralls.io/repos/github/akvo/wai-sdg-portal/badge.svg?branch=main)](https://coveralls.io/github/akvo/wai-sdg-portal?branch=main) [![Languages](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal)](https://img.shields.io/github/languages/count/akvo/wai-sdg-portal) [![Issues](https://img.shields.io/github/issues/akvo/wai-sdg-portal)](https://img.shields.io/github/issues/akvo/wai-sdg-portal) [![Last Commit](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main)](https://img.shields.io/github/last-commit/akvo/wai-sdg-portal/main) [![Documentation Status](https://readthedocs.org/projects/wai-sdg-portal/badge/?version=latest)](https://wai-sdg-portal.readthedocs.io/en/latest/?badge=latest) [![GitHub license](https://img.shields.io/github/license/akvo/wai-sdg-portal.svg)](https://github.com/akvo/wai-sdg-portal/blob/main/LICENSE)

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

##### Add new User

This command allows you to add new users to the portal with ease without providing parameters like before.

```bash
docker compose exec backend python -m seeder.user
```

Once the command is executed, then you will be asked to input these required fields.

| Field                | Type                    | Description              |
| -------------------- | ----------------------- | ------------------------ |
| Full Name            | String                  | User's full name         |
| Email Address        | String                  | User's email             |
| Organisation Name    | String                  | User's organisation name |
| Role [admin, editor] | enum: `admin`, `editor` | Set user's role          |

##### Form Seeder

Assuming that you have **id-form_name.json** inside `./backend/source/{project_name}/forms/` folder you should be able to run.

```
docker compose exec backend python -m seeder.form
```

You can also run the command above to updating the form.

> **Note:**
> Once you update the form then the version of the form will be automatically updated.

Or, you need to truncate the existing form and replace it with a new one then the command to be executed becomes

```bash
docker compose exec backend python -m seeder.form --truncate
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

---

### JMP Logic implementation

JMP Logic implementation has been done by the [AkvoResponseGrouper](https://pypi.org/project/AkvoResponseGrouper/) library and we just need to create a category.json inside the source folder and place it in a specific instance.

> For example, if we want to implement JMP logic on the Ethiopia instance, then category.json should be created on
>
> ```bash
> /backend/source/wai-ethiopia/category.json
> ```

#### Properties

This section contains the properties that will be used in configuring the JMP logic in category.json.

**Criteria's fields**
| Field | Type | Description |
| ------|-------|-------------------------|
| name | String | Criteria name|
| form | Integer | Existing form ID in database|
| categories | Array of category | List of categories|

**Category's fields**
| Field | Type | Description |
| ------| -------- | ------------------------- |
| name | String | Category name|
| questions | Array of question including the logic | List of existing questions and their logic|

**Questions & logic's fields**
| Field | Type | Required | Description |
| ------| -------- | ---- |--------------------- |
| id | Integer | Yes | Existing question ID in database |
| text | String | No | Question description |
| options | Array of string | Yes | Set list of options that will have intersections with the answer to the question |
| other | Array of other | No | Another set of lists of options that don't have intersections in the `options` |
| else | Object | No | Set category that has no intersections, either in `options` or `other` |

**Other's fields**
| Field | Type | Required | Description |
| ------| -------- | ---- |--------------------- |
| name | String | Yes | Category name |
| options | Array of string | Yes | Set list of options that will have intersections with the answer to the question |
| questions | Array of question | Yes | List of existing questions and their logic and can be set empty of Array `[]`|

**Else's fields**
| Field | Type | Required | Description |
| ------| -------- | ---- |--------------------- |
| name | String | No | Category name |
| ignore | Array of existing question IDs | No | Set list of question IDs that can be skipped based on the intersections in the options |

To get an example of category.json you can find it in one of the instances, like the one in Ethiopia here:

[./backend/source/wai-ethiopia/category.json](https://github.com/akvo/wai-sdg-portal/blob/main/backend/source/wai-ethiopia/category.json)

#### Execute the command

This section contains ways to run or apply JMP logic from category.json to the portal/database system.

```console
~$ akvo-responsegrouper --config {{category.json}}
```

Assuming we will run the JMP logic in Ethiopia, then the command will be as follows

```bash
docker compose exec backend akvo-responsegrouper --config ./source/wai-ethiopia/category.json
```

## Production

Please read the full documentation here: [https://wai-sdg-portal.readthedocs.io/en/latest](https://wai-sdg-portal.readthedocs.io/en/latest/)

## Test Instances

![Website JMP-Explorer](https://img.shields.io/website?down_color=red&down_message=offline&label=JMP-Explorer&up_color=green&up_message=online&url=https%3A%2F%2Fjmp-explorer.akvotest.org) ![Website Ethiopia](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Ethiopia&up_color=green&up_message=online&url=https%3A%2F%2Fwai-ethiopia.akvotest.org) ![Website Uganda](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Uganda&up_color=green&up_message=online&url=https%3A%2F%2Fwai-uganda.akvotest.org) ![Website Nepal](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Nepal&up_color=green&up_message=online&url=https%3A%2F%2Fwai-nepal.akvotest.org) ![Website Bangladesh](https://img.shields.io/website?down_color=red&down_message=offline&label=WAI-Bangladesh&up_color=green&up_message=online&url=https%3A%2F%2Fwai-bangladesh.akvotest.org)

### Contact

For further information about the file formats please contact tech.consultancy@akvo.org
