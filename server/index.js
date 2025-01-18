const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port_db,
});

// Check Database Connection
const checkDatabaseConnection = async () => {
    try {
        await db.query('SELECT 1');
        console.log('Database connection successful!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

const initializeDatabase = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS news (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                created_at DATETIME NOT NULL
            );
        `;

        await db.query(createTableQuery);
        console.log('Database schema initialized successfully.');
    } catch (error) {
        console.error('Error initializing database schema:', error.message);
        process.exit(1);
    }
};

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// Scrape Hacker News
const scrapeHackerNews = async () => {
    const url = 'https://news.ycombinator.com/newest';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const stories = [];
    $('.athing').each((_, element) => {
        const title = $(element).find('.titleline a').text();
        const link = $(element).find('.titleline a').attr('href');
        const createdAt = new Date();

        stories.push({ title, link, created_at: createdAt });
    });

    return stories;
};

const saveStories = async (stories) => {
    const [existingRows] = await db.query('SELECT title, link FROM news');
    const existingStories = new Set(
        existingRows.map((row) => `${row.title}||${row.link}`)
    );

    const newStories = stories.filter((story) => {
        const identifier = `${story.title}||${story.link}`;
        return !existingStories.has(identifier);
    });

    if (newStories.length > 0) {
        const insertQuery = `INSERT INTO news (title, link, created_at) VALUES ?`;
        const values = newStories.map((story) => [
            story.title,
            story.link,
            story.created_at,
        ]);
        await db.query(insertQuery, [values]);
        console.log(`${newStories.length} new stories saved to the database.`);
    } else {
        console.log('No new stories to save.');
    }

    return newStories;
};
//Test api
app.get('/', async (req, res) => {
    res.send("OK");
});

// API: Fetch Stories from Database
app.get('/stories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching stories:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching stories', error });
    }
});

// Scrape and Save Route
app.post('/scrape', async (req, res) => {
    try {
        const stories = await scrapeHackerNews();
        const newStories = await saveStories(stories);
        res.json({ success: true, message: 'Scraped and saved successfully!' });

        // Broadcast real-time updates
        if (newStories.length > 0) {
            const broadcastData = JSON.stringify({
                type: 'newStories',
                data: newStories.slice(0, 5),
            });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                }
            });
            console.log(`Broadcasted ${newStories.length} new stories.`);
        }
    } catch (error) {
        console.error('Error scraping data:', error.message);
        res.status(500).json({ success: false, message: 'Error scraping data', error });
    }
});

// Periodic Scraping (Every 5 Minutes)
setInterval(async () => {
    try {
        const stories = await scrapeHackerNews();
        const newStories = await saveStories(stories);

        // Broadcast real-time updates
        if (newStories.length > 0) {
            const broadcastData = JSON.stringify({
                type: 'newStories',
                data: newStories.slice(0, 5),
            });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                }
            });
            console.log(`Broadcasted ${newStories.length} new stories.`);
        }
    } catch (error) {
        console.error('Error during periodic scraping:', error.message);
    }
}, 5 * 60 * 1000); // 5 minutes in milliseconds

// Start Server
const startServer = async () => {
    await checkDatabaseConnection();
    await initializeDatabase();
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });
};

// Handle WebSocket Connections
wss.on('connection', async (ws) => {
    try {
        const [recentStories] = await db.query(
            'SELECT * FROM news WHERE created_at > NOW() - INTERVAL 5 MINUTE'
        );
        const count = recentStories.length;

        const initialMessage = JSON.stringify({
            type: 'initialStoryCount',
            data: { count },
        });
        ws.send(initialMessage); 
    } catch (error) {
        console.error('Error fetching recent stories count:', error.message);
    }

    
    ws.on('message', (message) => {
        console.log('Received from client:', message);
        
    });
});

// Start the server
startServer();
