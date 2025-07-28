Greenly - Eco Wellness Companion
A web application to help users take mindful actions for personal well-being and environmental sustainability.

Live Demo (via Load Balancer): http://<lb01-ip-or-hostname>:<port> (e.g., http://localhost:8082 if running locally as per lab setup)
Docker Hub Repository: https://hub.docker.com/r/keaane/greenly-app

Description
Greenly guides users to live better — for themselves and the Earth. It combines personal digital wellness tools with environmental education in one engaging experience. Users can switch between Wellness Mode (reducing screen time, digital burnout) and Eco Mode (understanding tech's environmental impact). The app features curated YouTube videos, real-time news/tips, and a streak tracker to encourage daily positive habits.

APIs Used
Firebase: Authentication and user data storage. (https://firebase.google.com/ )
YouTube Data API v3: Fetches sustainability and wellness videos. (https://developers.google.com/youtube/v3 )
NewsAPI: Provides related news articles (using sample data due to CORS issues in direct client-side use). (https://newsapi.org/ )
API keys are currently embedded in app.js for simplicity in this client-side app. See Hardening section for production considerations.

Technologies
Frontend: HTML5, CSS3, JavaScript (ES6+)
Backend Services: Firebase, YouTube API, NewsAPI
Containerization: Docker
Web Server: Nginx (within Docker container)
Load Balancer: HAProxy
Orchestration: Docker Compose (for lab environment)
Prerequisites
Docker installed (for building and local testing).
Docker Hub account (for pushing images).
Access to Web01, Web02, and Lb01 lab machines (accessible via SSH).
Part Two A: Deployment Instructions
1. Containerization
The application is containerized using the provided Dockerfile.

Dockerfile:

dockerfile


1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html
EXPOSE 8080
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
2. Build & Test Locally (Conceptual)
(Note: These steps require a working Docker environment.)

bash


1
2
3
4
5
6
7
8
9
10
11
12
13
14
# 1. Build the Docker image
# Replace `keaane` with your actual Docker Hub username
docker build -t keaane/greenly-app:v1 .

# 2. Test the image locally
docker run -d --name greenly-test -p 8080:8080 keaane/greenly-app:v1

# 3. Verify it works
# Open browser to http://localhost:8080
# Or use curl: curl http://localhost:8080

# 4. Clean up test container
docker stop greenly-test
docker rm greenly-test
3. Push to Docker Hub
(Note: Requires successful local build and Docker Hub login.)

bash


1
2
3
4
5
6
7
8
9
# 1. Log in to Docker Hub
docker login

# 2. Push the image
docker push keaane/greenly-app:v1

# 3. Tag and push as 'latest'
docker tag keaane/greenly-app:v1 keaane/greenly-app:latest
docker push keaane/greenly-app:latest
4. Deploy on the Lab Machines (Web01 & Web02)
(Note: Requires SSH access to the lab machines where Docker is functional.)

SSH into Web01:
bash


1
2
ssh ubuntu@<web01-ip-or-hostname> -p <ssh-port-if-not-22>
# Example from lab setup (if running locally): ssh ubuntu@localhost -p 2211
Inside Web01, pull and run the container:
bash


1
2
3
4
5
6
7
8
9
10
11
# Pull the image from Docker Hub
docker pull keaane/greenly-app:v1

# Run the container
docker run -d --name app --restart unless-stopped -p 8080:8080 keaane/greenly-app:v1

# Verify it's running
docker ps | grep app

# Test internal access (from within Web01)
curl http://localhost:8080
Repeat steps 1-2 for Web02.
(Note: The internal IP for testing on Web02 would still be http://localhost:8080 from within that container. The external IPs 172.20.0.11 and 172.20.0.12 are for accessing them from the load balancer or other containers in the same network).
5. Configure the Load Balancer (Lb01)
(Note: Requires SSH access to Lb01 where HAProxy is installed/configurable.)

SSH into Lb01:
bash


1
2
ssh ubuntu@<lb01-ip-or-hostname> -p <ssh-port-if-not-22>
# Example: ssh ubuntu@localhost -p 2210
Ensure HAProxy is installed:
bash


1
sudo apt update && sudo apt install -y haproxy
Edit the HAProxy configuration file (/etc/haproxy/haproxy.cfg):
Add or modify the backend section to point to your application containers:


1
2
3
4
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
(Ensure there is a corresponding frontend section that uses this backend, typically listening on port 80).
Reload HAProxy to apply the new configuration:
bash


1
2
sudo systemctl reload haproxy
# Or if using the Docker command from the assignment: docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
6. Test End-to-End
(Note: Requires the load balancer's exposed port to be accessible from your host machine).

Find the port Lb01 exposes for HTTP (e.g., 8082 as per lab setup README).
Access the application via the load balancer:
bash


1
2
curl http://localhost:<lb-exposed-port>
# Example: curl http://localhost:8082
Make multiple requests to observe round-robin load balancing:
bash


1
for i in {1..6}; do curl -s -w "%{http_code} - %{url_effective}\n" -o /dev/null http://localhost:<lb-exposed-port>; done
Hardening (API Keys)
The application currently embeds API keys directly in app.js. For production/security, API keys should not be baked into client-side code or Docker images.
A better approach would be:

Backend API Proxy: Create a backend service (e.g., Node.js/Express) that holds the API keys securely. The frontend JavaScript would make requests to this backend service instead of directly to external APIs.
Environment Variables (for backend): If using a backend, API keys can be passed as environment variables when running the backend container:
bash


1
docker run -d --name backend --restart unless-stopped -p 3000:3000 -e YOUTUBE_API_KEY=yourkey -e NEWS_API_KEY=yourkey <your-backend-image>
Challenges Faced
Local Docker environment issues prevented running the web_infra_lab setup locally. Commands like docker compose up would hang or take excessively long.
This led to focusing on preparing the code, Dockerfile, and comprehensive documentation for deployment in the expected lab environment, rather than demonstrating the full local workflow.
The NewsAPI integration uses sample data as a fallback due to CORS restrictions when calling it directly from the browser.
Future Improvements
Implement a backend proxy for API calls to handle secrets securely.
Add user habit tracking and more interactive features.
Enhance the UI/UX further.
Implement CI/CD for automated testing and deployment.
Credits
APIs:
Firebase (Google)
YouTube Data API (Google)
NewsAPI
Tools:
Docker
Nginx
HAProxy
Libraries:
Font Awesome (for icons)Greenly - Eco Wellness Companion
A web application to help users take mindful actions for personal well-being and environmental sustainability.

Live Demo (via Load Balancer): http://<lb01-ip-or-hostname>:<port> (e.g., http://localhost:8082 if running locally as per lab setup)
Docker Hub Repository: https://hub.docker.com/r/keaane/greenly-app

Description
Greenly guides users to live better — for themselves and the Earth. It combines personal digital wellness tools with environmental education in one engaging experience. Users can switch between Wellness Mode (reducing screen time, digital burnout) and Eco Mode (understanding tech's environmental impact). The app features curated YouTube videos, real-time news/tips, and a streak tracker to encourage daily positive habits.

APIs Used
Firebase: Authentication and user data storage. (https://firebase.google.com/ )
YouTube Data API v3: Fetches sustainability and wellness videos. (https://developers.google.com/youtube/v3 )
NewsAPI: Provides related news articles (using sample data due to CORS issues in direct client-side use). (https://newsapi.org/ )
API keys are currently embedded in app.js for simplicity in this client-side app. See Hardening section for production considerations.

Technologies
Frontend: HTML5, CSS3, JavaScript (ES6+)
Backend Services: Firebase, YouTube API, NewsAPI
Containerization: Docker
Web Server: Nginx (within Docker container)
Load Balancer: HAProxy
Orchestration: Docker Compose (for lab environment)
Prerequisites
Docker installed (for building and local testing).
Docker Hub account (for pushing images).
Access to Web01, Web02, and Lb01 lab machines (accessible via SSH).
Part Two A: Deployment Instructions
1. Containerization
The application is containerized using the provided Dockerfile.

Dockerfile:

dockerfile


1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html
EXPOSE 8080
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
2. Build & Test Locally (Conceptual)
(Note: These steps require a working Docker environment.)

bash


1
2
3
4
5
6
7
8
9
10
11
12
13
14
# 1. Build the Docker image
# Replace `keaane` with your actual Docker Hub username
docker build -t keaane/greenly-app:v1 .

# 2. Test the image locally
docker run -d --name greenly-test -p 8080:8080 keaane/greenly-app:v1

# 3. Verify it works
# Open browser to http://localhost:8080
# Or use curl: curl http://localhost:8080

# 4. Clean up test container
docker stop greenly-test
docker rm greenly-test
3. Push to Docker Hub
(Note: Requires successful local build and Docker Hub login.)

bash


1
2
3
4
5
6
7
8
9
# 1. Log in to Docker Hub
docker login

# 2. Push the image
docker push keaane/greenly-app:v1

# 3. Tag and push as 'latest'
docker tag keaane/greenly-app:v1 keaane/greenly-app:latest
docker push keaane/greenly-app:latest
4. Deploy on the Lab Machines (Web01 & Web02)
(Note: Requires SSH access to the lab machines where Docker is functional.)

SSH into Web01:
bash


1
2
ssh ubuntu@<web01-ip-or-hostname> -p <ssh-port-if-not-22>
# Example from lab setup (if running locally): ssh ubuntu@localhost -p 2211
Inside Web01, pull and run the container:
bash


1
2
3
4
5
6
7
8
9
10
11
# Pull the image from Docker Hub
docker pull keaane/greenly-app:v1

# Run the container
docker run -d --name app --restart unless-stopped -p 8080:8080 keaane/greenly-app:v1

# Verify it's running
docker ps | grep app

# Test internal access (from within Web01)
curl http://localhost:8080
Repeat steps 1-2 for Web02.
(Note: The internal IP for testing on Web02 would still be http://localhost:8080 from within that container. The external IPs 172.20.0.11 and 172.20.0.12 are for accessing them from the load balancer or other containers in the same network).
5. Configure the Load Balancer (Lb01)
(Note: Requires SSH access to Lb01 where HAProxy is installed/configurable.)

SSH into Lb01:
bash


1
2
ssh ubuntu@<lb01-ip-or-hostname> -p <ssh-port-if-not-22>
# Example: ssh ubuntu@localhost -p 2210
Ensure HAProxy is installed:
bash


1
sudo apt update && sudo apt install -y haproxy
Edit the HAProxy configuration file (/etc/haproxy/haproxy.cfg):
Add or modify the backend section to point to your application containers:


1
2
3
4
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
(Ensure there is a corresponding frontend section that uses this backend, typically listening on port 80).
Reload HAProxy to apply the new configuration:
bash


1
2
sudo systemctl reload haproxy
# Or if using the Docker command from the assignment: docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
6. Test End-to-End
(Note: Requires the load balancer's exposed port to be accessible from your host machine).

Find the port Lb01 exposes for HTTP (e.g., 8082 as per lab setup README).
Access the application via the load balancer:
bash


1
2
curl http://localhost:<lb-exposed-port>
# Example: curl http://localhost:8082
Make multiple requests to observe round-robin load balancing:
bash


1
for i in {1..6}; do curl -s -w "%{http_code} - %{url_effective}\n" -o /dev/null http://localhost:<lb-exposed-port>; done
Hardening (API Keys)
The application currently embeds API keys directly in app.js. For production/security, API keys should not be baked into client-side code or Docker images.
A better approach would be:

Backend API Proxy: Create a backend service (e.g., Node.js/Express) that holds the API keys securely. The frontend JavaScript would make requests to this backend service instead of directly to external APIs.
Environment Variables (for backend): If using a backend, API keys can be passed as environment variables when running the backend container:
bash


1
docker run -d --name backend --restart unless-stopped -p 3000:3000 -e YOUTUBE_API_KEY=yourkey -e NEWS_API_KEY=yourkey <your-backend-image>
Challenges Faced
Local Docker environment issues prevented running the web_infra_lab setup locally. Commands like docker compose up would hang or take excessively long.
This led to focusing on preparing the code, Dockerfile, and comprehensive documentation for deployment in the expected lab environment, rather than demonstrating the full local workflow.
The NewsAPI integration uses sample data as a fallback due to CORS restrictions when calling it directly from the browser.
Future Improvements
Implement a backend proxy for API calls to handle secrets securely.
Add user habit tracking and more interactive features.
Enhance the UI/UX further.
Implement CI/CD for automated testing and deployment.
Credits
APIs:
Firebase (Google)
YouTube Data API (Google)
NewsAPI
Tools:
Docker
Nginx
HAProxy
Libraries:
Font Awesome (for icons)
