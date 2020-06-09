from keras.models import model_from_yaml
import cv2
import numpy as np

# Zonele unde se gasesc orele
regs = {
    1: (300, 25, 175, 150),
    2: (350, 100, 175, 150),
    3: (375, 175, 175, 150),
    4: (350, 250, 175, 150),
    5: (325, 350, 175, 150),
    6: (175, 350, 175, 150),
    7: (50, 350, 175, 150),
    8: (25, 275, 175, 150),
    9: (0, 175, 175, 150),
    10: (25, 100, 175, 150),
    11: (50, 25, 175, 150),
    12: (175, 0, 175, 150)
}

# Cifrele care trebuie recunoscute pentru fiecare ora
expected = {
    1: [1],
    2: [2],
    3: [3],
    4: [4],
    5: [5],
    6: [6],
    7: [7],
    8: [8],
    9: [9],
    10: [0, 1],
    11: [1, 1],
    12: [1, 2]
}


def load_model():
    """Incarca modelul pentru recunoasterea cifrelor"""

    yaml_file = open('/usr/src/app/clock_model.yaml', 'r')
    model_yaml = yaml_file.read()
    yaml_file.close()

    model = model_from_yaml(model_yaml)
    model.load_weights("/usr/src/app/clock_model.h5")

    return model


def is_correct_clock(filename):
    regs_contours = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: []
    }

    # Incarcare model
    model = load_model()

    # Adug imaginea in memorie
    image = cv2.imread(filename, cv2.IMREAD_UNCHANGED)

    # Schimb zonele transparente in alb
    mask = image[:, :, 3] == 0
    image[mask] = [255, 255, 255, 255]

    # Scot canalul de transparenta
    image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)

    # Conversie la grey-scale
    grey = cv2.cvtColor(image.copy(), cv2.COLOR_BGR2GRAY)

    # Gasire zone care ar putea contine cifre
    ret, thresh = cv2.threshold(grey.copy(), 75, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(
        thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    preprocessed_digits = []

    # Numarul de elemente corecte
    correct = 0
    # Numarul de elemente corecte asteptat
    # 9 ore cu 1 cifra
    # 3 ore cu 2 cifre
    ex_correct = 9 * 1 + 3 * 2

    # Impartirea contururilor dupa zona in care se afla
    for e, v in regs.items():
        x, y, w, h = v

        for c in contours:
            x_c, y_c, w_c, h_c = cv2.boundingRect(c)

            # Versiunea cand cifra este in intregime in zona delimitata
            # if x < x_c and x + w > x_c + w_c and y < y_c and y + h > y_c + h_c:

            # Versiunea cand cifra are coltul stanga sus in zona delimitata
            if x < x_c and x + w > x_c and y < y_c and y + h > y_c:
                regs_contours[e].append(c)

    # Calcularea numarului de cifre corecte
    for hour in range(1, 13):
        # TODO: inverseaza cele doua for-uri (urmatoare)
        for c in regs_contours[hour]:
            x, y, w, h = cv2.boundingRect(c)
            digit = thresh[y:y+h, x:x+w]
            resized_digit = cv2.resize(digit, (18, 18))
            padded_digit = np.pad(
                resized_digit, ((5, 5), (5, 5)), "constant", constant_values=0)
            prediction = model.predict(
                padded_digit.reshape(1, 28, 28, 1))
            predicted = np.argmax(prediction)

            predicted_list = []

            for x in np.nditer(predicted):
                predicted_list.append(x)

            for e in expected[hour]:
                if e in predicted_list:
                    print(f'am gasit {e} pentru ora {hour}')
                    correct += 1
                    predicted_list.remove(e)

    # TODO: mecasism precizie limbi ceas

    # Calculare precizie
    acc = correct / ex_correct

    print(acc)

    return acc > 0.5


# res = is_correct_clock('/images/2965321766845954/clocks/19.png')
