# Install dependencies and build Prisma client
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# new ----------
# 6. Copy environment variables
COPY .env .env

# Copy the Prisma schema
COPY prisma ./prisma

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the app source
COPY . .

# Build the Next.js app
RUN npm run build

# --- Final Production Image ---
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only required files for production
COPY --from=deps /app/public ./public
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/prisma ./prisma


# Expose the Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]


