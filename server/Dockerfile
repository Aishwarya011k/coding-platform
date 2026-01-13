FROM node:18-bullseye

WORKDIR /usr/src/app

# Install dependencies
# When building with context `./server`, copy package files from context root
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Install Java runtime and compiler
RUN apt-get update && apt-get install -y openjdk-17-jdk && rm -rf /var/lib/apt/lists/*

# Install Python, GCC, and G++ for C and C++ execution
RUN apt-get update && apt-get install -y python3 python3-pip gcc g++ && rm -rf /var/lib/apt/lists/*

EXPOSE 3001
CMD ["node", "server.js"]
