# Use the official Nginx image as the base image
# alpine version is smaller
FROM nginx:alpine

# Remove the default Nginx welcome page configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy the application files into the container's web server directory
# This copies your HTML, CSS, JS into the default Nginx serving directory
COPY . /usr/share/nginx/html

# Expose port 8080 (Nginx default is 80, but we'll configure it)
# The EXPOSE instruction documents which ports are intended to be published
EXPOSE 8080

# Nginx runs on port 80 by default inside the container.
# We need to configure it to listen on 8080 or remap the port.
# Let's modify the Nginx configuration to listen on 8080

# Create a custom Nginx configuration file
# This replaces the default.conf to make Nginx listen on 8080
RUN echo " \
server { \
    listen       8080; \
    listen  [::]:8080; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files \$uri \$uri/ =404; \
    } \
    error_page   500 502 503 504  /50x.html; \
    location = /50x.html { \
        root   /usr/share/nginx/html; \
    } \
} \
" > /etc/nginx/conf.d/default.conf

# The base image has a CMD that starts Nginx, we don't need to override it
# unless we want to add specific startup parameters.
# The default CMD is usually `nginx -g 'daemon off;'` which is correct.
