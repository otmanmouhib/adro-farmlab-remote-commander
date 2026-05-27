# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

ARG MONGODB_URI
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_MQTT_BROKER_URL

ENV MONGODB_URI=${MONGODB_URI}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXT_PUBLIC_MQTT_BROKER_URL=${NEXT_PUBLIC_MQTT_BROKER_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "5000"]
