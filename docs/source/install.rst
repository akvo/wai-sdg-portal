Getting Started

Environment Setup:
------------------

.. code:: bash

    export AUTH0_DOMAIN="string_url"
    export AUTH0_CLIENT_ID="string"
    export AUTH0_SECRET="string"
    export AUTH0_AUDIENCE="string"

Start the App
--------------

Once you have all the required environment ready, then run the App using:

Running
~~~~~~~

.. code:: bash

    export INSTANCE_NAME=<project-name>
    docker-compose up -d

Stop
~~~~~

.. code:: bash

    docker-compose down

Reset the app
~~~~~~~~~~~~~~

.. code:: bash

    docker-compose down -v

Database Seeder
----------------

Before you seed the baseline data, please make sure that you have all the required file in the following structure:

Folder Path: /backend/source/

.. code:: bash

    /backend/source.
    └── project-name
        ├── config.js
        ├── config.min.js
        ├── data
        │   └── organisation.csv
        ├── forms
        │   ├── 01-clts.json
        │   ├── 02-health.json
        │   ├── 03-hh.json
        │   ├── 04-school.json
        │   └── 05-wp.json
        └── topojson.js

Administration Level Seeder
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend python -m seeder.administration

Organisation Seeder
~~~~~~~~~~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend python -m seeder.organisation

Super Admin
~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend python -m seeder.admin youremail@akvo.org "Your Name" Akvo

Seed Random User
~~~~~~~~~~~~~~~~~

.. code:: bash
    
    docker-compose exec backend python -m seeder.user <number_of_user> Akvo

Form Seeder
~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend python -m seeder.form

Datapoint Seeder
~~~~~~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend python -m seeder.datapoint youremail@akvo.org

Run all the seeder in one command
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: bash
    
    docker-compose exec backend ./seed.sh youremail@akvo.org "Your Name" Akvo

Running Test
~~~~~~~~~~~~

.. code:: bash

    docker-compose exec backend ./test.sh

Production
----------

export CI_COMMIT='local'
./ci/build.sh
This will generate two docker images with prefix eu.gcr.io/akvo-lumen/wai-sdg-portal for backend and frontend

.. code:: bash
    
    docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d

Then visit: localhost:8080. Any endpoints with prefix