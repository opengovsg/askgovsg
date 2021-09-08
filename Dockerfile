FROM node:12-alpine3.12
ARG REACT_APP_RECAPTCHA_SITE_KEY
ENV REACT_APP_RECAPTCHA_SITE_KEY=$REACT_APP_RECAPTCHA_SITE_KEY

# Bundle app source
COPY . /app

# Create app directory
WORKDIR /app

# Install shared dependencies
RUN cd shared && npm ci && cd ..
# Install backend dependencies
RUN cd server && npm ci && cd ..
# Install frontend dependencies
RUN cd client && npm ci && cd ..

# Build both front and back end
RUN npm run build

# This is the port specified in dockerrun.aws.json and configured in $PORT
EXPOSE 3000

CMD [ "npm", "start" ]