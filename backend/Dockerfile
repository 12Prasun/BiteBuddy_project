# Multi-stage build for BiteBuddy Backend

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY backend ./backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Set environment
ENV NODE_ENV=production

# Run application
CMD ["npm", "start"]
