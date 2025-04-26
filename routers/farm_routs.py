from typing import Annotated

from fastapi import APIRouter
from fastapi import Depends, HTTPException
from sqlmodel import Session, SQLModel, create_engine, select

from models.crop import Crop, CropCreate
from models.farm import Farm, FarmPublic
from models.sensor import SensorCreate, Sensor
from models.user import User
from routers.JWTtoken import get_current_user

router = APIRouter(
    prefix="/farms",
    tags=["farm"]
)

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



# create the database on starting app startup
@router.on_event("startup")
def on_startup():
    create_db_and_tables()


@router.get("/read_all")
def read_farm(session: SessionDep):
    """Get All Farms In DB"""
    farms = session.exec(select(Farm)).all()
    return farms


#to add authentication use this in the function  current_user: User = Depends(get_current_user)
@router.get("/", response_model=FarmPublic)
def read_farm(session: SessionDep, current_user: User = Depends(get_current_user)) -> Farm:
    """Get the current user's farm"""
    farm_name = current_user.farm_id  # assumes 'farm_name' is a field on the User model

    statement = select(Farm).where(Farm.id == farm_name)
    farm = session.exec(statement).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    return farm


@router.get("/crops")
def read_farm_crops(session: SessionDep, current_user: User = Depends(get_current_user)):
    """Get Crops Of Farm """
    farm_id = current_user.farm_id

    # Step 2: Get the crops linked to this farm
    crops = session.exec(select(Crop).where(Crop.farm_id == farm_id)).all()
    return crops


@router.post("/crops")
def create_crops(crops: CropCreate, session: SessionDep, current_user: User = Depends(get_current_user)):
    """Create Crops Of Farm """

    farm_id = current_user.farm_id
    # Find the farm by name
    farm = session.exec(select(Farm).where(Farm.id == farm_id)).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Assign the farm ID to the crop
    db_crop = Crop(**crops.dict(), farm_id=farm.id)

    session.add(db_crop)
    session.commit()
    session.refresh(db_crop)

    return db_crop

@router.delete("/crops")
def delete_crops(crop_id: int, session: SessionDep, current_user: User = Depends(get_current_user)):
    """Delete Crops Of Farm """
    crop = session.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    session.delete(crop)
    session.commit()
    return {"message": "Crop Deleted"}


@router.post("/sensor")
def create_sensor_data(sensor_data: SensorCreate, session: SessionDep, current_user: User = Depends(get_current_user)):
    """Create a new sensor reading for a specific farm."""

    farm_id = current_user.farm_id
    # Create Sensor instance linked to farm
    sensor = Sensor(**sensor_data.dict(), farm_id=farm_id)

    session.add(sensor)
    session.commit()
    session.refresh(sensor)

    return sensor



@router.get("/sensorStats")
def read_farm_sensor_stats(session: SessionDep, current_user: User = Depends(get_current_user)):
    """Read sensor Stats for a specific farm."""
    farm_id = current_user.farm_id

    farm_sensor = session.exec(select(Sensor).where(Sensor.farm_id == farm_id)).all()
    return farm_sensor

