echo "Setting environment.."

set -e

npm install @prisma/client jsonwebtoken bcrypt dotenv
npm install -D prisma @types/jsonwebtoken @types/bcrypt

npx prisma migrate deploy
npx prisma generate

npx prisma migrate reset --force
npm run seed

echo "Environment setup completed!"