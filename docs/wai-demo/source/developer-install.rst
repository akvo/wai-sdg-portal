########################
Development Installation
########################

.. note:: Below step is for development purposes. Please follow :ref:`Production Deployment<Production Deployment>` for the production ready installation.

=================
Environment Setup
=================

.. code:: bash

    export AUTH0_DOMAIN="string_url"
    export AUTH0_CLIENT_ID="string"
    export AUTH0_SECRET="string"
    export AUTH0_AUDIENCE="string"

=============
Start the App
=============

Once you have all the required environment ready, then run the App using:

* Run the application

  .. code:: bash

    export INSTANCE_NAME=<project-name>
    docker-compose up -d

* Stop

  .. code:: bash

    docker-compose down

* Reset the app

.. code:: bash

    docker-compose down -v

============
Running Test
============

.. code:: bash

    docker-compose exec backend ./test.sh

