from fastapi import APIRouter
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlmodel import Session, SQLModel, create_engine, select
from starlette.responses import HTMLResponse
from routers import farm_routs, user_routs  # And these import JWTtoken
import models
from models.user import User
from models.crop import Crop, CropCreate
from models.farm import FarmCreate, Farm, FarmPublic
from models.sensor import SensorCreate, Sensor
from routers.JWTtoken import get_current_user

router = APIRouter()

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


@router.get("/", response_class=HTMLResponse)
async def get_index():
    return HTMLResponse(content=open("static/index.html").read())


# create the database on starting app startup
@router.on_event("startup")
def on_startup():
    create_db_and_tables()


@router.post("/farm", tags=["farm"])
def create_farm(farm: FarmCreate, session: SessionDep):
    """Create New Farm"""
    db_farm = Farm.model_validate(farm)
    session.add(db_farm)
    session.commit()
    session.refresh(db_farm)
    return db_farm

@router.get("/farm", tags=["farm"])
def read_farm(session: SessionDep):
    """Get All Farms In DB"""
    farms = session.exec(select(Farm)).all()
    return farms


#to add authentication use this in the function  current_user: User = Depends(get_current_user)
@router.get("/farm/{farm_name}", response_model=FarmPublic, tags=["farm"])
def read_farm(farm_name: str, session:SessionDep, current_user: User = Depends(get_current_user)) -> Farm:
    """Get Farm By Name """
    statement = select(Farm).where(Farm.name == farm_name)
    farm = session.exec(statement).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    return farm

@router.get("/farm/{farm_name}/crops", tags=["farm"])
def read_farm_crops(farm_name: str, session: SessionDep):
    """Get Crops Of Farm """
    # Step 1: Get the farm by name
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Step 2: Get the crops linked to this farm
    crops = session.exec(select(Crop).where(Crop.farm_id == farm.id)).all()
    return crops


@router.post("/farm/{farm_name}/crops", tags=["farm"])
def create_crops(crops: CropCreate, session: SessionDep, farm_name: str):
    """Create Crops Of Farm """

    # Find the farm by name
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Assign the farm ID to the crop
    db_crop = Crop(**crops.dict(), farm_id=farm.id)

    session.add(db_crop)
    session.commit()
    session.refresh(db_crop)

    return db_crop

@router.get("/farm/{farm_name}/farmCrops", tags=["farm"])
def read_farm_allcrops(farm_name: str, session: SessionDep):
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")


    farm_crops = session.exec(select(Crop).where(Crop.farm_id == farm.id)).all()
    return farm_crops


@router.post("/farm/{farm_name}/sensor", tags=["farm"])
def create_sensor_data(sensor_data: SensorCreate, session: SessionDep, farm_name: str):
    """Create a new sensor reading for a specific farm."""

    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Create Sensor instance linked to farm
    sensor = Sensor(**sensor_data.dict(), farm_id=farm.id)

    session.add(sensor)
    session.commit()
    session.refresh(sensor)

    return sensor



@router.get("/farm/{farm_name}/sensorStats", tags=["farm"])
def read_farm_sensor_stats(farm_name: str, session: SessionDep):
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")


    farm_sensor = session.exec(select(Sensor).where(Sensor.farm_id == farm.id)).all()
    return farm_sensor

