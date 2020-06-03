import re

common_words_str = 'cap, casă, barză, adevăr, albină, cer, inimă, varză, câine, floare, frate, buză, sâmbure, viezure, strămoș, copil, frumusețe, student, tigru, harnic, obosit, bolnav, semănat, aproapele, binele, leneș, oful, articol, bec, secol, blând, iepuraș, străbun, școală, covor, toamnă, carte, masaj, scaun, birou, doctor, halva, vreme, luncă, muncă, oraș, marfă, hotar, gând, sobă, cearșaf, basma, cioban, dascăl, hârtie, tipar, piper, ban, crap, grădină, ciocan, cartof, halbă, stofă, algebră, fotograf, epidemie, balon, diviziune, acum, aer, ajutor, ani, apă, barcă, aur, băiat, fată, bine, cald, cuib, cutie, deal, stânga, dreapta, emoții, etaj, exemplu, familie, femeie, fereastră, iarbă, imagine, lapte, lemn, linie, lume, luni, mai, mamă, lună, tată, mână, masă, mare, mere, mic, minge, minute, nevoie, noapte, ochi, om, orice, pâine, pantofi, păpușă, pană, părinți, pasăre, pat, persoană, pește, pisică, pom, porc, punct, răspuns, rață, repede, scrie, semințe, soare, soră, frate, înainte, înapoi, stradă, țară, târziu, teren, timp, toate, ușă, veveriță, viață, vin, zi'

file = open('06-insert-common-words-data.sql', 'w')

for word in sorted(list(filter(lambda e: len(e) > 0, re.split(' |,', common_words_str)))):
    file.write(f'INSERT INTO common_words (word) VALUES (\'{word}\');\n')

file.close()
