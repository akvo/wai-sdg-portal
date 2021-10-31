from google.cloud import storage

bucket_name = "wai-ethiopia"


def upload(file: str, folder: str, filename: str = None):
    if not filename:
        filename = file.split("/")[-1]
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    destination_blob_name = f"{folder}/{filename}"
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(file)
    blob.make_public()
    return blob.public_url
