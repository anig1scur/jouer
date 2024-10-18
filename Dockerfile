# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.3.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

WORKDIR /app

# Set production environment
ENV NODE_ENV=development

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

# Copy necessary files for workspace installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./app/client/package.json ./app/client/
COPY ./app/common/package.json ./app/common/
COPY ./app/server/package.json ./app/server/

# Install dependencies for all workspaces
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm list

# Copy all application files
COPY . .

# Build application
RUN BUILD_MODE=production pnpm run build

# Prune development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Copy built application from the previous build stage
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "serve" ]
