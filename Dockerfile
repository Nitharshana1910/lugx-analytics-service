# Use an official Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose app port
EXPOSE 3003

# Run the app
CMD [ "node", "index.js" ]
