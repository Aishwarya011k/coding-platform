FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install compilers / runtimes and core utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    openjdk-11-jdk \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    coreutils \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user and workdir
RUN useradd -m -u 1000 runner && mkdir -p /work && chown -R runner:runner /work

USER runner
WORKDIR /work

# Default entrypoint: allow running arbitrary shell commands from `docker run`
ENTRYPOINT ["/bin/sh", "-c"] 