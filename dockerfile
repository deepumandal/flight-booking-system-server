# ---- Build Stage ----
FROM node:22-alpine3.21 AS build

WORKDIR /app

# Install build dependencies required for bcrypt
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile 

COPY . .

RUN pnpm build

# ---- Production Stage ----
FROM node:22-alpine3.21

WORKDIR /app

COPY .env .env

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Optional cleanup (not needed if using Alpine cleanly)
RUN npm install -g pnpm && rm -rf /root/.npm

EXPOSE 7000

CMD ["node", "dist/main"]
