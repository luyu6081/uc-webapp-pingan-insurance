FROM openresty/openresty:alpine
ADD dist /usr/local/openresty/nginx/html
