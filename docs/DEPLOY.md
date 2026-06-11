# 🚀 RestaurantOS Deployment Guide

## Option A: Vercel (Frontend) + Render (Backend + DB)

### 1. Deploy PostgreSQL on Render
- Go to render.com → New → PostgreSQL
- Copy the **External Database URL**
- Run schema: `psql "your-render-db-url" -f database/schema.sql`
- Run seed:   `psql "your-render-db-url" -f database/seed.sql`

### 2. Deploy Backend on Render
- New → Web Service → Connect your GitHub repo
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables:
  ```
  PORT=10000
  NODE_ENV=production
  DATABASE_URL=<render-postgresql-url>
  JWT_SECRET=<generate-random-256-bit>
  ADMIN_JWT_SECRET=<generate-random-256-bit>
  CLIENT_URL=https://your-app.vercel.app
  ```

### 3. Deploy Frontend on Vercel
- Import GitHub repo on vercel.com
- Root Directory: `client`
- Framework Preset: Vite
- Add environment variable:
  ```
  VITE_API_URL=https://your-backend.onrender.com
  ```
- In `client/src/services/api.js`, update baseURL:
  ```js
  baseURL: import.meta.env.VITE_API_URL + '/api'
  ```

---

## Option B: Netlify (Frontend) + Railway (Backend + DB)

### 1. Deploy on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway add postgresql
railway up  # from server/ directory
```

### 2. Deploy Frontend on Netlify
```bash
npm install -g netlify-cli
cd client && npm run build
netlify deploy --prod --dir=dist
```
Add `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Option C: Self-hosted with Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: restaurantdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    ports:
      - "5432:5432"

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_NAME: restaurantdb
      DB_USER: postgres
      DB_PASSWORD: secret
      JWT_SECRET: your-secret
      ADMIN_JWT_SECRET: your-admin-secret
      CLIENT_URL: http://localhost:5173
    depends_on:
      - db
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build: ./client
    ports:
      - "5173:80"
    depends_on:
      - server

volumes:
  pgdata:
```

```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads logs
EXPOSE 5000
CMD ["node", "server.js"]
```

```dockerfile
# client/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Run with:
```bash
docker-compose up --build -d
```

---

## 🔒 Production Checklist

- [ ] Change all default passwords and JWT secrets
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with actual frontend URL
- [ ] Enable PostgreSQL SSL in db.js
- [ ] Set up log rotation for Winston logs
- [ ] Configure Razorpay/Stripe live keys
- [ ] Add image CDN (Cloudinary) for uploads
- [ ] Set up database backups
- [ ] Add monitoring (Sentry, Datadog)
