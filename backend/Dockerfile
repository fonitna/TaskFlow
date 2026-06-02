FROM node:20-alpine
# Prisma schema engine requires OpenSSL on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies (including devDeps for ts-node + prisma CLI)
COPY package*.json ./
RUN npm ci

# Copy all backend source
COPY . .

# Generate Prisma client for the target platform
RUN npx prisma generate

# Data volume: SQLite DB + seed flag
VOLUME ["/data"]

EXPOSE 4000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
