# AskGov
Answers from the Singapore Government 

## Tech Stack

#### Front-end

- Front-end Framework: `React`
- Styling: `SASS` switching to [Chakra UI](https://chakra-ui.com/)

#### Back-end

- For handling server requests: `Node.js with Express.js Framework`
- Database: `MySQL`
  
## Prerequisites
[Node, NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

[Git](https://git-scm.com/download/mac)

[Docker](https://docs.docker.com/desktop/mac/install/)

[direnv](https://formulae.brew.sh/formula/direnv#default)

Optionally [VSCode](https://code.visualstudio.com/) with extension `ESLint`

Optionally [DBeaver](https://dbeaver.io/download/) to view database with GUI

## Setup

* Make a copy of `.env.example` and name it `.env`

* [Hook](https://github.com/direnv/direnv/blob/master/docs/hook.md) direnv onto your appropriate shell. Load the environment variables:

  ```
  direnv allow .
  ```

* Install and audit node dependencies

  ```
  npm install

  npm run audit-dep
  ```

* Spin up docker containers (this will create the `askgov` database):
  
  ```
  docker-compose up
  ```

* Create tables in database:

  ```
  npm run seq-cli db:migrate
  ```
  
* Seed the database with a sample dataset:

  ```
  npm run seq-cli db:seed:all
  ```

* Optional: Use Dbeaver to connect to the local MySQL server at `127.0.0.1:3306`, using the username and password in `.env`

* Check that your Database ER Diagram looks like this:
  
![image](https://user-images.githubusercontent.com/56983748/136875947-1ca6b005-a413-4e89-8eb8-d79761ca2c35.png)


* Stop docker compose (`npm run dev` will spin it up again):

 ```
 docker-compose stop
 ```

## Running in Development

* Start running frontend, backend, maildev, localstack and mysql simultaneously (requires Docker)

  ```
  npm run dev
  ```

  Alternatively, to run individually:

  ```
  # for supporting services
  docker-compose up

  # for backend server only
  npm run build-shared && npm run server

  # for frontend server only
  npm run client
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

### Node.js Related

- `Error: error:0308010C:digital envelope routines::unsupported`

  Try using Node.js 16.

## API Endpoints

#### Base Url - `http://localhost:5000/api/v1`

#### Agencies
- `GET /agencies?<longname, shortname>`
- `GET /agencies/:agencyId`

#### Auth
- `GET /auth`
- `GET /auth/verifyotp`
- `GET /auth/sendotp`
- `GET /auth/logout`

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
