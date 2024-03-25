import { useParams } from "react-router-dom";
import Header from "./Header";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PostInfo } from "./Home";
export interface Comment {
  date: string;
  lastUpdated: string;
  forumPostID: string;
  commentID: string;
  sessionID: string;
  comment: string;
}
function Post({ sessionID }: { sessionID: string }) {
  const { id } = useParams();
  const [allComments, setAllComments] = useState<Comment[] | undefined>();
  const [comment, setComment] = useState<string>();
  const [currentPost, setCurrentPost] = useState<PostInfo[] | undefined>();

  // get all the comments for a post
  useEffect(() => {
    fetch(`http://localhost:3001/posts?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setAllComments(res);
      });
  }, []);

  // get the individual post's data
  useEffect(() => {
    fetch(`http://localhost:3001/post?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setCurrentPost(res);
      });
  }, []);

  // handle the submission of a new comment to a post
  const handleNewPost = () => {
    fetch(`http://localhost:3001/posts?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: Math.floor(new Date().getTime() / 1000).toString(),
        lastUpdated: Math.floor(new Date().getTime() / 1000).toString(),
        forumPostID: id,
        commentID: uuidv4(),
        sessionID: sessionID,
        comment: comment,
      }),
    }).then((res) => console.log(res));
  };
  return (
    <div>
      <Header />
      {currentPost && (
        <div className="post-container">
          <p>
            Post Date:{" "}
            {new Date(Number(currentPost[0].date) * 1000).toUTCString()}
          </p>
          <p> Post id {id}</p>
          <h3>{currentPost && currentPost[0].title}</h3>
          <p>{currentPost && currentPost[0].comment}</p>
        </div>
      )}

      <br />
      <br />
      {allComments &&
        allComments?.map((comment: Comment) => (
          <div
            className={`comment-container ${
              comment.sessionID === sessionID ? "my-forum-post" : ""
            }`}
          >
            <div className="comment-header">
              <p>
                Post date: {new Date(Number(comment.date) * 1000).toUTCString()}
              </p>
              <p>
                {comment.sessionID === sessionID && (
                  <span className="material-symbols-outlined">star_rate</span>
                )}
                Post id: {comment.commentID}{" "}
              </p>
            </div>
            <p className="comment-content">{comment.comment}</p>
          </div>
        ))}
      {allComments?.length === 0 && <p>No comments here yet!</p>}

      <div className="make-comment-container">
        <p>Posting as: {sessionID}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNewPost();
            window.location.reload();
          }}
        >
          <label htmlFor="comment"></label>
          <textarea id="comment" onChange={(e) => setComment(e.target.value)} />
          <button type="submit">Submit Comment</button>
        </form>
      </div>
    </div>
  );
}

export default Post;
