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

* Run search_entries index backfill script for OpenSearch integration:

  ```
  cd server/src/bootstrap && npx ts-node search-backfill-trigger.ts
  ```

* To verify that the search_entries index has been successfully built, run `curl -HEAD 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'`

* Optional: Use Dbeaver to connect to the local MySQL server at `127.0.0.1:3306`, using the username and password in `.env`

* Check that your Database ER Diagram looks like this:
  
![image](https://user-images.githubusercontent.com/56983748/144220333-29ce7c06-09dc-4f0c-85cb-899920bf6518.png)


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
  
  Backend server accessible on `localhost:6174/api/v1`
  
  Local mail server `MailDev` accessible on `localhost:1080`

* Default home page is not authorised. To become authorised user, login via `localhost:3000/login`, enter `enquiries@was.gov.sg`. Then go to the mail server to obtain the OTP

* To view UI components on storybook (accessible on `localhost:6006`): `npm run storybook`

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

### OpenSearch Related

- If you need to delete search_entries index, run `curl -XDELETE 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'`

### SQLite-related error during npm i

```bash
npm ERR! command failed
npm ERR! command sh -c node-pre-gyp install --fallback-to-build
npm ERR! CC(target) Release/obj.target/nothing/../node-addon-api/nothing.o
npm ERR!   LIBTOOL-STATIC Release/nothing.a
npm ERR!   ACTION deps_sqlite3_gyp_action_before_build_target_unpack_sqlite_dep Release/obj/gen/sqlite-autoconf-3340000/sqlite3.c
npm ERR! Failed to execute 
```

- SQLite error during `npm i`. Since macOS 12.3, python2 is not supported anymore but the bundled sqlite3 tar file contains calls to a hardcoded `python` command. Simplest fix is to run: `npm config set python python3`.

## API Endpoints

#### Base Url - `http://localhost:6174/api/v1`

#### Agencies
- `GET /agencies?<longname, shortname>`
- `GET /agencies/:agencyId`

#### Auth
- `GET /auth`
- `POST /auth/verifyotp`
- `POST /auth/sendotp`
- `POST /auth/logout`

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
