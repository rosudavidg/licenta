from PIL import Image, ImageFont, ImageDraw
import numpy as np
import cv2

# Fontul folosit pentru text
font = ImageFont.truetype('./Roboto-Black.ttf', 40)

# Imaginea de baza
image = Image.open("./directional-base.png")

# Adaugarea textului
draw = ImageDraw.Draw(image)
draw.text((200, 105), "Târgu Mureș", font=font, fill=(255, 255, 255))
draw.text((230, 185), "Cluj-Napoca", font=font, fill=(255, 255, 255))

# Salarea imaginii
image = np.array(image)
image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
cv2.imwrite("out.png", image)
