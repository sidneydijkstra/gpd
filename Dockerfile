# Use the official Node.js image as the base image
FROM node:latest

# Setup server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Setup website
WORKDIR /app/website
COPY website/package*.json ./
RUN npm install
COPY website/ .

# Setup start script
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000 3001 8888

CMD ["./start.sh"]

# docker build -t gpd .
# docker run -it -d -p 3000:3000 -p 3001:3001 -p 8888:8888 gpd