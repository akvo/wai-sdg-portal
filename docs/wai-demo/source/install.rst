##################
Installation Guide
##################

.. warning:: Below step is for production-ready installation process. Please follow `Developer-Guide`_ to setup the development mode.

.. _developer-guide: /developer-install.html

*******************
System Requirements
*******************

    :System Memory: 4 GiB
    :CPU: 2 GHz Dual Core Processor
    :Storage: 25 GiB or more Disk
    :Operating System: Ubuntu Server 22.04

**************************

************
Prerequisite
************

    :Docker Engine: 20.10 or above
    :Git: 2.39 or above
    :3rd Party Service Providers: - Auth0
				  - Mailjet

***********
Preparation
***********

.. note:: The following guide is an example installation on **Ubuntu and Debian based systems**. It has been with **Ubuntu 22.04**.

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


************
Installation
************

Clone the Repository
********************

   .. code:: bash

     git clone https://github.com/akvo/wai-sdg-portal.git

Environment Variable Setup
**************************

   Install text editor to be able to edit `.env` file

   .. code:: bash

     sudo apt install nano

   or

   .. code:: bash

     sudo apt install vim

   Go to the repository directory, then edit the environment

   .. code:: bash

     cd wai-sdg-portal/deploy
     vim .env

   Example Environemnt:

   .. code:: bash

     POSTGRES_PASSWORD=postgres
     WAI_DB_USER=yourname
     WAI_DB_PASSWORD=sUpeRsTr0ngPa**word
     INSTANCE_NAME=wai-ethiopia
     AUTH0_DOMAIN=your-domain.eu.auth0.com
     AUTH0_CLIENT_ID=acad34xxxxxxxx
     AUTH0_SECRET=938axxxxxxxxxxx
     AUTH0_AUDIENCE=cdary8xxxxxxxx
     AUTH0_SPA_DOMAIN=5a2axxxxxxxxxxx
     AUTH0_SPA_CLIENT_ID=b821y8xxxxxxxx
     STORAGE_LOCATION=/data/storage
     MAILJET_SECRET=093asbalxxxxxxxx
     MAILJET_APIKEY=9acadlkbxxxxxxxx
     WEBDOMAIN=https://your-domain.com
     CERTBOT_EMAIL=your-admin-email

   .. note::
      - ``WEBDOMAIN`` field must be populated with your domain name. In the case of a production environment, kindly ensure to include "https://" prior to your domain name
      - Kindly note that if you are installing to your localhost, it is necessary to add 'http://' before 'localhost' in the WEBDOMAIN variable
      - Before proceeding with the application or installation process, it is crucial to confirm that your domain has been properly pointed to your public IP address
      - Use **Domain** and **Client ID** field from your **Auth0 SPA application** for ``AUTH_SPA_DOMAIN`` and ``AUTH_SPA_CLIENT_ID``
      - Use **Domain**, **Secret** and **Client ID** field from your **Auth0 Backend application** for ``AUTH_DOMAIN``, ``AUTH_SECRET`` and ``AUTH_CLIENT_ID``.
      - For ``AUTH0_AUDIENCE``, Go to your **Auth0 backend application**, click **APIs** Tab, expand **Auth0 Management API**. Use the **Grant ID** field.
      - ``CERTBOT_EMAIL`` please provide the email of your DevOps or System Administrator who is responsible for managing the system. This email will be used to send alerts about certificate expiration, outdated configuration, and information related to Let's Encrypt

Run the Application
*******************

   .. code:: bash

     ./install.sh

Post-Installation
*****************

Once the app is started, we need to populate the database with the initial data set. The initial dataset are:

- 1st Super Admin
- 1st Organisation
- Administration Levels Data

Run the database seeder:

.. code:: bash

    docker compose exec backend ./seed.sh youremail@akvo.org "Your Full Name" "Your Organisation"

Example:

.. code:: bash

    docker compose exec backend ./seed.sh youremail@akvo.org "Your Name" Akvo

Renew SSL Certificate
*********************
The certificate from Let's Encrypt will expire every 90 days. To renew the certificate, please run the following command. For automation, you can also set this command to run with Cron.

.. code:: bash

    ./renew-ssl.sh
