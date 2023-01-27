###############
Database Seeder
###############

===================
Config Requirements
===================

Before you seed the baseline data, please make sure that you have all the required file in the following structure:

Folder Path: `/backend/source/`

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

config.json
***********

`config.min.js` is pre-generated file to merge visualisation `config.js`, `topojson.js` and menu.

.. code:: python

    MINJS = jsmin("".join([
      "var levels=" + str([g["alias"] for g in GEO_CONFIG]) + ";"
      "var map_config={shapeLevels:" + str([g["name"]
                                          for g in GEO_CONFIG]) + "};",
      "var topojson=",
      open(f"{SOURCE_PATH}/topojson.json").read(),
      ";", JS_FILE, JS_i18n_FILE
    ]))
    JS_FILE = f"{SOURCE_PATH}/config.min.js"
    open(JS_FILE, 'w').write(MINJS)


forms.json
**********

`*.json` files inside forms folder is the form definition of a questionnaire which contains detail of forms including question group setting and question definition.

Example:

.. code:: json

  {
    "form": "JMP Core Questions for Monitoring WASH in Households",
    "id": 567420165,
    "question_groups": [
       {
         "question_group": "Location Demographics",
         "questions": [
           {
             "question": "location",
             "order": 1,
             "required": true,
             "type": "administration",
             "meta": true
           },
           {
             "id": 554110154,
             "question": "Village",
             "order": 3,
             "meta": true,
             "type": "text",
             "required": true,
             "options": null
           },
           {
             "id": 554110155,
             "question": "GPS Coordinates of Household",
             "order": 4,
             "meta": true,
             "type": "geo",
             "required": true,
             "options": null
           }
         ]
       }
     ]
   }


==========
Seeder CLI
==========

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

Form Seeder
***********

.. code:: bash

    docker compose exec backend python -m seeder.form

Seed Fake User
**************

.. code:: bash

    docker compose exec backend python -m seeder.fake_user <number_of_user> Akvo


Datapoint Seeder
****************

.. code:: bash

    docker compose exec backend python -m seeder.fake_datapoint youremail@akvo.org <number_of_datapoints>
