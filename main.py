import os
from typing import Annotated, Sequence
from routers import JWTtoken
from fastapi.middleware.cors import CORSMiddleware

from fastapi import Depends, FastAPI
from sqlmodel import Field, Session, SQLModel, create_engine
from starlette.staticfiles import StaticFiles
from routers import farm_routs, user_routs


sql_file_name = "farm_database.db"
sql_url = f"sqlite:///./{sql_file_name}"
connect_args = {"check_same_thread": False}  # recommended by FastAPI docs

#connecting database
engine = create_engine(sql_url, connect_args=connect_args)



#creating database
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# This is what ensures that we use a single session per request.
def get_session():
    with Session(engine) as session:
        yield session  #yield that will provide a new Session for each request.


# we create an Annotated dependency SessionDep to simplify the rest of the code that will use this dependency.
SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "" with specific origins for better security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Connecting To Frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(farm_routs.router)
app.include_router(user_routs.router)
app.include_router(JWTtoken.router)


