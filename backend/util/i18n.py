import os
import enum

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


class ValidationText(enum.Enum):
    header_name_missing = "Header name is missing"
    header_no_question_id = "doesn't have question id"
    header_invalid_id = "has invalid id"
    numeric_validation = "Value should be numeric"
    numeric_max_rule = "Maximum value for --question-- is --rule--"
    numeric_min_rule = "Minimum value for --question-- is --rule--"
    lat_long_validation = "Invalid lat long format"
    administration_validation = "Wrong administration format"
    administration_not_valid = "Wrong administration data for"
    administration_not_part_of = "--answer-- is not part of --administration--"
    template_validation = "Wrong sheet names or invalid file upload template"
    file_empty_validation = "You have uploaded an empty sheet"
    is_required = "is required"
    start_validation = "DATA VALIDATION STARTED"
    successfully_validation = "IS SUCCESSFULY VALIDATED"
    error_validation = "VALIDATION ERROR"


class EmailText(enum.Enum):
    data_upload_body = """
        Thank you for uploading data to the portal.<br>
        File name: <b>--filename--</b><br>
        Total records: <b>--total_records--</b>
        """
    data_validation_success = {
        "title": "Data Validation Success",
        "subject": "Data Validation",
        "body": "filename",
        "message": """
                  <div style="color: #11A840;">
                      Data Validation have passed successfully!
                  </div>
                  """,
        "image": f"{image_url}/check-circle.png",
    }
    data_validation_failed = {
        "title": "Data Validation Failed",
        "subject": "Data Validation",
        "body": "filename",
        "message": """
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    """,
        "image": f"{image_url}/exclamation-circle.png",
    }
    data_submission_success = {
        "title": "Data Upload Completed",
        "subject": "Data Upload",
        "body": "filename",
        "message": """
                    <div style="color: #11A840;">
                        Data have uploaded successfully!
                    </div>
                    """,
        "image": f"{image_url}/check-circle.png",
    }
    data_submission_failed = {
        "title": "Data Upload Failed",
        "subject": "Data Upload",
        "body": "filename",
        "message": """
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    """,
        "image": f"{image_url}/exclamation-circle.png",
    }
    data_submission_too_many_error = {
        "title": "Data Upload Failed",
        "subject": "Data Upload Failed",
        "body": None,
        "message": """
                    <div style="color: #9F0031;">
                        Too many errors, Jobs is canceled by the system
                    </div>
                    """,
        "image": f"{image_url}/exclamation-circle.png",
    }
    data_updates = {
        "title": "Data Updated",
        "subject": "Data Updates",
        "body": None,
        "message": None,
        "image": f"{image_url}/check-circle.png",
    }
    data_download_success = {
        "title": "Data Download Completed",
        "subject": "Data Download",
        "body": "Your data are ready to download.",
        "message": None,
        "image": f"{image_url}/file-excel-green.png",
    }
    data_download_failed = {
        "title": "Data Download Failed",
        "subject": "Data Download",
        "body": None,
        "message": """
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    """,
        "image": f"{image_url}/file-excel-red.png",
    }
    user_reg_new = {
        "title": "New Account Registration",
        "subject": "Registration",
        "body": "User waiting for approval",
        "message": None,
        "image": f"{image_url}/user.png",
    }
    user_reg_approved = {
        "title": "Registration Approved",
        "subject": "Registration",
        "body": """
                Congratulations!! You are now a verified user, with great
                power comes great responsibility.
                """,
        "message": None,
        "image": f"{image_url}/check-circle.png",
    }
    user_acc_changed = {
        "title": "Access Changed",
        "subject": "User Access",
        "body": "Your access have been updated.",
        "message": None,
        "image": f"{image_url}/user-switch.png",
    }
