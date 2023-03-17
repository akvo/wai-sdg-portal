###############
Database Schema
###############

=============
List of Table
=============

    .. code:: sql

	SELECT relname, relkind
	FROM   pg_class
	WHERE relreplident = 'd'
	AND relhasindex = true;

    .. csv-table:: List of Table
	:file: ../assets/csv/db-tables.csv
	:header-rows: 1

==================
Table Relationship
==================

    .. csv-table:: List of Relationship
	:file: ../assets/csv/db-list-of-relations.csv
	:header-rows: 1

=============
Table Details
=============

Administration
**************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'administration'
	ORDER  BY ordinal_position;

    .. csv-table:: List of Relationship
	:file: ../assets/csv/db-administration.csv
	:header-rows: 1

User
***********

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'user'
	ORDER  BY ordinal_position;

    .. csv-table:: User Table
	:file: ../assets/csv/db-user.csv
	:header-rows: 1

User Access
******************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'access'
	ORDER  BY ordinal_position;

    .. csv-table:: Access Table
	:file: ../assets/csv/db-access.csv
	:header-rows: 1

Organisation
************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'organisation'
	ORDER  BY ordinal_position;

    .. csv-table:: Organisation Table
	:file: ../assets/csv/db-organisation.csv
	:header-rows: 1

Form
****

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'form'
	ORDER  BY ordinal_position;

    .. csv-table:: Form Table
	:file: ../assets/csv/db-form.csv
	:header-rows: 1

Question Group
**************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'question_group'
	ORDER  BY ordinal_position;

    .. csv-table:: Question Group Table
	:file: ../assets/csv/db-question-group.csv
	:header-rows: 1


Question
********

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'question'
	ORDER  BY ordinal_position;

    .. csv-table:: Question Table
	:file: ../assets/csv/db-question.csv
	:header-rows: 1

Question Option
***************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'option'
	ORDER  BY ordinal_position;

    .. csv-table:: Question Option Table
	:file: ../assets/csv/db-option.csv
	:header-rows: 1

Data
****

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'data'
	ORDER  BY ordinal_position;

    .. csv-table:: Data Table
	:file: ../assets/csv/db-data.csv
	:header-rows: 1

Data Answer
***********

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'answer'
	ORDER  BY ordinal_position;

    .. csv-table:: Data Answer Table
	:file: ../assets/csv/db-answer.csv
	:header-rows: 1

Data History
************

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'history'
	ORDER  BY ordinal_position;

    .. csv-table:: Data Answer Table
	:file: ../assets/csv/db-history.csv
	:header-rows: 1

Jobs
****

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'jobs'
	ORDER  BY ordinal_position;

    .. csv-table:: Jobs Table
	:file: ../assets/csv/db-jobs.csv
	:header-rows: 1

Logs
****

    .. code:: sql

	SELECT ordinal_position as pos, column_name, data_type, column_default, is_nullable
	FROM   information_schema.columns
	WHERE  table_name = 'log'
	ORDER  BY ordinal_position;

    .. csv-table:: Log Table
	:file: ../assets/csv/db-log.csv
	:header-rows: 1
