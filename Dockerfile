# ---------- build stage ----------
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # install deps
    COPY package*.json ./
    RUN npm install
    
    # copy source
    COPY . .
    
    # build production
    RUN npm run build:ci
    
    
    # ---------- runtime stage ----------
    FROM nginx:alpine
    
    # remove default config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # copy build
    COPY --from=build /app/build /usr/share/nginx/html
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]