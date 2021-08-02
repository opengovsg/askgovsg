FROM node:12-alpine3.12

# Bundle app source
COPY . /app

# Create app directory
WORKDIR /app

# Install backend dependencies
RUN cd server && npm ci && cd ..
# Install frontend dependencies
RUN cd client && npm ci && cd ..

# Build both front and back end
RUN npm run build

# This is the port specified in dockerrun.aws.json and configured in $PORT
EXPOSE 3000

CMD [ "npm", "start" ]