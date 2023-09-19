# Usar una imagen base de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente al contenedor
COPY . .

# Exponer el puerto que usa tu aplicación
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
