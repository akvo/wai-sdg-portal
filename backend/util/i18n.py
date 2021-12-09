import enum


class ValidationText(enum.Enum):
    header_name_missing = "Header name is missing"
    header_no_question_id = "doesn't have question id"
    header_invalid_id = "has invalid id"
    numeric_validation = "Value should be numeric"
    numeric_max_rule = "Maximum value for ##question## is ##rule##"
    numeric_min_rule = "Minimum value for ##question## is ##rule##"
    lat_long_validation = "Invalid lat long format"
    administration_validation = "Wrong administration format"
    administration_not_valid = "Wrong administration data for"
    administration_not_part_of = "##answer## is not part of ##administration##"
    filename_validation = "Wrong sheet name, there should be sheet named data"
    file_empty_validation = "You have uploaded an empty sheet"
    is_required = "is required"
    start_validation = "DATA VALIDATION STARTED"
    successfully_validation = "IS SUCCESSFULY VALIDATED"
    error_validation = "VALIDATION ERROR"
