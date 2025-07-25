FROM node:20 AS node-builder
RUN mkdir /build
WORKDIR /build
# Now package.json is in the same directory as Dockerfile
COPY package.json ./
RUN npm install
COPY src/ ./src/
COPY .env ./
COPY docker-entrypoint.sh ./

FROM alpine:3.19
RUN apk add --update nodejs bash
RUN addgroup -S node && adduser -S node -G node
USER node
RUN mkdir /home/node/code
WORKDIR /home/node/code
COPY --from=node-builder --chown=node:node /build .

# Make the entrypoint script executable - it's now in the working directory
USER root
RUN chmod +x docker-entrypoint.sh
USER node

EXPOSE 4000
CMD ["sh", "docker-entrypoint.sh"]