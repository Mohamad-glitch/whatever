from typing import Annotated, Sequence

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

from models.crop import Crop, CropCreate
from models.farm import FarmCreate, Farm, FarmPublic
from models.sensor import SensorCreate, Sensor

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


@app.get("/", response_class=HTMLResponse)
async def get_index():
    return HTMLResponse(content=open("static/index.html").read())


# create the database on starting app startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.post("/farm")
def create_farm(farm: FarmCreate, session: SessionDep):
    """Create New Farm"""
    db_farm = Farm.model_validate(farm)
    session.add(db_farm)
    session.commit()
    session.refresh(db_farm)
    return db_farm

@app.get("/farm")
def read_farm(session: SessionDep):
    """Get All Farms In DB"""
    farms = session.exec(select(Farm)).all()
    return farms


@app.get("/farm/{farm_name}", response_model=FarmPublic)
def read_farm(farm_name: str, session:SessionDep) -> Farm:
    """Get Farm By Name """
    statement = select(Farm).where(Farm.name == farm_name)
    farm = session.exec(statement).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    return farm

@app.get("/farm/{farm_name}/crops")
def read_farm_crops(farm_name: str, session: SessionDep):
    """Get Crops Of Farm """
    # Step 1: Get the farm by name
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Step 2: Get the crops linked to this farm
    crops = session.exec(select(Crop).where(Crop.farm_id == farm.id)).all()
    return crops


@app.post("/farm/{farm_name}/crops")
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

@app.get("/farm/{farm_name}/farmCrops")
def read_farm_allcrops(farm_name: str, session: SessionDep):
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")


    farm_crops = session.exec(select(Crop).where(Crop.farm_id == farm.id)).all()
    return farm_crops


@app.post("/farm/{farm_name}/sensor")
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



@app.get("/farm/{farm_name}/sensorStats")
def read_farm_sensor_stats(farm_name: str, session: SessionDep):
    farm = session.exec(select(Farm).where(Farm.name == farm_name)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")


    farm_sensor = session.exec(select(Sensor).where(Sensor.farm_id == farm.id)).all()
    return farm_sensor




@app.get("/getmoisture")
async def get_moisture(percentage: float):
    print(percentage)
    return {"percentage":percentage}


















