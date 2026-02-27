# internet-tehnologije-2025-github_activity_dashboard

# GitHub Activity Dashboard

Full-stack web aplikacija za analizu GitHub aktivnosti korisnika, sa implementiranim CI/CD pipeline-om, Docker podrškom i cloud deployment-om.

---

Backend (Cloud - Render):

https://internet-tehnologije-2025-github.onrender.com

Health check:

https://internet-tehnologije-2025-github.onrender.com/health

API dokumentacija (Swagger):

https://internet-tehnologije-2025-github.onrender.com/api-docs

---

# Arhitektura

Frontend (Next.js)
⬇  
Backend (Express + TypeScript)  
⬇  
PostgreSQL baza (Neon Cloud)

Aplikacija je deployovana na Render cloud platformi uz Docker podršku.

---

## Tehnologije

### Backend
- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL (Neon Cloud)
- JWT autentifikacija
- Swagger (OpenAPI dokumentacija)

### Frontend
- Next.js
- React
- TypeScript
- Google Charts

### DevOps
- Docker
- GitHub Actions (CI)
- Render (CD / Cloud deployment)

---

## Bezbednosne zaštite

Implementirane su sledeće sigurnosne mere:

- Helmet (HTTP sigurnosni headeri)
- Rate Limiting (zaštita od brute-force napada)
- CORS konfiguracija
- JWT autentifikacija
- Environment varijable (bez hardkodovanih tajni)

---

## CI/CD Pipeline

GitHub Actions automatski:

- Pokreće testove na svaki push
- Validira aplikaciju
- Gradi Docker image
- Deployuje aplikaciju na Render (Continuous Deployment)

---

## Docker

Aplikacija je dockerizovana.

Build:

```
docker build -t github-dashboard .
```

Run:

```
docker run -p 5000:5000 github-dashboard
```

---

## Lokalno pokretanje

### 1️ Kloniraj repo

```
git clone <repo-url>
cd internet-tehnologije-2025-github_activity_dashboard_2022_0401
```

### 2️ Instaliraj zavisnosti

```
npm install
```

### 3️ Kreiraj .env fajl

Primer:

```
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
JWT_SECRET=...
GITHUB_TOKEN=...
```

### 4️ Pokreni backend

```
npm run dev
```

---

## Funkcionalnosti

- Registracija i login korisnika
- JWT autentifikacija
- GitHub repository statistika (stars, forks, commits)
- Google Charts vizualizacija
- REST API sa Swagger dokumentacijom
- Cloud deployment

---

## Autori
- Mila Matić  
- Đorđe Vujačić
- Lazar Bajić
