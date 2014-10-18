Course Audit toy

##Prereqs

 - Install Node 0.11.13 (I recommend you use nvm)
 - Install RethinkDB

##Install it

 - `npm install -g webpack`
 - `npm install`

##Hack on it

In three different terminal sessions run:

 - `rethinkdb`
 - `webpack -w`
 - `npm start`

The 'audit' database will be created on first start up

##Browse it

The app:

- http://localhost:3000/

The resources:

- http://localhost:3000/students
- http://localhost:3000/courses
- http://localhost:3000/degrees
- http://localhost:3000/requirements

