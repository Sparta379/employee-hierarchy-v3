# technical notes
Dandre Vermaak

## the stack
- node.js & express for the backend
- react for the frontend (vite is way faster than cra)
- postgresql for the db
- sequelize to handle the models and queries

## why i did it this way
wanted a solid relational database because the hierarchy stuff can get messy with a flat file or a non-relational db. postgres makes sure the reporting lines (managerId) actually point to a real person. 

used MUI for the UI because it looks clean and professional without spending weeks on css. the "royal blue" theme is just to make it feel like a real corporate app.

## interesting bits
- **org chart:** used d3-hierarchy to calculate the tree positions. trackpad navigation (zoom/pan) was a bit of a pain but it works smooth now.
- **security:** passwords are hashed with bcrypt. using jwt for the session tokens.
- **gravatar:** just hash the email with md5 and point the avatar src to their api - way easier than handling image uploads on the server.
- **search:** you can search in the list or in the hierarchy view and it will jump to the person.
