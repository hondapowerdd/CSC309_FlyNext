echo "Starting server..."

set -e

npx prisma studio & npm run dev

echo "Server started!"