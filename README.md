# Authentication Microservice

A robust and scalable authentication microservice built with NestJS, Fastify, PostgreSQL, Mikro-ORM, and Redis.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Code Formatting](#code-formatting)
- [Contributing](#contributing)
- [License](#license)

## Features

- OAuth2.0 authentication via Microsoft, Google, Facebook, GitHub.
- JWT-based session management.
- Role-based access control.
- Throttling based on Redis.
- Email services for account verification and password reset.

## Prerequisites

- Node.js >= 14.x
- Docker and Docker Compose
- Redis Server
- PostgreSQL Server

## Installation

First, clone the repository:

```bash
git clone https://github.com/your-username/authentication-microservice.git
```

Navigate into the directory:

```bash
cd authentication-microservice
```

Install the dependencies:

```bash
npm install
```

## Running the App

### Using Docker

To start all services:

```bash
docker-compose up --build
```

### Manually

First, start the Redis and PostgreSQL services. Then:

To run in development mode:

```bash
npm run start:dev
```

To run in production mode:

```bash
npm run build
npm run start:prod
```

## Environment Variables

Copy the `.env.example` file and rename it to `.env`. Update the variables to match your environment.

## Database Migrations

To create a new migration:

```bash
npm run migrate:create
```

To update the database schema:

```bash
npm run migrate:update
```

## Testing

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To see test coverage:

```bash
npm run test:cov
```

## Code Formatting

To format your code, run:

```bash
npm run format
```

To lint your code, run:

```bash
npm run lint
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.