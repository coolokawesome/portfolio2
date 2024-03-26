import React, { useCallback, useState } from "react";
import { PostInfo } from "./Home";
import { v4 as uuidv4 } from "uuid";

function MakePost({ sessionID }: { sessionID: string }) {
  const [error, setError] = useState<string | undefined>();
  const [postContent, setPostContent] = useState<PostInfo>({
    title: "",
    comment: "",
    date: undefined,
    forumPostID: undefined,
    sessionID: undefined,
    lastUpdated: undefined,
    image: undefined,
  });
  const setPost = () => {
    const body = JSON.stringify({
      ...postContent,
      date: Math.floor(new Date().getTime() / 1000).toString(),
      lastUpdated: Math.floor(new Date().getTime() / 1000).toString(),
      forumPostID: uuidv4(),
      sessionId: sessionID,
    });
    console.log("post content: ", postContent);
    fetch("http://localhost:3001/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    }).then((res) => console.log(res));
  };

  return (
    <div className="make-post-container container">
      <h5>Make Post</h5>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!postContent.title || postContent.title === "") {
            return setError("Please enter a title.");
          }
          setPost();
        }}
      >
        {error && <p className="error-text">{error}</p>}
        <div className="post-row">
          <label htmlFor="title">Title</label>
          <input
            onChange={(e) => {
              setPostContent(() => ({
                ...postContent,
                title: e.target.value,
              }));
              console.log(e.target.value, postContent);
            }}
            id="title"
            type="text"
          />
        </div>
        <div className="post-row">
          {" "}
          <label htmlFor="comment">Comment</label>
          <textarea
            onChange={(e) =>
              setPostContent(() => ({
                ...postContent,
                comment: e.target.value,
              }))
            }
            id="comment"
          ></textarea>
        </div>
        <div>
          <label htmlFor="selection">Image</label>
          <input accept=".png" type="file" />
        </div>
        <button>submit</button>
      </form>
    </div>
  );
}

export default MakePost;
