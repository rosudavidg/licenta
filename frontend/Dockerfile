# Imaginea de baza pentru nodeJS
FROM node:13.12.0-alpine

# Setarea directorului
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Instalarea dependintelor
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts -g --silent

# Copierea aplicatiei
COPY . ./

# Rularea serviciului
CMD ["npm", "start"]
