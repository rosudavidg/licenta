# Imaginea de baza pentru nodeJS
FROM node:13

# Setarea directorului
WORKDIR /usr/src/app

# Copierea fisierelor pentru dependinte
COPY package*.json ./

# Instalarea dependintelor
RUN npm install

# Copierea aplicatiei
COPY . .

# Expunerea portului pe care ruleaza aplicatia
EXPOSE 5000

# Rularea serviciului
CMD ["npm", "start"]
