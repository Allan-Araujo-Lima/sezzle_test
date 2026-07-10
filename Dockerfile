# syntax=docker/dockerfile:1

# ---------- Stage 1: build do frontend (React/Vite) ----------
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Chamadas da API ficam relativas (ex: /calculate); o nginx encaminha para o backend.
ENV VITE_API_URL=""

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: build do backend (Go/Gin) ----------
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/api

# ---------- Stage 3: imagem final (nginx + binário Go) ----------
FROM nginx:alpine

# Binário do backend
COPY --from=backend-builder /server /app/server

# Estáticos do frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Config do nginx (SPA + proxy para o backend) e entrypoint
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
