from collections import Counter

import shared_data
from ultralytics import YOLO
import cv2
c = 1
# def train_model():
#     # Load a COCO-pretrained YOLOv8n model
#     model = YOLO("yolov8n.pt")
#     model.train(
#         data="C:/Users/mosta/Desktop/final_project/data.yaml",  # path to data.yaml
#         epochs=10,  # additional training epochs
#         imgsz=416,  # image size
#         batch=16,  # batch size
#         name='yolov8_plant_resume',  # new run name
#         project="C:/Users/mosta/Desktop/final_project/runs",  # custom output location
#         workers=2,  # number of dataloader workers
#         device='cuda'  # use GPU (if available)
#     )
#     metrics = model.val()
#
#     result = model.predict(source="C:/Users/mosta/Desktop/final_project/test/images",save=True,conf=0.5)
#     print(result)

def whateve():
    pass

if __name__ == "__main__":

    # ====== CONFIG ======
    RTSP_URL = "rtsp://username:password@192.168.1.100:554/stream"

    # Load the YOLOv8n pretrained model
    pretrained_model = YOLO("yolov8n.pt")

    # Load your custom-trained YOLO model
    custom_model = YOLO("./weights/best.pt")

    # Open the RTSP stream
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Cannot open RTSP stream.")
        exit()

    while True:
        print("hi")
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        results_pretrained = pretrained_model.predict(frame, verbose=False)
        results_custom = custom_model.predict(frame, verbose=False)

        class_ids_pretrained = results_pretrained[0].boxes.cls.int().tolist()
        names_pretrained = [pretrained_model.names[cid] for cid in class_ids_pretrained]

        class_ids_custom = results_custom[0].boxes.cls.int().tolist()
        names_custom = [custom_model.names[cid] for cid in class_ids_custom]

        combined_names = names_pretrained + names_custom
        counts = Counter(combined_names)

        if counts:
            output_str = ', '.join([f"{v} {k}" for k, v in counts.items()])
        else:
            output_str = 'none'

        print(f"Detected items: {output_str}")

        # 🔥 UPDATE the shared data
        shared_data.latest_detection["detected"] = output_str

        cv2.imshow("YOLO Combined Predictions", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


    # Cleanup
    cap.release()
    cv2.destroyAllWindows()