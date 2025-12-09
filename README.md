# Heritage WebWonders
---

[![Visit Website](https://img.shields.io/badge/Visit-Website-red?style=for-the-badge&logo=globe)](https://darshan.azurewebsites.net/)

## Preserving India's Cultural Tapestry

Welcome to Heritage WebWonders, a project dedicated to showcasing and preserving India's rich cultural heritage. This platform was developed as part of the WebWonders event organized by the Nexus club at Sardar Vallabhbhai National Institute of Technology (SVNIT).

### Our Mission

Our mission is to create a digital space where India's diverse cultural heritage can be explored, celebrated, and preserved for future generations. We aim to:

1. Showcase the beauty and diversity of Indian heritage sites
2. Provide a platform for cultural enthusiasts to share their experiences
3. Raise awareness about the importance of preserving historical landmarks
4. Create a community-driven repository of cultural knowledge

### Project Structure

This project follows the MVC (Model-View-Controller) architecture:

- **Models**: MongoDB schemas defining the structure of our data
- **Views**: Frontend templates using EJS (Embedded JavaScript) for dynamic content rendering
- **Controllers**: JavaScript middleware functions handling route logic and data processing

### Key Features

- Interactive exploration of heritage sites across India
- User-contributed content, including stories, images and likes.
- Geolocation-based discovery of nearby cultural landmarks
- Educational resources about India's history and cultural significance
- E-Mail Functionality for password reset
- A ready to visit deployed version of the website 

### Technology Stack

- Backend: Node.js with Express.js
- Database: MongoDB
- Frontend: EJS, HTML, CSS, JavaScript
- Maps Integration: Overpass API
- Tech Stack: MEN
- Deployment: Docker, NGINX, Azure

## Installation Options

### Local Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your MongoDB connection (contact for _.env_ file)
4. Run the server: `npm start`
5. Navigate to website: http://localhost:3000/

### Docker Deployment

We now support containerized deployment for easier scaling and management:


1. **Dockerfile and Docker Compose Setup:**
    
    Our repository includes:
    - `Dockerfile` - Defines the application environment with Node.js
    - `docker-compose.yml` - Orchestrates the app and MongoDB services, with NGINX containers

2. **Using Docker Compose for Development:**
    ```bash
    # Build and start the containers
    docker-compose up -d

    # Access the application
    # Navigate to http://localhost
    ```
3. **Stopping the Containers:**
    ```bash
    docker-compose down
    ```

The docker setup made it super easy for you guys to run the application without worrying about environment configurations. Just ensure Docker is installed on your machine.

### Contributing
We welcome contributions to Heritage WebWonders! If you have ideas for new features, improvements, or bug fixes, please follow these steps:
1. Fork the repository
2. Create a new branch for your feature or fix
3. Make your changes and commit them
4. Push your changes to your fork
5. Create a pull request with a clear description of your changes

### License
This project is licensed under the MIT License.

### Contact

For any queries or suggestions, please reach out to kanishkp.dev@gmail.com

Join us in our journey to keep India's rich cultural heritage alive in the digital age!

**Team Name: Net Navigatorss**
