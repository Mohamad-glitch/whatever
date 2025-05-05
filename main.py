import json
import os
from typing import Annotated

import requests
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import Session, SQLModel, create_engine
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

from routers import JWTtoken
from routers import farm_routs, user_routs

#let the server gets the api key from the server(render)
if os.getenv("RENDER") != "true":
    from dotenv import load_dotenv
    load_dotenv()
API_KEY = os.getenv("gpt_api_key")

class ChatBot(BaseModel):
    prompt : str


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


# has brainrot
@app.post("/chat_bot")
def chat_bot_answer(prompt: ChatBot):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "qwen/qwen3-4b:free",
        "messages": [
            {
                "role": "user",
                "content": prompt.prompt
            }
        ]
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    try:
        response.raise_for_status()
        response_json = response.json()
        if "choices" not in response_json:
            return JSONResponse(status_code=500, content={"error": "No 'choices' in API response", "full_response": response_json})

        content = response_json["choices"][0]["message"]["content"]
        return {"content": content}

    except requests.exceptions.RequestException as e:
        return JSONResponse(status_code=500, content={"error": "Request failed", "details": str(e), "response_text": response.text})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Failed to process response", "details": str(e), "response_text": response.text})


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




