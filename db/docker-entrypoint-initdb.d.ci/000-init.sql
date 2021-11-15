CREATE USER wai WITH CREATEDB PASSWORD 'password';

CREATE DATABASE wai_ci
WITH OWNER = wai
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';

CREATE DATABASE wai_ci_test
WITH OWNER = wai
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';
