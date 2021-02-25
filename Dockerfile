#Docker for testing

FROM node:12

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3600

RUN sed -i "s/mongodb:\/\/localhost/mongodb:\/\/mongo/g" common/services/mongoose.service.js

#dont uncomment both at the same time

#comment the below line to disable test
CMD [ "npm", "test" ]

#comment the below line to disable production
#CMD ["npm", "start"]
