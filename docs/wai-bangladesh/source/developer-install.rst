########################
Development Installation
########################


=================
Environment Setup
=================

.. code:: bash

    export WAI_AUTH0_DOMAIN="string_url"
    export WAI_AUTH0_CLIENT_ID="string"
    export WAI_AUTH0_SECRET="string"
    export WAI_AUTH0_AUDIENCE="string"
    export WAI_AUTH0_SECRET="string"
    export WAI_AUTH0_SPA_DOMAIN="string_url"
    export WAI_AUTH0_SPA_CLIENT_ID="string"
    export INSTANCE_NAME="wai-bangladesh"

=============
Start the App
=============

Once you have all the required environment ready, then run the App using:

* Run the application

  .. code:: bash

    export INSTANCE_NAME=<project-name>
    docker compose up -d

* Stop

  .. code:: bash

    docker compose down

* Reset the app

  .. code:: bash

    docker compose down -v
