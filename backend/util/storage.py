import os
from pathlib import Path
from google.cloud import storage
import shutil

bucket_name = "wai-ethiopia"
TESTING = os.environ.get("TESTING")


def upload(file: str, folder: str, filename: str = None):
    if not filename:
        filename = file.split("/")[-1]
    if TESTING:
        fake_location = f"./tmp/fake-storage/{filename}"
        shutil.copy2(fake_location, file)
        return fake_location
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    destination_blob_name = f"{folder}/{filename}"
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file)
    os.remove(file)
    # blob.make_public()
    return blob.name


def delete(url: str):
    file = url.split("/")[-1]
    folder = url.split("/")[-2]
    if TESTING:
        os.remove(f"./tmp/{url}")
        return url
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(f"{folder}/{file}")
    blob.delete()
    return blob.name


def check(url: str):
    if TESTING:
        path = Path(url)
        return path.is_file()
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    return storage.Blob(bucket=bucket, name=url).exists(storage_client)
