FROM node AS BUILDER
WORKDIR /darshan
COPY package*.json /darshan/

RUN npm install --production
COPY . /darshan/

FROM node:alpine AS Final
WORKDIR /darshan
COPY --from=BUILDER /darshan /darshan/
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "npm", "run", "prod"]