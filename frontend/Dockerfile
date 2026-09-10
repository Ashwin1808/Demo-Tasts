FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx /var/run/nginx /tmp/nginx && \
    chown -R nginx:nginx \
        /var/cache/nginx \
        /var/run/nginx \
        /usr/share/nginx/html \
        /etc/nginx \
        /tmp/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]