# Skyscanner Group trip

Coloring: 
- Dark blue HEX: #05203C
- White: HEX: #FFFFFF
- Light blue (for selected buttons): HEX: #0362E3
- Light blue 2 (for hovered buttons): HEX: #144679







# Pomodoro Group Trip

## Setup
```bash
# install root & client deps
npm install

# install server deps
cd server
npm install

# back to root
cd ..

# run first migration (SQLite dev.db)
npx prisma migrate dev --name init

# generate Prisma client
npx prisma generate

npx prisma studio

### Deploy on Vercel
To deploy the project on Vercel, run:
```sh
vercel --prod
```
*Note: You’ll need the Vercel CLI installed and an active Vercel account login.*
