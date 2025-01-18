import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/submissions")
      .then((response) => response.json())
      .then((data) => setSubmissions(data))
      .catch((error) => console.error("Error fetching submissions:", error));
  }, []);

  return (
    <div className="admin-dashboard">
      {submissions.map((submission, index) => (
        <div key={index} className="user-submission">
          <h3>{submission.name}</h3>
          <p>{submission.socialMedia}</p>
          <div className="image-gallery">
            {submission.images.map((url, idx) => (
              <img key={idx} src={url} alt="Uploaded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
