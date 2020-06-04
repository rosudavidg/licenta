import os

file = open('13-animals-data.sql', 'w')

dirs = {
    'butterfly': 'fluture',
    'cat': 'pisică',
    'chicken': 'găină',
    'cow': 'vacă',
    'dog': 'câine',
    'elephant': 'elefant',
    'horse': 'cal',
    'sheep': 'oaie',
    'spider': 'păianjen',
    'squirrel': 'veveriță'
}

for e, v in dirs.items():
    for filename in sorted(os.listdir(e)):
        sql = f"INSERT INTO animals (path, animal_type) SELECT '/animals/{e}/{filename}', animal_types.id FROM animal_types WHERE animal_types.name = '{v}';\n"
        file.write(sql)

file.close()
