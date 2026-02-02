FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Expose Vite default port
EXPOSE 5173

# Run in development mode
CMD ["npm", "run", "dev", "--", "--host"]
