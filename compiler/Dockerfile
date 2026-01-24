FROM node:18-bullseye

ENV DEBIAN_FRONTEND=noninteractive

# Install native build tools and common runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    openjdk-11-jdk \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Use root for builds to avoid host filesystem permission issues on Windows
RUN mkdir -p /work
WORKDIR /work

# No ENTRYPOINT so `docker compose` `command` executes directly
