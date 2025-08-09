import cv2
import sys

# Get the image path from the command line argument
image_path = sys.argv[1]

# The path to the face detector file you just downloaded
cascade_path = 'haarcascade_frontalface_default.xml'

# Create the cascade classifier
face_cascade = cv2.CascadeClassifier(cascade_path)

# Read the image
img = cv2.imread(image_path)

# Convert to grayscale (required for this detector)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect faces
faces = face_cascade.detectMultiScale(gray, 1.1, 4)

# Print the result
if len(faces) > 0:
    print("face detected")
else:
    print("no face detected")