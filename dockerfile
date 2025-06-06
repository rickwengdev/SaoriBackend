# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 3000

# Run the web service on container startup.
CMD [ "node", "app.js" ]