import uvicorn
from db import models
from db.connection import engine
from core.config import app

models.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
