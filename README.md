# wai-ethiopia
Wash Dataportal for WAI Ethiopia

[![Build Status](https://akvo.semaphoreci.com/badges/wai-ethiopia/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/wai-ethiopia) [![Repo Size](https://img.shields.io/github/repo-size/akvo/wai-ethiopia)](https://img.shields.io/github/repo-size/akvo/wai-ethiopia) [![Languages](https://img.shields.io/github/languages/count/akvo/wai-ethiopia
)](https://img.shields.io/github/languages/count/akvo/wai-ethiopia
) [![Issues](https://img.shields.io/github/issues/akvo/wai-ethiopia
)](https://img.shields.io/github/issues/akvo/wai-ethiopia
) [![Last Commit](https://img.shields.io/github/last-commit/akvo/wai-ethiopia/main
)](https://img.shields.io/github/last-commit/akvo/wai-ethiopia/main)

# Development

```bash
docker-compose up -d
```

The app should be running at: [localhost:3000](http://localhost:3000). Any endpoints with prefix `/api` will be redirected to [localhost:5000](http://localhost:5000)

see: [setupProxy.js](https://github.com/akvo/wai-ethiopia/blob/main/frontend/src/setupProxy.js)

# Production

```bash
export CI_COMMIT='local'
./ci/build.sh
```
This will generate two docker images with prefix `eu.gcr.io/akvo-lumen/wai-ethiopia` for backend and frontend

```bash
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d
```

Then visit: [localhost:8080](http://localhost:8080). Any endpoints with prefix `/api` is redirected to `http://backend:8000` inside the network container

see:
- [nginx](https://github.com/akvo/wai-ethiopia/blob/main/frontend/nginx/conf.d/default.conf) config
- [mainnetwork](https://github.com/akvo/wai-ethiopia/blob/7b5364b09ff96356b516b6738d99feb9a8d71f29/docker-compose.ci.yml#L4-L8) container setup

# Database Seeder

### Administration Level Seeder
Assuming that you have `administration-ethiopia.csv` inside `./backend/source` folder you will be able to run.
```
docker-compose exec backend python -m seeder.administration
```
### Organisation Seeder
Assuming that you have `organisation-list.csv` inside `./backend/source` folder you will be able to run.
```
docker-compose exec backend python -m seeder.organisation
```
### Add Super Admin
Note you wont be able to use some of the backend API if you haven't confirmed your email address with **Auth0 WAI Ethiopia** tenant which you received from Auth0 once your account is registered. You also have to perform [Administration](#administration-level-seeder) and [Organisation Seeder](#organisation-seeder) first
```
docker-compose exec backend python -m seeder.admin youremail@akvo.org "Your Name" Akvo
```
### Seed Random User
```
docker-compose exec backend python -m seeder.user <number_of_user> Akvo
```
### Form Seeder
Assuming that you have `form_eth_*.json` inside `./backend/source` folder you will be able to run.
```
docker-compose exec backend python -m seeder.form
```
### Datapoint Seeder
Assuming that you have `data-input.xlsx` inside `./backend/source` folder you will be able to run.
```
docker-compose exec backend python -m seeder.datapoint youremail@akvo.org
```

