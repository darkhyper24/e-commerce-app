# E-commerce App: Explore Products on the Fly!

## Getting Started

### Backend
To start the backend server:

```bash
node server.js
```

To start the frontend:
```bash
npm run start
```

Alterantively, the docker-compose file can be used for containerizing the entire app.


to use the container: 
```bash 
docker compose up --build 
```

Note: ```--build``` tag is used for building the container for the first time, for subsequent uses docker compose up can be used unless a new service is added to the docker-compose file or new configurations are made.

to stop a container:
```bash 
docker compose down 
```