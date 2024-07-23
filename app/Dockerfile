FROM node:alpine3.20 AS builder
WORKDIR /app

COPY ./package.json ./package.json

RUN npm i

COPY .. /app

RUN npm run build

FROM nginx:alpine3.19-slim as production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]