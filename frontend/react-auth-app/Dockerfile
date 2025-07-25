
# build stage
# Use a multi-stage build to keep the final image small
# First stage: build the React app
FROM node:20 AS builder
RUN mkdir /build
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
# Second stage: serve the built app with Nginx
# Use a lightweight Nginx image to serve the static files
FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
#fun fact: EXPOSE is not required for the container to run, but it is a good practice to document which ports are intended to be exposed (supposedly)
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
