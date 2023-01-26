#####################
Production Deployment
#####################

===================
System Requirements
===================

* 4 GiB System Memory
* 2 GHz Dual Core Processor
* 25 GiB or more Disk

=============
Prerequisites
=============

* Ubuntu Server 22.04
* Docker v20.10.23
* git v2.34.1

============
Installation
============

Install Docker
**************

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

Cloning The Repository
**********************

#. Install Git

   .. code:: bash

     sudo apt install git

#. Clone the wai-sdg-portal Repository

   .. code:: bash

     git clone https://github.com/akvo/wai-sdg-portal.git

Setup Environement
******************

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

Running The App
***************

#. Run the App:

   .. code:: bash

     ./run.sh
