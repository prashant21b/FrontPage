import React, { useState } from "react";

const UserForm = () => {
  const [name, setName] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [images, setImages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("socialMedia", socialMedia);
    Array.from(images).forEach((image) => {
      formData.append("images", image);
    });

    // Submit formData to the backend (POST request)
    fetch("http://localhost:5000/api/submit", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Submission successful:", data);
        alert("Submitted successfully!");
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Social Media Handle:
        <input
          type="text"
          value={socialMedia}
          onChange={(e) => setSocialMedia(e.target.value)}
          required
        />
      </label>
      <label>
        Upload Images:
        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserForm;
