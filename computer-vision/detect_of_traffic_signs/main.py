from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import requests
import os

model = YOLO('best_weights.pt')


app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/detection-response/video/{chat_id}")
async def process_video(chat_id: int, file: UploadFile=File(...)):
    contents = await file.read()
    filename = file.filename + ".mp4"

    with open(filename, "wb") as f:
        f.write(contents)

    directory = "runs/detect"
    files = os.listdir(directory)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(directory, x)), reverse=True)

    model.predict(source=filename, save=True)

    last_folder = files[0]
    processed_file = directory + "/" + last_folder + "/video.avi"

    with open(processed_file, "rb") as file:
        files={"file":file}
        target_url = 'http://localhost:3000/api/detection-response/video/' + str(chat_id)
        response = requests.post(target_url, files=files)

        print(response)

    return {"filename": filename}