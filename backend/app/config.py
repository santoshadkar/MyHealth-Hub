import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MyHealth Portal Engine"
    VERSION: str = "2.0.1"
    API_PORT: int = 8000
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

settings = Settings()
