FROM node:20-alpine

# Install build dependencies required for better-sqlite3 native build on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Directory for SQLite persistent database
RUN mkdir -p /app/data
ENV DATA_DIR=/app/data
ENV PORT=3000

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["npm", "start"]
