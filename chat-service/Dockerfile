FROM node:18

# Set working directory di dalam container
WORKDIR /app

# Salin package.json dan lockfile milik chat-service SAJA
COPY package*.json ./

# Install dependencies (hanya dari chat-service)
RUN npm install

# Salin seluruh isi folder chat-service
COPY . .

# Build NestJS
RUN npm run build

# Jalankan aplikasi production
CMD ["npm", "run", "start:prod"]