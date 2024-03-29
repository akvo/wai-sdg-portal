import pandas as pd
import os
import gc
import time
from sqlalchemy.orm import Session
from datetime import timedelta
from time import process_time
import db.crud_jobs as crud
from . import validation
from . import downloader
from . import seed
from models.jobs import JobType, JobStatus
import util.storage as storage
from db.crud_user import get_user_by_id
from util.mailer import Email, MailTypeEnum
from util.log import write_log
from util.i18n import ValidationText, EmailText

STORAGE_LOCATION = os.environ.get("STORAGE_LOCATION")
desired_path = "/api/download/file/"


def print_log_start(message):
    print(message)
    return process_time()


def print_log_done(message, start_time):
    elapsed_time = process_time() - start_time
    elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
    print(f"{message} DONE IN {elapsed_time}")


def run_seed(session: Session, jobs: dict):
    start_time = print_log_start("DATA SEEDER STARTED")
    original_filename = jobs["info"]["original_filename"]
    user = get_user_by_id(session=session, id=jobs["created_by"])
    info = jobs["info"]
    total_data = seed.seed(
        session=session,
        file=storage.download(jobs["payload"]),
        user=jobs["created_by"],
        form=info["form_id"],
    )
    status = JobStatus.done if total_data else JobStatus.failed
    if total_data:
        info.update({"records": total_data})
        # success email
        body = EmailText.data_upload_body.value.replace(
            "--filename--", str(original_filename)
        ).replace("--total_records--", str(total_data))
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_submission_success,
            body=body,
        )
        email.send
    else:
        # failed email
        body = EmailText.data_upload_body.value.replace(
            "--filename--", str(original_filename)
        )
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_submission_failed,
            body=body,
        )
        email.send
    time.sleep(3)
    payload = jobs["payload"]
    if STORAGE_LOCATION:
        payload = payload.split("/")[-1]
        payload = desired_path + payload
    jobs = crud.update(session=session, id=jobs["id"], payload=payload, status=status, info=info)
    print_log_done(f"SEEDER: {status}", start_time)


def run_validate(session: Session, jobs: dict):
    print_log_start(ValidationText.start_validation.value)
    original_filename = jobs["info"]["original_filename"]
    user = get_user_by_id(session=session, id=jobs["created_by"])
    info = jobs["info"]
    id = jobs["id"]
    message = ValidationText.successfully_validation.value
    error = validation.validate(
        session=session,
        form=info["form_id"],
        administration=info["administration"],
        file=storage.download(jobs["payload"]),
    )
    if len(error):
        error_list = pd.DataFrame(error)
        error_list = error_list[list(filter(lambda x: x != "error", list(error_list)))]
        error_file = f"./tmp/error-{id}.csv"
        error_list = error_list.to_csv(error_file, index=False)
        # error email
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_validation_failed,
            attachment=error_file,
            body=original_filename,
        )
        email.send
        # end of email
        error_file = storage.upload(error_file, "error", public=True)
        message = ValidationText.error_validation.value
        if STORAGE_LOCATION:
            # Extract the file name from the original path
            file_name = error_file.split("/")[-1]
            error_file = desired_path + file_name
        jobs = crud.update(
            session=session, id=id, payload=error_file, status=JobStatus.failed
        )
    else:
        # success email
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_validation_success,
            body=original_filename,
        )
        email.send
        # end of email
        time.sleep(3)
        jobs = crud.update(
            session=session,
            id=id,
            type=JobType.seed_data,
            status=JobStatus.pending,
        )
    print(f"JOBS #{id} {message}")


def run_download(session: Session, jobs: dict):
    start_time = print_log_start("DATA DOWNLOAD STARTED")
    out_file = jobs["payload"]
    file, context = downloader.download(
        session=session, jobs=jobs, file=f"./tmp/{out_file}"
    )
    # set email payload
    user = get_user_by_id(session=session, id=jobs["created_by"])
    email = Email(
        recipients=[user.recipient],
        type=MailTypeEnum.data_download_success,
        attachment=file,
        context=context.to_html(),
    )
    sent = email.send
    if sent:
        output = storage.upload(file, "download", out_file)
        payload = output.split("/")[-1]
        jobs = crud.update(
            session=session,
            id=jobs["id"],
            payload=payload,
            status=JobStatus.done,
        )
        print_log_done(f"FILE CREATED {output}", start_time)
    else:
        jobs = crud.update(
            session=session,
            id=jobs["id"],
            payload=output.split("/")[1],
            status=JobStatus.failed,
        )
        print_log_done(f"FAILED TO CREATED {file}", start_time)


def force_remove_task(session: Session, jobs: dict):
    user = get_user_by_id(session=session, id=jobs["created_by"])
    try:
        attachment = jobs.get("payload")
        if jobs["type"] == JobType.download:
            attachment = storage.download(attachment)
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_submission_failed,
            attachment=attachment,
        )
        email.send
    except Exception as e:
        write_log("ERROR", str(e))
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_submission_failed,
        )
        email.send
    crud.update(session=session, id=jobs["id"], status=JobStatus.failed)
    print("Force removed jobs_id {} by {}".format(jobs["id"], user["email"]))


def do_task(session: Session, jobs):
    try:
        if jobs["type"] == JobType.validate_data:
            run_validate(session=session, jobs=jobs)
            gc.collect()
        if jobs["type"] == JobType.seed_data:
            run_seed(session=session, jobs=jobs)
            gc.collect()
        if jobs["type"] == JobType.download:
            run_download(session=session, jobs=jobs)
    except Exception as e:
        jobs = crud.update(session=session, id=jobs["id"], status=JobStatus.failed)
        write_log("ERROR", str(e))
    return True
