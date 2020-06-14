import cv2
import numpy as np

color = (0, 255, 0)
thickness = 2
threshold = 0.4
rest_threshold = 0.03


def read_iamge(path):
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)

    # Schimb zonele transparente in alb
    mask = image[:, :, 3] == 0
    image[mask] = [255, 255, 255, 255]

    # Scot canalul de transparenta
    image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)

    return image


def black_percentage(image, start_point, end_point):
    black_pixels = 0
    total_pixels = 0
    for i in range(start_point[0], end_point[0]):
        for j in range(start_point[1], end_point[1]):
            total_pixels += 1
            b, g, r = image[j][i]

            if b < 50 and g < 50 and r < 50:
                black_pixels += 1

    return black_pixels / total_pixels


def rotate_image(image, angle):
    image_center = tuple(np.array(image.shape[1::-1]) / 2)
    rot_mat = cv2.getRotationMatrix2D(image_center, angle, 1.0)
    result = cv2.warpAffine(
        image, rot_mat, image.shape[1::-1], flags=cv2.INTER_LINEAR)
    return result


def is_correct_polygon(path):
    segments = [((130, 413), (328, 427)),
                ((44, 243), (244, 257)),
                ((44, 243), (244, 257)),
                ((160, 433), (340, 447)),
                ((130, 413), (328, 427))]
    rotations = [116, 63, -63, 0, -63]

    rest_segments = [((170, 413), (365, 427)),
                     ((68, 243), (240, 257)),
                     ((162, 433), (338, 447)),
                     ((48, 243), (240, 257)),
                     ((175, 413), (370, 427)),
                     ((68, 243), (240, 257)),
                     ((48, 243), (240, 257))]
    rest_rotations = [63, 0, 180, 116, -116, 180, 243]

    image = read_iamge(path)

    for segment_no in range(len(segments)):
        new_image = rotate_image(image, rotations[segment_no])
        p = black_percentage(
            new_image, segments[segment_no][0], segments[segment_no][1])

        if p < threshold:
            return False

    for rest_segment_no in range(len(rest_segments)):
        new_image = rotate_image(image, rest_rotations[rest_segment_no])
        p = black_percentage(
            new_image, rest_segments[rest_segment_no][0], rest_segments[rest_segment_no][1])

        if p > rest_threshold:
            return False

    return True
