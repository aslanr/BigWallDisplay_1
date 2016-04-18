BIG WALL DISPLAY
================

This project is a concept demo for the layout of a user interface (Big Wall Screen) displaying vital signs and other information for a group of patients.

Basically, the _Big Wall Screen_ is the UI of a "nurse station". This project is meant to help visualizing the final result of such UI and thus help brainstorming and refining the UI itself and a technology stack meant to be used to gather patient data through [OpenICE](https://github.com/mdpnp/oracle-openice) and display such information in a meaningful way. [Click here](https://www.openice.info/diagnostics.html) for more information about the **OpenICE platform**.


Technology Stack
----------------

These technologies have been selected to help rapidly prototyping the UI and may have nothing to do with other technologies (databases, middleware, etc.) involved in other [MD PnP](http://mdpnp.org/) projects trying to implement this idea.

* Mongo 3.0.X as DB

* [Meteor](http://guide.meteor.com/)
 A reactive full-stack JavaScript platform 


To run
------ 

MONGO_URL=mongodb://localhost:27017/warfighter meteor

syntax is **MONGO_URL=mongodb://user:pass@host:port/dbname**. Host and port may change accorging to environment.

dbname: warfighter
collections
* patient_demographic: demographics of patients