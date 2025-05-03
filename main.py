import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from sqlmodel import Session, SQLModel, create_engine
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

from routers import JWTtoken
from routers import farm_routs, user_routs


load_dotenv()  # Load variables from .env
# chat-bot api and connection
API_KEY = os.getenv("gpt_api_key")
client = OpenAI(api_key=API_KEY)

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

@app.get("/chat_bot")
def chat_bot_answer(prompt : str):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


@app.get("/", response_class=HTMLResponse)
async def get_index():
    """Show Home Page."""
    return HTMLResponse(content=open("static/about.html").read())

@app.get("/register", response_class=HTMLResponse)# get the register page
async def register():
    """Register User."""
    return HTMLResponse(content=open("static/register.html").read())

@app.get("/home", response_class=HTMLResponse)
async def home():
    """Home Page."""
    return HTMLResponse(content=open("static/index.html").read())

@app.get("/devs/whatever")
async def devs():
    """Whatever Page for devs"""
    return HTMLResponse(content=open("static/whatever.html").read())
