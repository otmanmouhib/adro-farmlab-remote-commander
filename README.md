# adro-farmlab-remote-commander

Next.js App Router project for a secure Raspberry Pi IoT dashboard using MQTT over WebSocket and MongoDB Atlas authentication.

## Features
- Auth-protected dashboard with **NextAuth.js** and **MongoDB Atlas** adapter
- Browser MQTT client connected via `NEXT_PUBLIC_MQTT_BROKER_URL`
- Subscribes to:
  - `farmLab/+/+/heartbeat`
  - `farmLab/sensorStations/+/Log/SensorReadings`
  - `farmLab/pumpStations/+/ota_status`
  - `farmLab/pumpStations/+/control`
  - `farmLab/pumpStations/+/config`
- Secure sign-in + user registration
- Protected dashboard route at `/dashboard`
- Local state persisted in browser storage for newer device snapshots

## Environment Variables
Set these values in Vercel dashboard or local `.env.local`:

```env
MONGODB_URI=<your MongoDB Atlas connection string>
NEXTAUTH_SECRET=<random secret, e.g. openssl rand -hex 32>
NEXTAUTH_URL=https://<your-vercel-domain>
NEXT_PUBLIC_MQTT_BROKER_URL=ws://adro.ddns.net:9001
```

> If your app is served over HTTPS on Vercel, prefer `wss://adro.ddns.net:9001` to avoid mixed content issues.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open the app in the browser at `http://localhost:3000`.

## Deployment

- No Docker required for Vercel deployments.
- Deploy directly to Vercel with App Router.
- Configure environment variables in the Vercel project settings.

## Docker

This repo includes a Dockerfile configured to run the app on port `5000`.

When building the image, pass the required build-time environment variables so Next can compile server-side routes:

```bash
docker build \
  --build-arg MONGODB_URI="<your mongodb uri>" \
  --build-arg NEXTAUTH_URL="<your app url>" \
  --build-arg NEXTAUTH_SECRET="<your nextauth secret>" \
  --build-arg NEXT_PUBLIC_MQTT_BROKER_URL="ws://adro.ddns.net:9001" \
  -t adro-farmlab-remote-commander .
```

Then run it on port `5000`:

```bash
docker run -p 5000:5000 --env-file .env.local adro-farmlab-remote-commander
```

Open the app at `http://localhost:5000`.

If your server is remote, publish port `5000` and access it from the host address.

If you want the container to use a direct MQTT WS broker URL, keep `NEXT_PUBLIC_MQTT_BROKER_URL=ws://adro.ddns.net:9001` in your `.env.local` file.

## Notes
- The app uses the browser MQTT client directly with `mqtt.js`.
- Database connections use `MONGODB_URI` from environment variables.
- The dashboard is protected by NextAuth and only accessible after login.
