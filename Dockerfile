# Use the latest version of Ubuntu as the base image
FROM ubuntu:24.04

# Set environment variables to non-interactive (to avoid prompts during installation)
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, timezone, and dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    libfreetype-dev \
    git \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    tzdata \
    gnupg2 \
    lsb-release \
    ca-certificates && \
    # Set the timezone to Asia/Singapore
    ln -fs /usr/share/zoneinfo/Asia/Singapore /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

# Set the working directory
WORKDIR /app

# NODEJS
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*
# Verify that Node.js and npm were installed correctly
RUN node -v
RUN npm -v

# Update npm packages
RUN npm install -g npm@latest
RUN npm install -g nodemon
RUN npm install -g npm-check-updates

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Expose the port (optional for Node.js apps)
EXPOSE ${HOST_PORT}
