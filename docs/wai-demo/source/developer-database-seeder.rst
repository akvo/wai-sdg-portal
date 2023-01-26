###############
Database Seeder
###############

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
***************************

.. code:: bash

    docker compose exec backend python -m seeder.administration

Organisation Seeder
*******************

.. code:: bash

    docker compose exec backend python -m seeder.organisation

Super Admin
***********

.. code:: bash

    docker compose exec backend python -m seeder.admin youremail@akvo.org "Your Name" Akvo

Seed Random User
****************

.. code:: bash

    docker compose exec backend python -m seeder.user <number_of_user> Akvo

Form Seeder
***********

.. code:: bash

    docker compose exec backend python -m seeder.form

Datapoint Seeder
****************

.. code:: bash

    docker compose exec backend python -m seeder.datapoint youremail@akvo.org

