import pandas as pd
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
    total_data = seed.seed(session=session,
                           file=storage.download(jobs["payload"]),
                           user=jobs["created_by"],
                           form=info["form_id"])
    status = JobStatus.done if total_data else JobStatus.failed
    if total_data:
        info.update({"records": total_data})
        # success email
        body = EmailText.data_upload_body.value.replace(
            "--filename--",
            str(original_filename)).replace("--total_records--",
                                            str(total_data))
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_submission_success,
                      body=body)
        email.send
    else:
        # failed email
        body = EmailText.data_upload_body.value.replace(
            "--filename--", str(original_filename))
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_submission_failed,
                      body=body)
        email.send
    time.sleep(3)
    jobs = crud.update(session=session,
                       id=jobs["id"],
                       status=status,
                       info=info)
    print_log_done(f"SEEDER: {status}", start_time)


def run_validate(session: Session, jobs: dict):
    start_time = print_log_start(ValidationText.start_validation.value)
    original_filename = jobs["info"]["original_filename"]
    user = get_user_by_id(session=session, id=jobs["created_by"])
    info = jobs["info"]
    id = jobs["id"]
    message = ValidationText.successfully_validation.value
    payload = None
    error = validation.validate(session=session,
                                form=info["form_id"],
                                administration=info["administration"],
                                file=storage.download(jobs["payload"]))
    if len(error):
        error_list = pd.DataFrame(error)
        error_list = error_list[list(
            filter(lambda x: x != "error", list(error_list)))]
        error_file = f"./tmp/error-{id}.csv"
        error_list = error_list.to_csv(error_file, index=False)
        # error email
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_validation_failed,
                      attachment=error_file,
                      body=original_filename)
        email.send
        # end of email
        error_file = storage.upload(error_file, "error", public=True)
        payload = error_file
        message = ValidationText.error_validation.value
    print(f"JOBS #{id} {message}")
    status = JobStatus.failed if len(error) else JobStatus.pending
    time.sleep(3)
    jobs = crud.update(session=session,
                       id=jobs["id"],
                       payload=payload,
                       type=None if len(error) else JobType.seed_data,
                       status=status)
    print_log_done(f"VALIDATION {status}", start_time)
    if len(error) == 0:
        # success email
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_validation_success,
                      body=original_filename)
        email.send
        # end of email
        # run_seed(session=session, jobs=jobs, init=True)


def run_download(session: Session, jobs: dict):
    start_time = print_log_start("DATA DOWNLOAD STARTED")
    out_file = jobs["payload"]
    file, context = downloader.download(session=session,
                                        jobs=jobs,
                                        file=f"./tmp/{out_file}")
    # set email payload
    user = get_user_by_id(session=session, id=jobs["created_by"])
    email = Email(recipients=[user.recipient],
                  type=MailTypeEnum.data_download_success,
                  attachment=file,
                  context=context.to_html())
    sent = email.send
    if sent:
        output = storage.upload(file, "download", out_file)
        jobs = crud.update(session=session,
                           id=jobs["id"],
                           payload=output.split("/")[1],
                           status=JobStatus.done)
        print_log_done(f"FILE CREATED {output}", start_time)
    else:
        print_log_done(f"FAILED TO CREATED {file}", start_time)


def force_remove_task(session: Session, jobs: dict):
    user = get_user_by_id(session=session, id=jobs["created_by"])
    try:
        attachment = jobs.get("payload")
        if jobs["type"] == JobType.download:
            attachment = storage.download(attachment)
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_submission_failed,
                      attachment=attachment)
        email.send
    except Exception as e:
        write_log("ERROR", str(e))
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_submission_failed)
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
        write_log("ERROR", str(e))
    return True
