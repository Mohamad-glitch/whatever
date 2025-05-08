import asyncio
import time
from collections import Counter

from sqlalchemy.util import await_only
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

detection_results = []

async def run_detection_for_one_minute():
        global detection_results

        #camira connection
        RTSP_URL = "rtsp://username:password@192.168.1.100:554/stream"

        # Load the YOLOv8n pretrained model
        pretrained_model = YOLO("yolov8n.pt")

        # Load your custom-trained YOLO model
        custom_model = YOLO("/opt/render/project/src/weights/best.pt")

        # Open the RTSP stream
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("Error: Cannot open RTSP stream.")
            return {"error": "Cannot open stream"}

        # Track time
        start_time = time.time()
        detection_results = []

        while time.time() - start_time < 60:  # Run for 1 minute
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                continue

            # Run predictions
            results_pretrained = pretrained_model.predict(frame, verbose=False)
            results_custom = custom_model.predict(frame, verbose=False)

            # Get class names
            class_ids_pretrained = results_pretrained[0].boxes.cls.int().tolist()
            names_pretrained = [pretrained_model.names[cid] for cid in class_ids_pretrained]

            class_ids_custom = results_custom[0].boxes.cls.int().tolist()
            names_custom = [custom_model.names[cid] for cid in class_ids_custom]

            # Combine the names from both models
            combined_names = names_pretrained + names_custom

            # Store results
            detection_results.append(combined_names)

            # Count occurrences every frame
            counts = Counter(combined_names)
            output_str = ', '.join([f"{v} {k}" for k, v in counts.items()]) if counts else 'none'
            print(f"Detected items: {output_str}")

            # Start with the original frame and draw both predictions
            combined_frame = frame.copy()

            # Plot pretrained model results onto combined_frame (green)
            for box in results_pretrained[0].boxes:
                b = box.xyxy[0].int().tolist()  # [x1, y1, x2, y2]
                cls_id = int(box.cls[0])
                label = pretrained_model.names[cls_id]
                cv2.rectangle(combined_frame, (b[0], b[1]), (b[2], b[3]), (0, 255, 0), 2)
                cv2.putText(combined_frame, f'Pre: {label}', (b[0], b[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Plot custom model results onto combined_frame (blue)
            for box in results_custom[0].boxes:
                b = box.xyxy[0].int().tolist()  # [x1, y1, x2, y2]
                cls_id = int(box.cls[0])
                label = custom_model.names[cls_id]
                cv2.rectangle(combined_frame, (b[0], b[1]), (b[2], b[3]), (255, 0, 0), 2)
                cv2.putText(combined_frame, f'Custom: {label}', (b[0], b[1] - 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

            # Show the combined frame
            cv2.imshow("YOLO Combined Predictions", combined_frame)

            # Check for 'q' key to quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        # Cleanup
        cap.release()
        cv2.destroyAllWindows()

        # Optionally flatten & count
        flat_list = [item for sublist in detection_results for item in sublist]
        counts = Counter(flat_list)
        print(f"Detection finished. Total counts: {counts}")

        return counts

async def main():
    result = await run_detection_for_one_minute()
    print("Final counts:", result)

if __name__ == "__main__":
    # Running the async function properly
    asyncio.run(main())
#
# if __name__ == "__main__":
#
#     # ====== CONFIG ======
#     RTSP_URL = "rtsp://username:password@192.168.1.100:554/stream"
#
#     # Load the YOLOv8n pretrained model
#     pretrained_model = YOLO("yolov8n.pt")
#
#     # Load your custom-trained YOLO model
#     custom_model = YOLO("./weights/best.pt")
#
#     # Open the RTSP stream
#     cap = cv2.VideoCapture(0)
#
#     if not cap.isOpened():
#         print("Error: Cannot open RTSP stream.")
#         exit()
#
#     # Initialize counter
#     c = 0
#
#     while True:
#         print("hi")
#         c += 1
#         ret, frame = cap.read()
#         if not ret:
#             print("Failed to grab frame.")
#             break
#
#         # Run YOLOv8n prediction (pretrained) with verbose=False to suppress logs
#         results_pretrained = pretrained_model.predict(frame, verbose=False)
#
#         # Run custom YOLO prediction with verbose=False
#         results_custom = custom_model.predict(frame, verbose=False)
#
#         # Get class names for pretrained model
#         class_ids_pretrained = results_pretrained[0].boxes.cls.int().tolist()
#         names_pretrained = [pretrained_model.names[cid] for cid in class_ids_pretrained]
#
#         # Get class names for custom model
#         class_ids_custom = results_custom[0].boxes.cls.int().tolist()
#         names_custom = [custom_model.names[cid] for cid in class_ids_custom]
#
#         # Combine both
#         combined_names = names_pretrained + names_custom
#
#         # Count occurrences
#         counts = Counter(combined_names)
#
#         # Print clean detected items every frame
#         if counts:
#             output_str = ', '.join([f"{v} {k}" for k, v in counts.items()])
#         else:
#             output_str = 'none'
#         print(f"detected items: {output_str}")
#
#         # Start with the original frame and draw both predictions
#         combined_frame = frame.copy()
#
#         # Plot pretrained model results onto combined_frame (green)
#         for box in results_pretrained[0].boxes:
#             b = box.xyxy[0].int().tolist()  # [x1, y1, x2, y2]
#             cls_id = int(box.cls[0])
#             label = pretrained_model.names[cls_id]
#             cv2.rectangle(combined_frame, (b[0], b[1]), (b[2], b[3]), (0, 255, 0), 2)
#             cv2.putText(combined_frame, f'Pre: {label}', (b[0], b[1] - 10),
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
#
#         # Plot custom model results onto combined_frame (blue)
#         for box in results_custom[0].boxes:
#             b = box.xyxy[0].int().tolist()  # [x1, y1, x2, y2]
#             cls_id = int(box.cls[0])
#             label = custom_model.names[cls_id]
#             cv2.rectangle(combined_frame, (b[0], b[1]), (b[2], b[3]), (255, 0, 0), 2)
#             cv2.putText(combined_frame, f'Custom: {label}', (b[0], b[1] - 30),
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
#
#         # Show the combined frame
#         cv2.imshow("YOLO Combined Predictions", combined_frame)
#
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
#
#     # Cleanup
#     cap.release()
#     cv2.destroyAllWindows()