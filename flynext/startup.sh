echo "Setting environment.."

set -e

#npm install @prisma/client jsonwebtoken bcrypt dotenv
#npm install -D prisma @types/jsonwebtoken @types/bcrypt
npm install

npx prisma migrate deploy
npx prisma db push
npx prisma generate

npx prisma migrate dev --name init
npm run seed

echo "Environment setup completed!"