# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Angular app for production
RUN npm run build

# Debug: List what was created
RUN ls -la /app/dist/

# Stage 2: Serve the application with nginx
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built application from the build stage (Angular 17+ uses browser/ subfolder)
COPY --from=build /app/dist/basketball-scoreboard/browser/ ./

# Debug: List what was copied
RUN ls -la /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 4000
EXPOSE 4000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]