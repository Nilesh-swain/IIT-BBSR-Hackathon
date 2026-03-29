FROM node:20-alpine as build

WORKDIR /app
COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
