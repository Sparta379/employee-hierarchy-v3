# Employee App - EpiUse Assessment
Author: Dandre Vermaak

ok so this is my employee management app for the EpiUse Africa assessment. it handles the hierarchy and all the staff data they asked for. 

## what it does:
- shows everyone in a big table (the Registry)
- has an Org Chart that you can zoom and move around (used D3 for this)
- you can add new people or change their info (Enrollment)
- handles the reporting lines (who reports to who)
- pulling profile pics automatically from Gravatar
- export the whole list to CSV if you need it for excel

## how to get it running:
1. install the goods: `npm install`
2. setup the env files in the server folder (need a postgres db)
3. seed the data: `npm run seed`
4. start it up: `npm run dev`

## login for testing:
- admin@epiuseapp.com
- EpiUse123!

check the docs folder if you want to see the technical stuff or how to use the specific features.
