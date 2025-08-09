import cv2
import numpy as np
import sys

# Get the image path from the command line argument
image_path = sys.argv[1]

# --- Load YOLO Model ---
net = cv2.dnn.readNetFromDarknet("./yolo/yolov3.cfg", "./yolo/yolov3.weights")
with open("./yolo/coco.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]

layer_names = net.getLayerNames()
# Correctly get output layer names for different OpenCV versions
try:
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
except TypeError:
    output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]


# --- Process Image ---
img = cv2.imread(image_path)
height, width, channels = img.shape

blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
net.setInput(blob)
outs = net.forward(output_layers)

# --- Find Best Detection ---
class_ids = []
confidences = []
for out in outs:
    for detection in out:
        scores = detection[5:]
        class_id = np.argmax(scores)
        confidence = scores[class_id]
        if confidence > 0.5: # Confidence threshold
            confidences.append(float(confidence))
            class_ids.append(class_id)

# --- Print the Result ---
if len(class_ids) > 0:
    # Find the index of the highest confidence
    best_detection_index = np.argmax(confidences)
    best_class_id = class_ids[best_detection_index]
    label = str(classes[best_class_id])
    print(label)
else:
    print("mysterious object")