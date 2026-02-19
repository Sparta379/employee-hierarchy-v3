# technical notes: epi-use employee registry
Dandre Vermaak - February 2026

## the stack
- **frontend:** react (vite) for a fast, modern ui. used mui (material ui) for a professional corporate look without reinventing the wheel on css.
- **backend:** node.js with express.5. keep it simple and scalable.
- **database:** postgresql (hosted on neon). relational was the only way to go here because of the nested reporting lines.
- **orm:** sequelize. makes managing the employee model and associations (belongsTo/hasMany) much cleaner than raw sql.

## architecture & design patterns
i went with a standard **mvc-style (model-view-controller)** approach. 
- **models:** defined the employee schema with sequelize, including self-referencing associations for the manager-subordinate relationship.
- **routes/controllers:** separated auth, admin, and employee logic into different modules to keep the entry point clean.
- **middleware:** custom jwt auth middleware to protect routes and verify session permissions (admin vs hr vs employee).

## key features & technical hurdles
- **recursive hierarchy:** the biggest challenge was the "tree" logic. the backend uses a recursive function to build a nested json structure from flat database rows. the frontend then uses `d3-hierarchy` to calculate the x/y positions for the nodes.
- **multi-root handling:** to make the app "bulletproof," i added a virtual "global entity" root in the hierarchy view. this prevents the map from breaking if there are multiple people with no manager (like two co-ceos).
- **security:** passwords are never stored in plain text (hashed with bcryptjs). used jwt for stateless session management.
- **gravatar integration:** implemented a utility to md5-hash emails on the fly, fetching avatars directly from gravatar's api to save on server storage and complex upload logic.

## why this way?
i chose this stack because it's industry-standard. postgres ensures data integrity (you can't have a manager that doesn't exist), and react's component-based structure made the complex hierarchy view much easier to manage.
