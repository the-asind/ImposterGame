FROM nginx:alpine

WORKDIR /usr/share/nginx/html
COPY index.html style.css main.js sw.js manifest.webmanifest words.txt ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
