# 🖥️ RentByte — Laptop Rental Website

A full-stack laptop rental marketplace where customers browse laptops, complete KYC verification, rent devices, pay with Razorpay, and manage returns — while administrators control inventory, users, KYC approvals, rentals, payments, and reviews.

Built with **React + Vite** (frontend), **Node.js + Express + MongoDB** (backend), containerized with **Docker**, deployed to **AWS EKS** provisioned by **Terraform**, and continuously synced with **ArgoCD** via a **GitHub Actions** CI pipeline.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Database Seeding](#-database-seeding)
- [Docker Compose](#-docker-compose)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Terraform · AWS EKS · ArgoCD](#-terraform--aws-eks--argocd)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [API Reference](#-api-reference)
- [Frontend Routes](#-frontend-routes)
- [Security Notes](#-security-notes)
- [Troubleshooting](#-troubleshooting)
- [Contributors](#-contributors)

---

## ✨ Features

### Customer

- Browse the laptop catalog with category/spec/tag filters and availability checks
- View detailed laptop pages, pricing (per day/week/month) and security deposit
- Register, log in, and manage a profile (JWT authentication, bcrypt password hashing)
- Upload KYC documents — rentals and payments are blocked (`403`) until an admin approves KYC
- Rent laptops for a date range with pickup delivery
- Pay securely through **Razorpay** (order creation → checkout → HMAC signature verification)
- View booking history, cancel rentals, and see payment history
- Submit, edit, and delete reviews for rented laptops
- Forgot / reset password flow via emailed, expiring (30 min) reset tokens

### Administrator (`/admin`)

- Dashboard with aggregated stats (laptops, rentals, payments)
- Manage laptop inventory (CRUD with image upload)
- Approve or reject KYC submissions
- Process returns with automatic **late fees (₹500/day)**
- View all users, rentals, payments, and reviews
- Process refunds for rentals

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                              |
| ------------ | --------------------------------------------------------------------------------------- |
| Frontend     | React 19, Vite 8, React Router 7, Axios, Lucide/React Icons                             |
| Backend      | Node.js 22, Express 5 (ESM), Mongoose 9, Zod validation                                 |
| Database     | MongoDB (local or Atlas)                                                                |
| Payments     | Razorpay (Orders API + server-side signature verification)                              |
| Email        | Nodemailer (Gmail SMTP)                                                                 |
| File uploads | Multer → `backend/uploads/{kyc,laptop}`                                                 |
| Web server   | Nginx (SPA serving + `/api` & `/uploads` reverse proxy)                                 |
| Containers   | Docker, Docker Compose                                                                  |
| CI           | GitHub Actions (path-filtered jobs) + Trivy vulnerability scanning + Docker Hub publish |
| IaC          | Terraform (AWS VPC + EKS modules, Helm ArgoCD)                                          |
| GitOps       | ArgoCD (auto-sync of `manifest/` to the cluster)                                        |

---

## 🏗️ Architecture

```
                        ┌────────────────────────────────────────────┐
 Browser ──────────────▶│  Nginx (frontend container, :80/:3000)     │
                        │  • serves the React SPA                    │
                        │  • proxies /api      ────────┐             │
                        │  • proxies /uploads  ──┐     │             │
                        └────────────────────────│─────│─────────────┘
                                                 │     ▼
                                                 │  ┌──────────────────────────┐
                                                 └─▶│  Express API (backend)   │
                                                    │  :8000  /api/*  /health  │
                                                    └───────┬──────────┬───────┘
                                              MongoDB ◀──────┘          │──────▶ Razorpay API
                                              (Atlas/local)             │──────▶ SMTP (password reset)
                                                     ▲                  │
                                                     │    uploads/ (Multer, volume-mounted)
```

- The frontend container is built in two stages (Vite build → Nginx runtime) and proxies API calls itself, so **no CORS configuration is needed** in the containerized setup.
- In local development the Vite dev server runs on `:5173` and talks to the API directly on `:8000` (CORS applies).

---

## 📁 Project Structure

```text
laptop_rental_website/
├── backend/                    # Express API
│   ├── backup-database/        # Sample seed data (users.json, laptops.json)
│   ├── config/db.js            # Mongoose connection
│   ├── controllers/            # user, laptop, rental, payment, review
│   ├── middleware/             # auth (JWT), admin gate, uploads, Zod validate, errors
│   ├── models/                 # User, Laptop, Rental, Payment, Review, PasswordResetToken
│   ├── routes/                 # /api/users, /laptops, /rentals, /payments, /reviews
│   ├── uploads/                # Persisted KYC + laptop images (bind-mounted)
│   ├── utils/sendEmail.js      # Password-reset emails (Nodemailer)
│   ├── validators/             # Zod schemas
│   ├── Dockerfile
│   └── server.js               # Entry point + /health
├── frontend/                   # React SPA
│   ├── nginx.conf              # SPA fallback + /api, /uploads proxy
│   ├── src/
│   │   ├── api/axios.js        # Axios instance (token interceptor, 401 → /login)
│   │   ├── components/         # Navbar, HeroBanner, LaptopCard, forms, admin, kyc
│   │   └── pages/              # auth, rental, user, admin, Home
│   └── Dockerfile              # multi-stage: Vite build → Nginx
├── manifest/                   # Kubernetes Deployments/Services + ArgoCD Application
├── terraform/                  # AWS provider, VPC, EKS, ArgoCD (Helm), outputs
├── .github/workflows/ci.yml    # CI: build → Trivy scan → push to Docker Hub
├── docker-compose.yaml         # Local two-container deployment
├── API.md                      # Detailed API endpoint reference
├── Admin-Credentials.md        # Default admin login for the seeded database
├── HELP.md                     # Database import guide (MongoDB Compass)
└── README.md
```

---

## ✅ Prerequisites

For **local development**:

- **Node.js 22+** and npm
- **MongoDB** — local instance or MongoDB Atlas
- **Razorpay** account with test/live API keys
- **SMTP credentials** (Gmail app password) if password-reset emails are needed
- **Docker + Docker Compose** for containerized runs
- **Terraform ≥ 1.x**, **AWS CLI**, **kubectl**, **Helm** for the cloud deployment

---

## 🔐 Environment Variables

Never commit real credentials. Example files: [`backend/env-example`](./backend/env-example) and [`frontend/env-example`](./frontend/env-example). Root `.env` files are git-ignored.

### Backend — `backend/.env`

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/Laptop-Rental
PORT=8000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
EMAIL_USER=your-smtp-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONT_END_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

| Variable                                  | Required            | Description                                                                            |
| ----------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `MONGO_URI`                               | ✅                  | MongoDB connection string.                                                             |
| `PORT`                                    | —                   | API port, defaults to `8000`.                                                          |
| `JWT_SECRET`                              | ✅                  | Secret used to sign auth tokens.                                                       |
| `JWT_EXPIRES_IN`                          | ✅                  | Token lifetime, e.g. `7d`, `24h`.                                                      |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ✅ for payments     | Razorpay API credentials.                                                              |
| `EMAIL_USER` / `EMAIL_PASS`               | for password reset  | SMTP username and password/app-password.                                               |
| `FRONT_END_URL`                           | ✅ in deployed envs | Allowed browser origin for **CORS** (falls back to `http://localhost:5173`).           |
| `FRONTEND_URL`                            | for password reset  | Public URL used to build reset-password links (falls back to `http://localhost:3000`). |

> ⚠️ The code uses **two different variable names**: `FRONT_END_URL` for CORS and `FRONTEND_URL` for reset links. Set **both** to the same public frontend URL.

### Frontend — `frontend/.env`

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

`VITE_BACKEND_URL` is the backend origin **without** `/api` — the Axios instance appends `/api` itself. Leave it empty in the containerized build: Nginx proxies `/api` and `/uploads` to `backend-service:8000`.

---

## 💻 Local Development

### 1. Start MongoDB

```bash
mongod --dbpath <your-data-directory>
# or use MongoDB Atlas and set MONGO_URI accordingly
```

Optional: import the sample data — see [HELP.md](./HELP.md) (MongoDB Compass or `mongoimport` for `backend/backup-database/*.json`).

### 2. Start the backend

```bash
cd backend
npm install
cp env-example .env       # then fill in the values
npm run dev               # nodemon
```

- API: `http://localhost:8000`
- Health check: `http://localhost:8000/health` → `{"status":"ok","service":"backend"}`

### 3. Start the frontend

```bash
cd frontend
npm install
cp env-example .env       # VITE_BACKEND_URL=http://localhost:8000
npm run dev
```

Open **http://localhost:5173**.

### Useful scripts

```bash
cd backend  && npm start        # production start (node server.js)
cd frontend && npm run lint     # ESLint
cd frontend && npm run build    # production build → dist/
cd frontend && npm run preview  # preview the production build
```

---

## 🗄️ Database Seeding

Sample data lives in [`backend/backup-database/`](./backend/backup-database):

| File           | Collection | Format                                                 |
| -------------- | ---------- | ------------------------------------------------------ |
| `users.json`   | `users`    | Single pretty-printed JSON document (the seeded admin) |
| `laptops.json` | `laptops`  | 20 newline-delimited JSON documents                    |

Easiest path: **MongoDB Compass** → connect to `mongodb://localhost:27017` → create database `Laptop-Rental` → for each collection use _Add Data → Import File_ (format **JSON**). See [HELP.md](./HELP.md) for a step-by-step guide.

CLI alternative (`mongoimport` reads line-delimited JSON by default):

```bash
# laptops.json is one document per line
mongoimport --uri="mongodb://127.0.0.1:27017/Laptop-Rental" \
  --collection laptops --file backend/backup-database/laptops.json

# users.json is a single pretty-printed object — flatten it to one line first
tr -d '\n' < backend/backup-database/users.json | \
  mongoimport --uri="mongodb://127.0.0.1:27017/Laptop-Rental" --collection users
```

> The files contain MongoDB Extended JSON (`$oid` dates/IDs), so importing them into the **same** database preserves the original document IDs.

Default admin login (from the seeded data): see [`Admin-Credentials.md`](./Admin-Credentials.md).

---

## 🐳 Docker Compose

The [docker-compose.yaml](./docker-compose.yaml) builds and runs both images. **MongoDB is not part of the compose file** — provide a reachable instance (Atlas or a host/network MongoDB).

Create a root `.env` beside `docker-compose.yaml`:

```dotenv
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
PORT=8000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
FRONT_END_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend-service
```

- App: **http://localhost:3000** (frontend Nginx → `backend-service:8000`)
- The backend has a health check on `/health`; the frontend starts only after it is healthy.
- Uploads persist to `./backend/uploads` via a bind mount.

```bash
docker compose down
```

---

## ⚙️ CI/CD Pipeline

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on pushes and PRs to `main` / `develop` that touch `backend/**` or `frontend/**`:

1. **Change detection** — `dorny/paths-filter` decides which jobs run.
2. **Backend job** — `npm ci` → Docker build → **Trivy scan** (fails on `CRITICAL`/`HIGH`, unfixed ignored) → on `push`, tag & push ` <dockerhub-user>/laptop-rental:backend` and `:backend-<sha>`.
3. **Frontend job** — `npm ci` → `npm run build` → Docker build → **Trivy scan** → on `push`, push `:frontend` and `:frontend-<sha>`.

Required repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, and optionally `VITE_RAZORPAY_KEY`.

Suppressed CVEs are listed in [`.trivyignore`](./.trivyignore).

---

## ☸️ Terraform · AWS EKS · ArgoCD

The [`terraform/`](./terraform) directory provisions the cloud infrastructure in **`ap-south-1`**:

| File          | Purpose                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| `provider.tf` | AWS + Helm + Kubernetes providers, region, CIDRs, tags                           |
| `vpc.tf`      | VPC module (public/private/intra subnets, NAT, ELB subnet tags)                  |
| `eks.tf`      | EKS module (K8s `1.35`, managed node group: 2–3 × `t3.medium` SPOT, core addons) |
| `argocd.tf`   | ArgoCD installed via the `argo-cd` Helm chart + reads the initial admin secret   |
| `output.tf`   | ArgoCD admin username/password (sensitive) and URL                               |

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Retrieve ArgoCD credentials:

```bash
terraform output -raw argocd_admin_password
```

The ArgoCD Application in [`manifest/argocd.yaml`](./manifest/argocd.yaml) watches this repository's `manifest/` directory on `main` and syncs it into the `laptop-rental-website` namespace with **automated prune + self-heal** and `CreateNamespace=true`.

---

## ☸️ Kubernetes Deployment

The manifests in [`manifest/`](./manifest) create:

- `laptop-rental-deployment-backend` + internal `backend-service` (ClusterIP `8000`)
- `laptop-rental-deployment-frontend` + `frontend-service` (LoadBalancer `3000` → `80`)
- Nginx frontend proxies `/api` and `/uploads` to `backend-service`

Images referenced: `kirankumark17/laptop-rental:backend` and `kirankumark17/laptop-rental:frontend`. Build and push your own if needed:

```bash
docker build -t <registry>/laptop-rental:backend ./backend
docker build -t <registry>/laptop-rental:frontend ./frontend
docker push <registry>/laptop-rental:backend
docker push <registry>/laptop-rental:frontend
```

### Create the backend Secret

The backend Deployment reads all configuration from a Secret named **`env-secret`**:

```bash
kubectl create secret generic env-secret \
  --namespace laptop-rental-website \
  --from-literal=MONGO_URI='mongodb+srv://<user>:<password>@<cluster>/<database>' \
  --from-literal=PORT='8000' \
  --from-literal=JWT_SECRET='replace-with-a-long-random-secret' \
  --from-literal=JWT_EXPIRES_IN='7d' \
  --from-literal=RAZORPAY_KEY_ID='your-razorpay-key-id' \
  --from-literal=RAZORPAY_KEY_SECRET='your-razorpay-key-secret' \
  --from-literal=FRONT_END_URL='https://your-public-frontend' \
  --from-literal=FRONTEND_URL='https://your-public-frontend'
```

> Avoid committing this command with real values or leaving it in shell history.

### Deploy manually (or let ArgoCD sync)

```bash
kubectl apply -f manifest/laptop_rental-backend.yaml
kubectl apply -f manifest/laptop_rental-frontend.yaml

kubectl get deployments,pods,services
kubectl rollout status deployment/laptop-rental-deployment-backend
kubectl rollout status deployment/laptop-rental-deployment-frontend
```

Port-forward for local verification:

```bash
kubectl port-forward service/frontend-service 3000:3000
# open http://localhost:3000
```

> **Persistent storage:** the supplied manifests do **not** define a PVC for `backend/uploads`. Add a PersistentVolumeClaim and mount it before using Kubernetes in production, otherwise uploaded KYC/laptop files are lost when a pod is recreated.

---

## 🌐 API Reference

Full endpoint tables (with access levels) are in **[API.md](./API.md)**. All routes are prefixed with `/api`; authentication uses `Authorization: Bearer <token>`.

| Area     | Endpoints                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users    | `POST /users/register`, `POST /users/login`, `GET/PATCH /users/profile`, `POST /users/upload-kyc`, `POST /users/forgot-password`, `POST /users/reset-password` |
| Laptops  | `GET /laptops`, `GET /laptops/:id`, `GET /laptops/availability/:id`, admin `POST/PUT/DELETE /laptops`                                                          |
| Rentals  | `GET/POST /rentals`, `GET /rentals/:id`, `DELETE /rentals/:id` (cancel), admin `GET /rentals/admin`, `PUT /rentals/:id` (return)                               |
| Payments | `POST /payments/create-order`, `POST /payments/verify`, `GET /payments/my-history`, admin `GET /payments/all`, `POST /payments/refund/:rentalId`               |
| Reviews  | `POST /reviews`, `GET /reviews/my-reviews`, `GET /reviews/laptop/:laptopId`, `PUT /reviews/:id`, admin `DELETE /reviews/:id`, `GET /reviews/all`               |
| Health   | `GET /health` (not under `/api`)                                                                                                                               |

---

## 🧭 Frontend Routes

| Route                                                      | Access   | Description                                                |
| ---------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `/`                                                        | Public   | Home — hero banner + laptop catalog                        |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public   | Authentication flows                                       |
| `/laptops`, `/laptops/details/:id`                         | Public   | Catalog and laptop details                                 |
| `/profile`, `/upload-kyc`, `/my-bookings`                  | Customer | Profile, KYC upload, booking history                       |
| `/checkout`, `/rental-success/:id`                         | Customer | Razorpay checkout and confirmation                         |
| `/admin/*`                                                 | Admin    | Dashboard, KYC, Laptops, Payments, Rentals, Reviews, Users |

---

## 🔒 Security Notes

- Keep `.env` files, API keys, JWT secrets, SMTP passwords, and Kubernetes Secrets out of Git (root `.env` and `*.tfstate` are already ignored).
- Use separate Razorpay **test** and **live** keys; payment signatures are verified server-side with HMAC-SHA256.
- Serve frontend and backend over **HTTPS** in production.
- Restrict MongoDB network access to trusted application hosts.
- Add persistent, backed-up storage for uploaded KYC documents (they contain identity documents).
- Trivy image scans gate the CI pipeline on `CRITICAL`/`HIGH` vulnerabilities.
- Password-reset tokens expire after 30 minutes (MongoDB TTL index).

---

## 🧯 Troubleshooting

| Symptom                                 | Fix                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Backend unhealthy in Compose            | Verify `MONGO_URI` is reachable from the container; check `docker compose logs backend-service`. |
| CORS errors in local dev                | Set `FRONT_END_URL` in `backend/.env` to `http://localhost:5173`.                                |
| Reset emails not sent                   | Set `EMAIL_USER`/`EMAIL_PASS` (Gmail app password) and `FRONTEND_URL`.                           |
| Checkout fails immediately              | Confirm `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set and the Razorpay order is created.       |
| `403` when renting/paying               | The user's KYC is not approved — upload a document and wait for admin approval.                  |
| Frontend shows empty data in containers | Leave `VITE_BACKEND_URL` unset in the Docker build so requests go through the Nginx proxy.       |
| Pod restarts lose uploads               | Add a PVC for `backend/uploads` (see Kubernetes section).                                        |

---

## 📄 License

This project is released under the license specified by the repository owner.
