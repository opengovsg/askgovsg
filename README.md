# AskGov

[![Version](https://img.shields.io/static/v1?label=version&message=2.0.0&color=blue)](https://shields.io/)
[![NPM](https://img.shields.io/static/v1?label=npm&message=6.8.5&color=blue)](https://shields.io/)
[![NODE](https://img.shields.io/static/v1?label=node&message=12.18.0&color=success)](https://shields.io/)
[![MYSQL](https://img.shields.io/static/v1?label=mysql&message=8.0.10&color=blueviolet)](https://shields.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://shields.io/)

## Tech Stack

#### Front-end

- Front-end Framework: `React`, switching to `react-query`
- Styling: `SASS` and `BOOTSTRAP`, switching to [Chakra UI](https://chakra-ui.com/)

#### Back-end

- For handling server requests: `Node.js with Express.js Framework`
- Database: `MySQL`
  
## Prerequisites
[Node, NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

[Git](https://git-scm.com/download/mac)

Optionally [VSCode](https://code.visualstudio.com/) with extension `ESLint`

## Setup

* Create a `.env` file with the same format as `.env.example` and fill it in:

  For development:
  ```
  DB_HOST=localhost
  DB_NAME=stack_overflow_v2 
  DB_USER=root
  DB_PASSWORD=*create your own pw here*
  SERVER_PORT=5000
  NODE_ENV=development
  JWT_SECRET=mysecrettoken

  MAIL_PORT=1025
  MAIL_FROM=admin@help.gov.sg
  MAIL_HOST=127.0.0.1
  ```

* Install and audit node dependencies

  ```
  $ npm install (To install all the dependencies)

  $ npm run auditDep (Run this to audit fix all the vulnerabilities)
  ```

* Install `direnv` [here](https://github.com/direnv/direnv/blob/master/docs/installation.md) and [hook](https://github.com/direnv/direnv/blob/master/docs/hook.md) it onto your appropriate shell. Load the environment variables:

  ```
  $ direnv allow .
  ```
* Download [MySQL](https://dev.mysql.com/downloads/mysql/)

  `MySQL` should appear at the bottom of _System Preferences_ upon successful installation

  In `MySQL`, click _Initialize Database_, enter the appropriate password for "root" user and select _Use Strong Password Encryption_
    
  Password should correspond to the one in the `.env` file

  Click _OK_ and _Start MySQL Server_

* Download a database GUI like [DBeaver](https://dbeaver.io/download/) and connect to the local MySQL server

  Create database by executing the script in `DBeaver`
  ```
  CREATE DATABASE stack_overflow_v2;
  USE stack_overflow_v2;
  SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
  ```
  Execute `$ npm run dev` to create the tables
  
  Execute the script in `seed.sql` using `DBeaver`

  Check that your Database ER Diagram looks like this:
  
  <img width="635" alt="Screenshot 2021-07-05 at 11 35 53 AM" src="https://user-images.githubusercontent.com/20250559/124414373-3258c780-dd85-11eb-9312-faf4bba096a8.png">

  
* Start running frontend, backend and local mail server simultaneously

  ```
  $ npm run dev
  ```

  Alternatively, to run individually:

  ```
  $ npm run server (for backend server only)

  $ npm run client (for frontend server only)
  ```
  
  Frontend server accessible on `localhost:3000`
  
  Backend server accessible on `localhost:5000/api/v1/agencies`
  
  Local mail server `MailDev` accessible on `localhost:1080`

* Default home page is not authorised. To become authorised user, login via `localhost:3000/login`, enter `answerer@parking.gov.sg`. Then go to the mail server to obtain the OTP


## Common Problems

### SQL Related
- Password Auth Error
  
  Ensure `.env` is correct and check it is sourced by either `direnv` or do
  ```
  source .env
  ```
- Public Key Retrieval Not Allowed

  Change `allowPublicKeyRetrieval=true` on `DBeaver`

- Client does not support authentication protocol requested by server; consider upgrading MySQL client

  Execute the following query in your database GUI

  ```
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
  ```

  Where root as your user, localhost as your URL and password as your password

  Then run this query to refresh privileges:

  ```
  flush privileges;
  ```

  Try connecting using node after you do so.

  If that doesn't work, try it without @'localhost' part.

## API Endpoints

#### Base Url - `http://localhost:5000/api`

#### Users

- `GET /auth`
- `POST /auth`
- `POST /users/:id`
- `GET /users/:id`

#### Posts

- `GET /posts`
- `GET /posts/top`
- `GET /posts/tag/:tagname`
- `GET /posts/:id`
- `POST /posts/`
- `DELETE /posts/:id`

#### Answers

- `GET /posts/answers/:id`
- `POST /posts/answers/:id`
- `DELETE /posts/answers/:id`

#### Tags

- `GET /tags`
- `GET /tags/:tag_name`
