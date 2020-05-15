import re

common_words_str = 'cap, casa, barza, adevar, albina, cer, inima, varza, caine, floare, frate, buza, manz, sambure, viezure, stramos, copil, frumusete, student, tigru, harnic, obosit, bolnav, semanat, aproapele, binele, lenes, oful, articol, bec, secol, bland, iepuras, strabun, scoala, covor, toamna, carte, masa, scaun, birou, doctor, halva, harlet, plug, vreme, lunca, munca, oras, marfa, hotar, gand, soba, cearsaf, basma, cioban, dascal, hartie, tipar, piper, ban, crap, claca, gradina, ciocan, cartof, halba, stofa, algebra, fotograf, epidemie, balon, diviziune'

file = open('06-insert-common-words-data.sql', 'w')

for word in sorted(list(filter(lambda e: len(e) > 0, re.split(' |,', common_words_str)))):
    file.write(f'INSERT INTO common_words (word) VALUES (\'{word}\');\n')

file.close()
