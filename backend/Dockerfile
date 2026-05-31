# -------------------------------------------------------------------
# Stage 1: Build & Dependencies
# -------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required for some native node modules if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies in case of a build step)
RUN npm ci

# Copy the rest of the application code
COPY . .

# -------------------------------------------------------------------
# Stage 2: Production runtime
# -------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Set Node environment to production for optimizations
ENV NODE_ENV=production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Create the uploads directory for temporary storage
RUN mkdir -p src/uploads && chown -R node:node src/uploads

# Expose the port Cloud Run will dynamically provide via the PORT env variable
EXPOSE 5005

# Use the non-root user provided by the Node Alpine image for security
USER node

# Start the application
CMD ["npm", "start"]
