# Greenly - Eco Wellness Companion

A web application to help users take mindful actions for personal well-being and environmental sustainability. It's basically a one-stop centre for someone who wants a guide on how to take care of their wellbeing and the planet regarding electronics.

**Live Demo (Vercel):** `https://vercel.com/keaanes-projects/greenly`
**Docker Hub Repository:** `https://hub.docker.com/r/keaane/greenly-app`

## Description

Greenly guides users to live better — for themselves and the Earth. It combines personal digital wellness tools with environmental education in one engaging experience. Users can switch between Wellness Mode (reducing screen time, digital burnout) and Eco Mode (understanding tech's environmental impact). The app features curated YouTube videos, real-time news/tips, and a streak tracker to encourage daily positive habits.

## APIs Used

*   **Firebase:** Authentication and user data storage. (https://firebase.google.com/)
*   **YouTube Data API v3:** Fetches sustainability and wellness videos. (https://developers.google.com/youtube/v3)
*   **NewsAPI:** Provides related news articles (using sample data due to CORS issues in direct client-side use). (https://newsapi.org/)

*API keys are currently embedded in `app.js` for simplicity in this client-side app. See Hardening section for production considerations.*

## Technologies

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend Services:** Firebase, YouTube API, NewsAPI
*   **Containerization:** Docker
*   **Web Server:** Nginx (within Docker container)
*   **Load Balancer:** HAProxy

## Prerequisites

*   Docker installed (for building and local testing).
*   Docker Hub account (for pushing images).
*   Access to Web01 (54.85.174.255), Web02 (44.201.232.242), and Lb01 (44.203.175.185) lab machines (accessible via SSH).

## Part Two: Deployment Instructions

### Containerization

The application is containerized using the provided `Dockerfile`.

**Dockerfile:**
```dockerfile
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
```

### Build & Test Locally

```bash
# 1. Build the Docker image
docker build -t keaane/greenly-app:v1 .

# 2. Test the image locally
docker run -d --name greenly-test -p 8080:8080 keaane/greenly-app:v1

# 3. Verify it works
# Open browser to http://localhost:8080
# Or use curl: curl http://localhost:8080

# 4. Clean up test container
docker stop greenly-test
docker rm greenly-test
```

### Push to Docker Hub

```bash
# 1. Log in to Docker Hub
docker login

# 2. Push the image
docker push keaane/greenly-app:v1

# 3. Tag and push as 'latest'
docker tag keaane/greenly-app:v1 keaane/greenly-app:latest
docker push keaane/greenly-app:latest
```

### Deploy on the Lab Machines (Web01 & Web02)

#### Deploy to Web-01

1.  **SSH into Web-01:**
    ```bash
    ssh ubuntu@54.85.174.255
    ```
2.  **Inside Web-01, pull and run the container:**
    ```bash
    # Pull the image from Docker Hub
    docker pull keaane/greenly-app:v1

    # Run the container
    docker run -d --name app --restart unless-stopped -p 8080:8080 keaane/greenly-app:v1

    # Verify it's running
    docker ps | grep app

    # Test internal access (from within Web-01)
    curl http://localhost:8080
    ```

#### Deploy to Web-02

1.  **SSH into Web-02:**
    ```bash
    ssh ubuntu@44.201.232.242
    ```
2.  **Inside Web-02, pull and run the container:**
    ```bash
    # Pull the image from Docker Hub
    docker pull keaane/greenly-app:v1

    # Run the container
    docker run -d --name app --restart unless-stopped -p 8080:8080 keaane/greenly-app:v1

    # Verify it's running
    docker ps | grep app

    # Test internal access (from within Web-02)
    curl http://localhost:8080
    ```

### Configure the Load Balancer (Lb-01)

1.  **SSH into Lb-01:**
    ```bash
    ssh ubuntu@44.203.175.185
    ```
2.  **Ensure HAProxy is installed:**
    ```bash
    sudo apt update && sudo apt install -y haproxy
    ```
3.  **Edit the HAProxy configuration file (`/etc/haproxy/haproxy.cfg`):**
    Add or modify the backend section to point to your application containers:
    ```
    backend webapps
        balance roundrobin
        server web01 172.20.0.11:8080 check
        server web02 172.20.0.12:8080 check
    ```
    *(Ensure there is a corresponding `frontend` section that uses this backend, typically listening on port 80).*
4.  **Reload HAProxy to apply the new configuration:**
    ```bash
    sudo systemctl reload haproxy
    # Or if using the Docker command from the assignment: docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
    ```

### Test End-to-End

From your local machine, access the application via the load balancer:

```bash
# Access the application via the load balancer
curl http://44.203.175.185

# Make multiple requests to observe round-robin load balancing
for i in {1..6}; do curl -s -w "%{http_code} - %{url_effective}\n" -o /dev/null http://44.203.175.185; done
```

## Alternative Deployment: Vercel

Due to persistent technical issues preventing SSH access to the assigned lab servers (54.85.174.255, 44.201.232.242, 44.203.175.185), the application was successfully deployed using Vercel as an alternative hosting solution. The Docker image was still built and pushed to Docker Hub as required.

1.  **Install Vercel CLI:**
    ```bash
    npm install -g vercel
    ```
2.  **Deploy to Vercel:**
    ```bash
    # Navigate to your project directory
    vercel --prod
    ```
3.  **Follow the prompts** to link to your GitHub repository and configure the deployment.

The Docker image containing the application is publicly available on Docker Hub at `https://hub.docker.com/r/keaane/greenly-app` with tags `v1` and `latest`. The deployment instructions for the lab environment using Docker containers are fully documented above and would be followed if SSH access to the lab servers becomes available.

## Hardening (API Keys)

The application currently embeds API keys directly in `app.js`. For production/security, API keys should not be baked into client-side code or Docker images.
A better approach would be:

1.  **Backend API Proxy:** Create a backend service (e.g., Node.js/Express) that holds the API keys securely. The frontend JavaScript would make requests to this backend service instead of directly to external APIs.
2.  **Environment Variables (for backend):** If using a backend, API keys can be passed as environment variables when running the backend container:
    ```bash
    docker run -d --name backend --restart unless-stopped -p 3000:3000 -e YOUTUBE_API_KEY=yourkey -e NEWS_API_KEY=yourkey <your-backend-image>
    ```

## Challenges Faced

*   Local Docker environment issues prevented running the `web_infra_lab` setup locally. Commands like `docker compose up` would hang or take excessively long.
*   Persistent issues with SSH access to assigned lab servers prevented deployment to the required Web01, Web02, and Lb01 machines.
*   The NewsAPI integration uses sample data as a fallback due to CORS restrictions when calling it directly from the browser.
*   Successfully built and pushed Docker image to Docker Hub, and deployed application via Vercel to ensure public accessibility.

## Future Improvements

*   Implement a backend proxy for API calls to handle secrets securely.
*   Add user habit tracking and more interactive features.
*   Enhance the UI/UX further.
*   Implement CI/CD for automated testing and deployment.

## Credits

*   **APIs:**
    *   Firebase (Google)
    *   YouTube Data API (Google)
    *   NewsAPI
*   **Tools:**
    *   Docker
    *   Nginx
    *   HAProxy
*   **Libraries:**
    *   Font Awesome (for icons)
    **Demo Video:** https://youtu.be/G_aioJmnZQE
