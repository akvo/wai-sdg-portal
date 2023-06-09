########################
JMP Logic implementation
########################

JMP Logic implementation has been done by the AkvoResponseGrouper [#arg]_ library and we just need to create a category.json inside the source folder and place it in a specific instance.

For example, if we want to implement JMP logic on the Ethiopia instance, then category.json should be created on

.. code-block:: none

   backend
   ├── source
       ├── wai-ethiopia
           └── category.json
   


.. [#arg] AkvoResponseGrouper: https://pypi.org/project/AkvoResponseGrouper/



==========
Properties
==========

This section contains the properties that will be used in configuring the JMP logic in category.json.

Criteria's fields
+++++++++++++++++
==============  ====================== ============== 
Field           Type                    Description
==============  ====================== ==============
name            String                  Criteria name
form            Integer                 Existing form ID in database
categories      Array of category       List of categories
==============  ====================== ==============

Category's fields
+++++++++++++++++
==============  ===================================== ============== 
Field           Type                                  Description
==============  ===================================== ==============
name            String                                  Category name
questions       Array of question including the logic   List of existing questions and their logic
==============  ===================================== ==============

Question & logic's fields
+++++++++++++++++++++++++

==============  ============================= ========= ============== 
Field           Type                          Required  Description
==============  ============================= ========= ==============
id              Integer                        Yes       Existing question ID in database.
text            String                         No        Question description.
options         Array of string                Yes       Set list of options that will have intersections with the answer to the question.
other           Array of other                 No        Another set of lists of options that don't have intersections in the `options`.
else            Object of
                `else <#else-s-fields>`_       No        Set category that has no intersections, either in `options` or `other`.
==============  ============================= ========= ==============

Other's fields
++++++++++++++
==============  ======================================= ========= ============== 
Field           Type                                    Required  Description
==============  ======================================= ========= ==============
name            String                                  Yes       Category name
options         Array of string                         Yes       Set list of options that will have intersections with the answer to the question
questions       Array of
                `question <#question-logic-s-fields>`_  Yes       List of existing questions and their logic and can be set empty of Array `[]`
==============  ======================================= ========= ==============

Else's fields
++++++++++++++
==============  ========================= ========= ============== 
Field           Type                      Required  Description
==============  ========================= ========= ==============
name            String                    No        Category name
ignore          Array of
                existing question IDs     No        Set list of question IDs that can be skipped based on the intersections in the options
==============  ========================= ========= ==============

=======
Example
=======

In this section, we provide an example use case to demonstrate how to create category.json file based on the pr. Please note that the presented use case, "Sanitation," is intended for illustrative purposes only. While the example showcases the functionality and features of our library, it may not be an exact representation of real-world scenarios.

Logic visualisation
+++++++++++++++++++
.. image:: ../assets/user-guide/AkvoResponseGrouper.png
    :alt: JMP logic visualisation

JSON File (category.json)
+++++++++++++++++++++++++

.. code:: json

    [
      {
        "name": "Sanitation Criteria", 
        "form": 1,
        "categories": [
          {
            "name": "Basic",
            "questions": [
              {
                  "id": 11,
                  "text": "School has toilet?",
                  "options": [
                      "Yes"
                  ],
                  "else": {
                      "name": "No service"
                  }
              },
              {
                  "id": 12,
                  "text": "Type of toilets",
                  "options": [
                      "Flush/Pour-flush toilets",
                      "Pit latrines with slab"
                  ],
                  "other": [
                      {
                          "name": "Unimproved",
                          "options": [
                              "Composting toilets",
                              "VIP latrine"
                          ],
                          "questions": []
                      }
                  ],
                  "else": {
                      "name": "Limited"
                  }
              },
              {
                  "id": 13,
                  "text": "Is the school co-ed?",
                  "options": [
                      "Yes"
                  ],
                  "else": {
                      "ignore": [
                          14
                      ]
                  }
              },
              {
                  "id": 14,
                  "text": "is toilet separated?",
                  "options": [
                      "Yes"
                  ],
                  "else": {
                      "name": "Limited"
                  }
              },
              {
                  "id": 15,
                  "text: ":"Is toilet usable?",
                  "options": [
                      "Yes"
                  ],
                  "else": {
                      "name": "Limited"
                  }
              }
            ]
          }
        ]
      }
    ]

