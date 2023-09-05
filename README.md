# What is it

Regista is a open source web scraper that retrieves football (soccer) data from the italian newspaper ["La Gazzetta"](https://www.gazzetta.it/) and wraps it up in a lightweight REST API.

# Disclaimer: use the API respectfully

Regista is a middleman between La Gazzetta's publicly available resources and the end user, meaning that you'll effectively be using La Gazzetta's resources while consuming this API.

We don't want to harm their platform and for this reason i ask you to use this API respectfully, limiting the fetches to the bare minimum your application needs.

That being said, this is a completely free and open source project and i'm by no means affiliated with La Gazzetta, i would have got fired by now if i was.

# Getting started

Clone the repository

`git clone https://github.com/Banteroni/regista-scraper.git`

cd into it

`cd regista-scraper`

Install dependencies

`npm install`

Set the environment variables required to run the app [here](#environment-variables)

Start the server

`npm start`

# Environment variables

The compatible databases are the following:

- sqlite
- mysql
- postgres
- mariadb

Make sure to set the `DB` variable to one of the above.
For any database but `sqlite` you'll have to also declare the following variables:

- `DB_HOST` - the host/URL to reach the database
- `DB_USER` -User's name of the database
- `DB_PASSWORD` - User's password of the database
- `DB_NAME` - the name of the database
- `DB_PORT` - (optional) the port of the database, defaults to 3306 for MySQL and MariaDB, 5432 for PostgreSQL

Other mandatory variables: 
 - `ROOT_PASSWORD` - The `root` user password

Completely optional variables:
 - `PORT` - the port on which the server will run, defaults to 3000
 - `NODE_ENV` - the environment in which the app is running, defaults to `prod`, however it can be used in `dev` to show query logs



# Endpoints

The documentation of the endpoints can be found [here](https://documenter.getpostman.com/view/26311595/2s9Y5VUjAF).

# Authentication

There currently is an authentication system in place, which is used to validate the requests to the API, it's not meant to be used in production, so make sure to implement your own authentication system.

# To do

- [x] CORS
- [x] .env PORT
- [x] store images locally to a public folder
- [x] add a /leagues endpoint
- [x] enable multiple databases compatibility, currently only sqlite is supported (MySQL, PostgreSQL, mariaDB)
- [x] Matchday info endpoint, which returns along with the result and timing, all the events that happened during the match (goals, cards, substitutions, etc)
- [x] Paging system for standard infos (teams, players and leagues)
- [x] add a /teams endpoint
- [x] add a /players endpoint
