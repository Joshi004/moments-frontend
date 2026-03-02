# ============================================================
# Video Moments — Frontend Dockerfile (Multi-stage)
#
# Stage 1 (build):   Node 20 Alpine — runs npm ci + npm run build
# Stage 2 (runtime): Nginx Alpine   — serves built static files
#                                     and proxies /api to backend
#
# Build command:
#   docker build -t moments-frontend moments-frontend/
#
# Build-time argument (overridable):
#   --build-arg REACT_APP_API_URL=/api    (default, use for Docker Compose)
#   --build-arg REACT_APP_API_URL=http://api.example.com/api  (external URL)
# ============================================================

# ---- Build stage: compile the React SPA ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first — layer is cached until these change.
COPY package.json package-lock.json ./

# npm ci — deterministic install from lockfile, no devDependency pruning
# (react-scripts needs devDependencies for the build step).
RUN npm ci

# Copy source code after dependency install for better cache utilisation.
COPY . .

# REACT_APP_API_URL is baked into the JavaScript bundle at build time.
# Default is /api (a relative path) so Nginx can proxy without CORS issues.
# Override with a full URL (e.g. https://api.example.com/api) for deployments
# where frontend and backend are on different origins.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ---- Runtime stage: Nginx serves static files + proxies /api ----
FROM nginx:alpine AS runtime

# Remove the default Nginx config and replace with ours.
RUN rm /etc/nginx/conf.d/default.conf

# Copy the React build output into the Nginx web root.
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx config (SPA routing + API reverse proxy).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
