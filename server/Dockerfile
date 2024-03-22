# Use the official Node.js image as base
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Arduino CLI and its dependencies
RUN apt-get update && apt-get install -y curl
RUN cd / && curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN arduino-cli upgrade && arduino-cli core update-index
RUN arduino-cli core install arduino:avr

# Copy all server files into the container
COPY . .

# Expose the port on which the WebSocket server runs
EXPOSE 8080

# Run server
CMD ["node", "index.js"]