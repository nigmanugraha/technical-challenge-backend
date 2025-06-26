FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first (untuk cache build layer)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Replace or create .env with .env-cloud
COPY .env-cloud .env

# Build project (pastikan user-service kamu di direktori src/)
RUN npm run build

# Start app
CMD ["npm", "run", "start:prod"]