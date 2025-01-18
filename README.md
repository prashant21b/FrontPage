
# Hacker News Stories Scraper with Real-time Updates

This project consists of a frontend React application, a backend Node.js server, and a MySQL database. The backend periodically scrapes Hacker News for new stories, stores them in the database, and uses WebSockets to send real-time updates to the frontend. The frontend displays these stories and notifies the user when new stories are published.
## Live Demo

   https://hackernews-ecru-three.vercel.app/

   
## Features
- Scrape the latest stories from Hacker News.
- Store stories in a MySQL database.
- Real-time notifications for new stories using WebSockets.
- Frontend built with React.
- API for fetching stories and handling notifications.

## Technologies Used
- **Frontend**: React, Axios, WebSockets, React Icons
- **Backend**: Node.js, Express, WebSockets, Axios, Cheerio
- **Database**: MySQL
- **Other**: CORS, dotenv for environment variables

## Setup Instructions

### Prerequisites
Before starting the project, make sure you have the following installed:
- Node.js and npm
- MySQL
- Git

### Frontend Setup

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/prashant21b/FrontPage.git
   cd FrontPage
   ```

2. Navigate to the `frontend` directory:

   ```bash
   cd client
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Set the backend API base URL in `src/baseurl.js`:

   ```js
   export const baseurl = 'http://localhost:5000'; // Update with your backend URL
   ```

5. Start the React development server:

   ```bash
   npm start
   ```

   This will run the frontend application on `http://localhost:3000`.

### Backend Setup

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and add your MySQL database credentials:

   ```env
   host=localhost
   user=your_db_user
   password=your_db_password
   database=your_db_name
   port_db=3306
   ```

4. Start the backend server:

   ```bash
   node index.js
   ```

   The server will run on `http://localhost:5000`.

### Database Setup

1. Create a MySQL database using the SQL script provided in the project.

2. Ensure the database schema is created by the backend during initialization, or you can manually run the SQL commands found in the `server.js` file:

   ```sql
   CREATE TABLE IF NOT EXISTS news (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       link TEXT NOT NULL,
       created_at DATETIME NOT NULL
   );
   ```

### WebSocket Server

The backend includes a WebSocket server that broadcasts new stories to all connected clients. When the backend scrapes new stories, it sends updates to the clients via WebSocket.

### Running Periodic Scraping

The backend scrapes stories every 5 minutes and stores new stories in the database. The WebSocket server then broadcasts these new stories to all connected clients.

### Notifications

The frontend will request permission from the user to send notifications. Once granted, the user will receive a browser notification whenever new stories are published.

## API Endpoints

### `/stories` (GET)

- **Description**: Fetches the list of stories stored in the database, ordered by the most recent.
- **Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Story title",
      "link": "https://example.com",
      "created_at": "2025-01-01T12:00:00Z"
    }
  ]
  ```

### `/scrape` (POST)

- **Description**: Triggers the backend to scrape Hacker News and store any new stories.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Scraped and saved successfully!"
  }
  ```

## WebSocket Events

### `initialStoryCount` (Sent on WebSocket connection)
- **Description**: Sends the count of stories published in the last 5 minutes.
- **Payload**:
  ```json
  {
    "type": "initialStoryCount",
    "data": {
      "count": 5
    }
  }
  ```

### `newStories` (Sent when new stories are scraped)
- **Description**: Sends the latest scraped stories to all connected clients.
- **Payload**:
  ```json
  {
    "type": "newStories",
    "data": [
      {
        "title": "New story",
        "link": "https://example.com",
        "created_at": "2025-01-01T12:00:00Z"
      }
    ]
  }
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to contribute to this project by opening issues or pull requests.
