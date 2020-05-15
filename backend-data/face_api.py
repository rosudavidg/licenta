from keras_vggface.utils import preprocess_input
from keras_vggface.vggface import VGGFace
from keras.models import model_from_json
from mtcnn.mtcnn import MTCNN
from scipy.spatial.distance import cosine
from numpy import asarray
from PIL import Image
from matplotlib import pyplot


def extract_faces(detector, model, required_size, filename):
    # Incarca poza in memorie
    pixels = pyplot.imread(filename)

    # Detectarea fetelor in imagine
    results = detector.detect_faces(pixels)

    faces_array = []

    # Pentru fiecare fata detectata
    for result in results:
        # Extrage bounding box-ul
        x, y, width, height = result['box']
        face = pixels[y:y + height, x:x + width]

        # Redimensioneaza imaginea cu fata
        image = Image.fromarray(face).resize(required_size)
        face_array = asarray(image)

        faces_array.append(face_array)

    if len(results) == 0:
        return []

    # Calculare embeddings
    samples = asarray(faces_array, 'float32')
    samples = preprocess_input(samples, version=2)
    embeddings = model.predict(samples)

    faces = []

    # Colecteaza datele intr-o singura reprezentare
    for result, embedding in zip(results, embeddings):
        x, y, width, height = result['box']

        face = {
            'filename': filename,
            'x': x,
            'y': y,
            'width': width,
            'height': height,
            'embedding': embedding
        }

        faces.append(face)

    return faces


def is_match(known_embedding, candidate_embedding, thresh):
    # Calculeaza distanta dintre embedding-uri
    score = cosine(known_embedding, candidate_embedding)

    # Intoarce True sau False
    return score <= thresh


def merge_faces(faces, thresh):
    # Prelucreaza un vector de fete si le grupeaza pe cele ale aceeasi persoane

    known_faces = []

    for face in faces:
        matched = False

        for known_face in known_faces:
            if is_match(face['embedding'], known_face['embedding'], thresh):
                known_face['faces'].append(face)
                matched = True
                break

        if not matched:
            known_faces.append({
                'embedding': face['embedding'],
                'faces': [face]
            })

    return known_faces


def get_persons(filenames):
    required_size = (224, 224)

    # Pragul pentru a considera doua embeddinguri identice
    thresh = 0.5

    # Modelul utilizat pentru detectie
    detector = MTCNN(min_face_size=50)

    # Modelul utilizat pentru embedding
    # model = VGGFace(model='resnet50', include_top=False,
    #                 input_shape=(224, 224, 3), pooling='avg')

    json_file = open('/user/src/app/face_model.json', 'r')
    model_json = json_file.read()
    json_file.close()
    model = model_from_json(model_json)
    model.load_weights("/user/src/app/face_model.h5")

    faces = []

    for filename in filenames:
        try:
            faces += extract_faces(detector, model, required_size, filename)
        except:
            pass

    return merge_faces(faces, thresh)
