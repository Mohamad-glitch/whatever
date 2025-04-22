import os
from typing import Annotated, Sequence
from routers import farm_routs, user_routs, JWTtoken

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from openai import OpenAI
from sqlmodel import Field, Session, SQLModel, create_engine, select
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles
from routers import farm_routs, user_routs

from models.crop import Crop, CropCreate
from models.farm import FarmCreate, Farm, FarmPublic
from models.sensor import SensorCreate, Sensor
from models.user import User, UserPublic, UserCreate
import openai

sql_file_name = "farm_database.db"
sql_url = f"sqlite:///./{sql_file_name}"
connect_args = {"check_same_thread": False} # recommended by FastAPI docs

#connecting database
engine = create_engine(sql_url, connect_args=connect_args)


#creating database
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# This is what ensures that we use a single session per request.
def get_session():
    with Session(engine) as session:
        yield session #yield that will provide a new Session for each request.


# we create an Annotated dependency SessionDep to simplify the rest of the code that will use this dependency.
SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

#Connecting To Frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(farm_routs.router)
app.include_router(user_routs.router)
app.include_router(JWTtoken.router)




