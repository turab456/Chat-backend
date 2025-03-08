# LMS Backend

This project is a backend for a Learning Management System (LMS) built using Node.js, Express, Sequelize, and PostgreSQL. It includes various features such as authentication, rate limiting, logging, and more.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Models](#models)
- [Middlewares](#middlewares)
- [Utilities](#utilities)
- [Testing](#testing)

## Versions
1. use node version 22.13.0 to install the dependencies 

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Moiz-Maskan-Tech/lms_server.git
    cd lms-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Copy the sample environment file and update the variables:
    ```sh
    cp .env.sample .env
    ```

4. Update the [.env](http://_vscodecontentref_/0) file with your configuration.

## Configuration

- Update the database details in config.json and [.env](http://_vscodecontentref_/1) file.
- Ensure the following environment variables are set in your [.env](http://_vscodecontentref_/2) file:
    ```env
    PORT=7777
    MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-url>
    ORIGIN=*
    ACCESS_TOKEN_SECRET=<your-access-token-secret>
    ACCESS_TOKEN_EXPIRES=1d
    REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
    REFRESH_TOKEN_EXPIRES=10d
    JWT_SECRET=<your-jwt-secret>
    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=<your-redis-password>
    NODE_ENV=development
    LOG_LEVEL=info
    LOG_FILE=logs/app.log
    LOG_CONSOLE=true
    ```

## Scripts

- Run the development server:
    ```sh
    npm run dev
    ```

- Run tests:
    ```sh
    npm test
    ```

- Run tests in watch mode:
    ```sh
    npm run test:watch
    ```

- Run tests with coverage:
    ```sh
    npm run test:coverage
    ```

- Update snapshots:
    ```sh
    npm run test:update
    ```

- Run tests in CI mode:
    ```sh
    npm run test:ci
    ```

## Project Structure

```plaintext
.env
.env.sample
.gitignore
.prettierignore
.prettierrc
babel.config.js
coverage/
jest/
logs/
package.json
public/
Readme.md
src/
  app.js
  associations_model/
  constants.js
  controllers/
  db/
  index.js
  middlewares/
  models/
  routes/
  sum.js
  utils/
tests/
  sum.test.js


`` command to run the test cases example : npm test tests/super_admin/superAdmin.test.js

``while deploying the code on server set the updateCurrency on cronjob for 24 hours to update the currency value in the database 

or set the interval in nodejs 

setInterval(updateCurrencies, 24 * 60 * 60 * 1000); // Runs every 24 hours
updateCurrencies(); // Runs immediately on startup


Use a Cron Job (Linux/macOS)
Run:
crontab -e


Add this line to execute the script every 6 hours:
0 */6 * * * node /path-to-your-project/scripts/updateCurrencies.js