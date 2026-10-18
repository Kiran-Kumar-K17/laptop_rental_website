# Laptop Rental Website

Laptop Rental is a full-stack rental marketplace for browsing laptops, completing KYC verification, renting available devices, making Razorpay payments, and managing returns. Administrators can manage inventory, users, KYC submissions, rentals, payments, and reviews.

## Features

- Laptop catalog with availability checks
- User registration, login, profile management, and password reset
- KYC document upload and administrator approval
- Rental creation, cancellation, return processing, and late-fee handling
- Razorpay order creation, payment verification, payment history, and refunds
- User and administrator review workflows
- Persistent uploads for KYC documents and laptop images
- Docker Compose and Kubernetes deployment manifests

## Technology

- **Frontend:** React 19, Vite, React Router, Axios
- **Backend:** Node.js, Express 5, Mongoose
- **Database:** MongoDB
- **Payments:** Razorpay
- **Production web server:** Nginx
- **Containers:** Docker and Docker Compose
- **Orchestration:** Kubernetes

## Prerequisites

For local development, install:

- Node.js 22 or later (the Docker images use Node 22)
- npm
- MongoDB, either locally or through MongoDB Atlas
- A Razorpay account and API keys
- An SMTP-enabled email account if password-reset emails are required

## Project Structure

```text
laptop_rental_website/
├── backend/                 # Express API and MongoDB models
│   ├── config/              # Database configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth, uploads, validation, and errors
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── uploads/             # Uploaded KYC and laptop files
│   └── server.js            # API entry point
├── frontend/                # React/Vite application
├── manifest/                # Kubernetes Deployment and Service manifests
├── docker-compose.yaml      # Containerized local/host deployment
└── README.md
```

## Environment Variables

Do not commit real credentials. The example files are [backend/env-example](./backend/env-example) and [frontend/env-example](./frontend/env-example).

### Backend

Create `backend/.env` for local development:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/Laptop-Rental
PORT=8000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
EMAIL_USER=your-smtp-email
EMAIL_PASS=your-smtp-password-or-app-password
FRONT_END_URL=http://localhost:5173
```

| Variable              | Required                      | Description                                |
| --------------------- | ----------------------------- | ------------------------------------------ |
| `MONGO_URI`           | Yes                           | MongoDB connection string.                 |
| `PORT`                | No                            | API port; defaults to `8000`.              |
| `JWT_SECRET`          | Yes                           | Secret used to sign authentication tokens. |
| `JWT_EXPIRES_IN`      | Yes                           | Token lifetime, for example `7d` or `24h`. |
| `RAZORPAY_KEY_ID`     | Yes for payments              | Razorpay public key ID.                    |
| `RAZORPAY_KEY_SECRET` | Yes for payments              | Razorpay private key.                      |
| `EMAIL_USER`          | Yes for password reset        | SMTP username/from address.                |
| `EMAIL_PASS`          | Yes for password reset        | SMTP password or provider app password.    |
| `FRONT_END_URL`       | Yes in deployed environments  | Allowed browser origin for CORS.           |
| `FRONTEND_URL`        | Yes for password reset emails | URL included in reset-password links.      |

The application currently uses `FRONT_END_URL` for CORS and `FRONTEND_URL` when constructing password-reset links. Set both to the same public frontend URL. In local development, the backend falls back to `http://localhost:5173` for CORS if `FRONT_END_URL` is omitted.

### Frontend

Create `frontend/.env` for local development:

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

`VITE_BACKEND_URL` is the backend origin without the `/api` suffix. The frontend adds `/api` itself. For the containerized deployment, leave this value empty when building the frontend image: Nginx proxies `/api` and `/uploads` to the `backend-service` container.

## Local Development

### Start the backend

```bash
cd backend
npm install
cp env-example .env
# Edit .env and set the required values.
npm run dev
```

The API is available at `http://localhost:8000`. A health check is available at `http://localhost:8000/health`.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm install
cp env-example .env
npm run dev
```

The Vite development server is normally available at `http://localhost:5173`.

For a production-style frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## Docker Compose

The [docker-compose.yaml](./docker-compose.yaml) builds the backend and frontend images. It does not run MongoDB, so provide a reachable MongoDB instance (MongoDB Atlas or a MongoDB server on the host/network).

Create a root `.env` file beside `docker-compose.yaml`:

```dotenv
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
PORT=8000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
EMAIL_USER=your-smtp-email
EMAIL_PASS=your-smtp-password-or-app-password
FRONT_END_URL=http://localhost:3000
```

Start the application:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend-service
```

Open `http://localhost:3000`. The frontend Nginx container proxies API requests to `backend-service:8000`. Uploaded files are persisted in the repository's `backend/uploads` directory through the Compose volume.

Stop the application:

```bash
docker compose down
```

If the backend does not become healthy, check that `MONGO_URI` is reachable from the container and inspect `docker compose logs backend-service`.

## Kubernetes

The manifests in [manifest/](./manifest) create:

- A backend Deployment and internal `backend-service` on port `8000`
- A frontend Deployment and internal `frontend-service` on port `3000` (target port `80`)
- An Nginx frontend that proxies `/api` and `/uploads` to `backend-service`

The manifests reference these published images:

```text
kirankumark17/laptop-rental:backend
kirankumark17/laptop-rental:frontend
```

Build and push equivalent images to a registry accessible by the cluster if those images are not already available:

```bash
docker build -t <registry>/laptop-rental:backend ./backend
docker build -t <registry>/laptop-rental:frontend ./frontend
docker push <registry>/laptop-rental:backend
docker push <registry>/laptop-rental:frontend
```

Update the `image:` values in the manifests to match the pushed images.

### Create the backend Secret

The backend manifest expects a Kubernetes Secret named `env-secret`. Create it in the namespace where the application will run:

```bash
kubectl create secret generic env-secret \
  --from-literal=MONGO_URI='mongodb+srv://<user>:<password>@<cluster>/<database>' \
  --from-literal=PORT='8000' \
  --from-literal=JWT_SECRET='replace-with-a-long-random-secret' \
  --from-literal=JWT_EXPIRES_IN='7d' \
  --from-literal=RAZORPAY_KEY_ID='your-razorpay-key-id' \
  --from-literal=RAZORPAY_KEY_SECRET='your-razorpay-key-secret' \
  --from-literal=EMAIL_USER='your-smtp-email' \
  --from-literal=EMAIL_PASS='your-smtp-password-or-app-password' \
  --from-literal=FRONT_END_URL='http://localhost:3000' \
  --from-literal=FRONTEND_URL='http://localhost:3000'
```

For a real deployment, set `FRONT_END_URL` and `FRONTEND_URL` to the public frontend URL. Avoid storing the command containing real secrets in shell history or source control.

### Deploy and verify

```bash
kubectl apply -f manifest/laptop_rental-backend.yaml
kubectl apply -f manifest/laptop_rental-frontend.yaml

kubectl get deployments,pods,services
kubectl rollout status deployment/laptop-rental-deployment-backend
kubectl rollout status deployment/laptop-rental-deployment-frontend
```

Both services are `ClusterIP`, so they are not directly exposed outside the cluster. For local verification, use port forwarding:

```bash
kubectl port-forward service/frontend-service 3000:3000
```

Then open `http://localhost:3000`. For a public deployment, expose `frontend-service` through an Ingress or change it to a suitable `LoadBalancer` service. Do not expose the backend service publicly unless required.

> **Persistent storage:** The supplied Kubernetes manifests do not define a PersistentVolume for `backend/uploads`. Add a persistent volume claim and mount it at the backend container's uploads path before using Kubernetes in production, otherwise uploaded files can be lost when a pod is recreated.

## API Overview

All API routes are prefixed with `/api`.

| Area     | Endpoints                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users    | `POST /users/register`, `POST /users/login`, `GET/PATCH /users/profile`, `POST /users/upload-kyc`, `POST /users/forgot-password`, `POST /users/reset-password` |
| Laptops  | `GET /laptops`, `GET /laptops/:id`, `GET /laptops/availability/:id`, admin CRUD at `/laptops`                                                                  |
| Rentals  | `GET/POST /rentals`, `GET /rentals/:id`, `DELETE /rentals/:id`, admin return at `PUT /rentals/:id`                                                             |
| Payments | `POST /payments/create-order`, `POST /payments/verify`, `GET /payments/my-history`, admin refunds at `/payments/refund/:rentalId`                              |
| Reviews  | `POST /reviews`, `GET /reviews/laptop/:laptopId`, `GET /reviews/my-reviews`, `PUT /reviews/:id`, `DELETE /reviews/:id`                                         |

The backend health endpoint is `/health` and is not under `/api`.

## Useful Commands

```bash
# Backend production start
cd backend && npm start

# Frontend lint
cd frontend && npm run lint

# Build the frontend
cd frontend && npm run build
```

## Security Notes

- Keep `.env` files, API keys, JWT secrets, SMTP passwords, and Kubernetes Secrets out of Git.
- Use separate Razorpay test keys and production keys.
- Use HTTPS for deployed frontend and backend URLs.
- Restrict MongoDB network access to trusted application hosts.
- Configure persistent and backed-up storage for uploaded documents in production.

## License

This project is released under the license specified by the repository owner.
