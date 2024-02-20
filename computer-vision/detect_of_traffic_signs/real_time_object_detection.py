from ultralytics import YOLO

model = YOLO('best_weights.pt')
model.predict(source='test_video_footage.mp4', save=True)
