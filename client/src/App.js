import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import "./App.css";

const App = () => {
  const [stories, setStories] = useState([]);
  const [newStoryCount, setNewStoryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    // Fetch stories on component mount
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/stories");
        setStories(response.data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();

    // Initialize WebSocket
    const ws = new WebSocket("ws://localhost:5000");
    setSocket(ws);

    ws.onopen = () => console.log("WebSocket connected");

    // Handle incoming WebSocket messages
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received via WebSocket:", data);

      if (data.type === "initialStoryCount") {
        setNewStoryCount(data.data.count);
      }

      if (data.type === "newStories") {
        const newStoriesReceived = data.data.length;
        setNewStoryCount((prevCount) => prevCount + newStoriesReceived);

        // Show notification for the number of new stories
        showNotification(
          `New Stories`,
          `${newStoriesReceived} new stories published.`
        );

        setStories((prevStories) => [...data.data, ...prevStories]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationPermission(true); // Allow notifications
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  };

  // Show notification
  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon.png", // Ensure this path is correct or use an absolute URL
      });
    } else if (Notification.permission === "denied") {
      console.log("Notification permission denied, showing in the console instead.");
      alert(`${title}: ${body}`);
    }
  };

  // Handle the notification icon click event
  const handleNotificationClick = () => {
    if (newStoryCount > 0) {
      showNotification(
        `New Stories`,
        `${newStoryCount} new stories published.`
      );
      setNewStoryCount(0); // Reset the count after showing the notification
    } else {
      alert("No new stories at the moment.");
    }
  };

  return (
    <div className="App">
      {/* Enable Notifications Button at the Top */}
      {!notificationPermission && (
        <button
          className="enable-notifications-btn"
          onClick={requestNotificationPermission}
        >
          Enable Notifications
        </button>
      )}

      <h1>Hacker News Stories</h1>
      {loading ? (
        <p>Loading stories...</p>
      ) : (
        <>
          {/* Display the count of new stories published in the last 5 minutes */}
          {/* <p>{storyCount} new stories published in the last 5 minutes</p> */}
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Link</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id}>
                  <td>{story.title}</td>
                  <td>
                    <a href={story.link} target="_blank" rel="noopener noreferrer">
                      {story.link}
                    </a>
                  </td>
                  <td>{new Date(story.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Notification Icon at the Bottom */}
      <div className="notification-icon" onClick={handleNotificationClick}>
        <FaBell size={40} color="#FFD700" /> {/* Using the bell icon */}
        {/* Display a red badge with the new story count */}
        {newStoryCount > 0 && (
          <span className="notification-badge">{newStoryCount}</span>
        )}
      </div>
    </div>
  );
};

export default App;
