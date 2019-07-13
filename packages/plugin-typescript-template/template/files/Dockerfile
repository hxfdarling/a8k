FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY package-lock.json ./

# If you are building your code for production
RUN npm install --production

# Bundle app source
COPY ./lib ./lib

EXPOSE 8080
# start app
CMD [ "npm", "start" ]
