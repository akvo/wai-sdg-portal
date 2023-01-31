Create Auth0 Account
~~~~~~~~~~~~~~~~~~~~

**1. Visit Auth0.com**

  .. image:: ../assets/auth0-steps/1b245844-22e4-41de-a767-1aaa5b6eee24.png
     :alt: Step 1 screenshot
     :width: 800

************************

**2. Sign up new account**

  .. image:: ../assets/auth0-steps/b23dd7a3-f345-4458-ac32-245697dc95c6.png
     :alt: Step 3 screenshot
     :width: 800

************************

**3. Finish Sign Up**

  .. image:: ../assets/auth0-steps/e8fef674-3904-411c-949c-d37c42743ec6.png
     :alt: Step 4 screenshot
     :width: 800

Creating New Tenant
~~~~~~~~~~~~~~~~~~~


**1. Navigate to Left Corner Dropdown**

  .. image:: ../assets/auth0-steps/9bd7b32d-c611-4eb6-a8c7-2dcc8d7d3d6a.png
     :alt: Step 5 screenshot
     :width: 800

************************

**2. Click create New Tenant**

  .. image:: ../assets/auth0-steps/e1bb06b9-d339-4ad0-bb90-8a56a3aee519.png
     :alt: Step 6 screenshot
     :width: 800

************************

**3. Fill the Tenant Domain**

  .. note:: Please use your website domain so it can be more consistent

  .. image:: ../assets/auth0-steps/e1a5ad80-f6cb-4c1b-bda8-ec1ecdb869f7.png
     :alt: Step 7 screenshot
     :width: 800

************************

**4. Choose region that is closer to your server**

  .. image:: ../assets/auth0-steps/7f3c337a-1eea-42a1-9568-0e909a072b12.png
     :alt: Step 8 screenshot
     :width: 800

************************

**5. Finish, Click Create**

  .. image:: ../assets/auth0-steps/35e87812-7e4a-4a22-95f6-ee94881a2353.png
     :alt: Step 10 screenshot
     :width: 800

  Now you have switched to your new tenant**

  .. image:: ../assets/auth0-steps/7419bbfd-23a7-4b57-bb6e-ea4ea952ae12.png
     :alt: Step 11 screenshot
     :width: 800

************************

Create Application
~~~~~~~~~~~~~~~~~~

To run this site, 2 types of applications are required for the authorization and authentication process. The first application is the Single Page Application (SPA) type authentication which needed by The JavaScript frontend to authenticate. The second application is for verifying the token that has been created by the frontend which will be used for the process of authorizing access to all the Backend endpoints (API)

Create New SPA Application
--------------------------

**1. Click the 3rd icon(Applications tab) in the left corner**

  .. image:: ../assets/auth0-steps/c6852380-7da7-4b3a-bf66-ca65c3a853fa.png
     :alt: Step 12 screenshot
     :width: 800

************************

**2. Click Applications**

  .. image:: ../assets/auth0-steps/729dde43-d4b6-48ab-9573-c914ca4545c3.png
     :alt: Step 14 screenshot
     :width: 800

************************

**3. Click Create Application**

  .. image:: ../assets/auth0-steps/0dd270d5-1b73-4469-8d87-8fe989e4e682.png
     :alt: Step 15 screenshot
     :width: 800

************************

**4. Fill the name field and click on single page web applications then Click Create**

  .. image:: ../assets/auth0-steps/9696dc40-03ca-4d94-bd49-d0568aeac039.png
     :alt: Step 16 screenshot
     :width: 800

************************

**5. Select Settings Tab**

  .. image:: ../assets/auth0-steps/17f6991b-8cac-49d9-b92e-2a4826db3d01.png
     :alt: Step 18 screenshot
     :width: 800

************************

**6. Add application logo**

  .. image:: ../assets/auth0-steps/758dcec1-2ad6-470f-80d1-10de7695c295.png
     :alt: Step 19 screenshot
     :width: 800

  .. note:: This application has pre-defined logo, the url of image is available in your installation once this up is up and running in your domain. (eg. https://your-domain.com/wai-logo.png)

************************

**7. Change your-domain.com with your app-domain for all the field below keep login url blank**

  .. image:: ../assets/auth0-steps/fd75db30-54ea-4f61-9be4-c0d15a618561.png
     :alt: Step 20 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/e5b7c497-9ed2-423d-a6af-a451be8252c5.png
     :alt: Step 21 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/c96499a7-f374-4166-a362-a9fb1b8d4c59.png
     :alt: Step 22 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/e86db00a-ef8f-40a6-b091-4c21fcb6a97d.png
     :alt: Step 23 screenshot
     :width: 800

************************

**8. Modify the ID Token Expiration**

  .. image:: ../assets/auth0-steps/d432f2db-d02b-492b-a74d-518084fa50f1.png
     :alt: Step 24 screenshot
     :width: 800

************************

**9. Click Save Button**

  .. image:: ../assets/auth0-steps/4a69f25b-a1f2-44de-93ec-a26b183162f5.png
     :alt: Step 25 screenshot
     :width: 800

************************

**10. Select Organizations Tab**

  .. image:: ../assets/auth0-steps/9032ed92-6ea2-4688-8117-016a1d0f0ef6.png
     :alt: Step 26 screenshot
     :width: 800

************************

**11. Change below option field with Both**

  .. image:: ../assets/auth0-steps/845a3f26-b3f0-4d9e-860e-50a4c6969bff.png
     :alt: Step 27 screenshot
     :width: 800

************************

**12. Click Save Changes**

  .. image:: ../assets/auth0-steps/579153c3-9303-464a-ae4c-8e043a7a237f.png
     :alt: Step 28 screenshot
     :width: 800

************************

Create New Backend Application
------------------------------

**1. Click on Create Application**

  .. image:: ../assets/auth0-steps/8c4718ba-1469-4af0-97cb-2e3c654fc3d8.png
     :alt: Step 29 screenshot
     :width: 800

************************

**2. Rename the Application**

  .. image:: ../assets/auth0-steps/2d9b8fb4-02ad-4066-a90f-1b3e0204adb9.png
     :alt: Step 31 screenshot
     :width: 800

************************

**3. Select Machine to Machine Application**

  .. image:: ../assets/auth0-steps/5d0dc29e-463b-4901-8d0a-d4b577f956f5.png
     :alt: Step 30 screenshot
     :width: 800

************************

**4. Click on Create**

  .. image:: ../assets/auth0-steps/89358aa2-2592-4315-ad1e-a6088b21ba6f.png
     :alt: Step 32 screenshot
     :width: 800

************************

**5. Click on option**
  Once you click create button, there will be a popup with dropdown selector to authorize this application. Please select **Auth0 Management API**

  .. image:: ../assets/auth0-steps/0662285f-e750-44bd-ad39-8beff769be70.png
     :alt: Step 33 screenshot
     :width: 800

************************

**6. Authorize All the Permissions**

  .. image:: ../assets/auth0-steps/38704dc2-e1c1-4dd8-9e25-b2d9c167317e.png
     :alt: Step 34 screenshot
     :width: 800

************************

**7. Click on Authorize**

  .. image:: ../assets/auth0-steps/042b32e1-6aa9-4fc5-9fac-880557bf96eb.png
     :alt: Step 35 screenshot
     :width: 800

************************

**8. Click on Settings**

  .. image:: ../assets/auth0-steps/cae7e780-c16a-4772-a01f-0d1d14e8e0c5.png
     :alt: Step 36 screenshot
     :width: 800

************************

**9. Change your-domain.com with your app-domain for all the field below keep the login url blank**

  .. image:: ../assets/auth0-steps/fd75db30-54ea-4f61-9be4-c0d15a618561.png
     :alt: Step 20 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/e5b7c497-9ed2-423d-a6af-a451be8252c5.png
     :alt: Step 21 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/c96499a7-f374-4166-a362-a9fb1b8d4c59.png
     :alt: Step 22 screenshot
     :width: 800

************************

  .. image:: ../assets/auth0-steps/e86db00a-ef8f-40a6-b091-4c21fcb6a97d.png
     :alt: Step 23 screenshot
     :width: 800

************************

**10. Modify the ID Token Expiration**

  .. image:: ../assets/auth0-steps/d432f2db-d02b-492b-a74d-518084fa50f1.png
     :alt: Step 24 screenshot
     :width: 800

************************

**11. Click Save Button**

  .. image:: ../assets/auth0-steps/4a69f25b-a1f2-44de-93ec-a26b183162f5.png
     :alt: Step 25 screenshot
     :width: 800

************************

The Production Tentant
~~~~~~~~~~~~~~~~~~~~~~

Tenants tagged as Production are granted higher rate limits than tenants tagged as Development or Staging. To ensure Auth0 recognizes your production tenant, be sure to set your production tenant with the **production** flag in the Support Center.

.. note:: Higher rate limits are applied to public cloud tenants tagged as Production with a paid subscription. See `Auth0 Tenant Policy`_

.. _Auth0 Tenant Policy: https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy

**1. Click Gear Icons**

  .. image:: ../assets/auth0-steps/dce81dff-9fb9-4168-9c23-5e0c0b8ca0ec.png
     :alt: Step 29 screenshot
     :width: 800

************************

**2. Select Production**

  .. image:: ../assets/auth0-steps/6a75c3fa-d399-461a-bbc9-c33684d10a48.png
     :alt: Step 30 screenshot
     :width: 800

************************

**3. Click Save**

  .. image:: ../assets/auth0-steps/c25e44e1-29b8-4d30-906c-243aa0aab2f2.png
     :alt: Step 31 screenshot
     :width: 800

************************

Back to `Installation`_

.. _Installation: /install.html#auth0-identity-providers
