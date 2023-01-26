##################
Installation Guide
##################

.. note:: Below step is for production-ready installation. Please follow `Developer-Guide`_ to setup the development mode.

.. _developer-guide: /developer-install.html

===================
System Requirements
===================

* 4 GiB System Memory
* 2 GHz Dual Core Processor
* 25 GiB or more Disk
* Ubuntu Server 22.04

************
prerequisite
************

* Docker Engine > 20.10
* Git > 2.39
* Auth0 Tenant
* MAILJET Account

===========
Preparation
===========

Install Docker Engine
*********************

You need the latest Docker version installed. If you do not have it, please see the following installation guide to get it.

#. Update the apt package index and install packages to allow apt to use a repository over HTTPS:

   .. code:: bash

     sudo apt update
     sudo apt install ca-certificates curl gnupg lsb-release

#. Add Docker’s official GPG key:

   .. code:: bash

     sudo mkdir -p /etc/apt/keyrings
     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

#. Use the following command to set up the repository:

   .. code:: bash

     echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

#. Update the apt package index:

   .. code:: bash

     sudo apt update

#. Install Docker Engine, containerd, and Docker Compose.

   .. code:: bash

     sudo apt-get install \
      docker-ce docker-ce-cli \
      containerd.io docker-compose-plugin

#. Manage Docker as a non-root user

   .. code:: bash

    sudo groupadd docker
    sudo usermod -aG docker $USER
    newgrp docker

Install Git Version Control
***************************

The WAI SDG Portal uses git as version control. Therefore it is better to install git to make it easier to retrieve updates instead download the repository zip.

.. code:: bash

 sudo apt install git

Auth0 Identity Providers
************************

This application **DO NOT** store directly any personal information. WAI SDG Portal uses `AUTH0`_ for a flexible solution to add authentication services.

Please visit `AUTH0`_, then follow below guide:

.. _AUTH0: https://auth0.com/

.. toctree::
   :maxdepth: 2

   auth0


Mailjet Service
***************

You need to have `MAILJET`_ account to manage the notification deliverability.

.. _MAILJET: https://mailjet.com/

.. toctree::
   :maxdepth: 2

   mailjet


============
Installation
============

#. Clone the wai-sdg-portal Repository

   .. code:: bash

     git clone https://github.com/akvo/wai-sdg-portal.git

#. Edit the required Environment:

   .. code:: bash

     cd wai-sdg-portal/deploy
     vim .env

   .. code:: bash

     POSTGRES_PASSWORD=
     WAI_DB_USER=
     WAI_DB_PASSWORD=
     INSTANCE_NAME=
     AUTH0_DOMAIN=
     AUTH0_CLIENT_ID=
     AUTH0_SECRET=
     AUTH0_AUDIENCE=
     STORAGE_LOCATION=
     MAILJET_SECRET=
     MAILJET_APIKEY=
     WEBDOMAIN=

#. Run the App:

   .. code:: bash

     ./run.sh

=================
Post-Installation
=================

.. code:: bash

    docker compose exec backend ./seed.sh youremail@akvo.org "Your Name" Akvo
