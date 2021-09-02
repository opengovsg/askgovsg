# AskGov
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
  DB_NAME=askgov
  DB_USER=root
  DB_PASSWORD=*create your own pw here*
  SERVER_PORT=5000
  NODE_ENV=development
  JWT_SECRET=mysecrettoken

  REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
  RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
  
  FILE_BUCKET_NAME=files.ask.gov.sg
  AWS_ACCESS_KEY_ID=localstack
  AWS_SECRET_ACCESS_KEY=localstack

  MAIL_PORT=1025
  MAIL_FROM=admin@ask.gov.sg
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

* Spin up MySQL by running `docker-compose up`

* Execute `npm run seq-cli db:migrate` to create the tables
  
* Execute `npm run seq-cli db:seed:all` to seed the database with a sample dataset

* Download a database GUI like [DBeaver](https://dbeaver.io/download/) and connect to the local MySQL server at `127.0.0.1:3006`, using the username and password in `.env`

* Check that your Database ER Diagram looks like this:
  
![image](https://user-images.githubusercontent.com/20250559/130938844-60255d06-d07d-4c84-ad3f-0c13be7dcb67.png)


* Spin down MySQL by running `docker-compose down`

## Running in Development

* Start running frontend, backend, maildev, localstack and mysql simultaneously

  ```
  $ npm run dev
  ```

  Alternatively, to run individually:

  ```
  # for supporting services
  $ docker-compose up

  # for backend server only
  $ npm run server 

  # for frontend server only
  $ npm run client 
  ```
  
  Frontend server accessible on `localhost:3000`
  
  Backend server accessible on `localhost:5000/api/v1`
  
  Local mail server `MailDev` accessible on `localhost:1080`

* Default home page is not authorised. To become authorised user, login via `localhost:3000/login`, enter `enquiries@was.gov.sg`. Then go to the mail server to obtain the OTP


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

#### Base Url - `http://localhost:5000/api/v1`

#### Agencies
- `GET /agencies?<longname, shortname>`
- `GET /agencies/:agencyId`

#### Auth
- `GET /auth`
- `GET /auth/verifyotp`
- `GET /auth/sendotp`

#### Users

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
- `PUT /posts/answers/:id`
- `DELETE /posts/answers/:id`

#### Tags

- `GET /tags`
- `GET /tags/user`
- `GET /tags/agency/:agencyId`
- `GET /tags/:tagname`
