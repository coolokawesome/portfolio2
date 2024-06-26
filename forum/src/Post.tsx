import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PostInfo } from "./Home";
import Footer from "./Footer";

export interface Comment {
  date: string;
  lastUpdated: string;
  forumPostID: string;
  commentID: string;
  sessionID: string;
  comment: string;
  deleted: boolean;
}
function Post({ sessionID }: { sessionID: string }) {
  const { id } = useParams();
  const [allComments, setAllComments] = useState<Comment[] | undefined>();
  const [comment, setComment] = useState<string>();
  const [currentPost, setCurrentPost] = useState<PostInfo[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const navigate = useNavigate();

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

  // get the individual post
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

  const deletePost = (pk: string) => {
    fetch(`http://localhost:3001/post?id=${pk}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status === 200) {
        navigate("/");
      } else {
        console.warn("error deleting post: ", res);
      }
    });
  };

  const deleteComment = (pk: string, sk: string) => {
    fetch(`http://localhost:3001/posts?id=${pk}&skId=${sk}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status === 200) {
        window.location.reload();
      } else {
        console.warn("error deleting comment: ", res);
      }
    });
  };

  return (
    <div>
      <Header />
      <div className="parent">
        {currentPost && (
          <div
            className={`post-container ${
              currentPost[0].sessionID === sessionID ? "my-forum-post" : ""
            }`}
          >
            <div className="post-header">
              <p>
                Post Date:{" "}
                {new Date(Number(currentPost[0].date) * 1000).toUTCString()}
              </p>
              <p>
                {currentPost[0].sessionID === sessionID && (
                  <span className="material-symbols-outlined" title="You">
                    star_rate
                  </span>
                )}{" "}
                Post id: {id}
                {currentPost[0].sessionID === sessionID && (
                  <button
                    className="fa fa-solid fa-trash trash"
                    id={currentPost[0]?.forumPostID}
                    onClick={(e) => deletePost((e.target as HTMLElement).id)}
                  ></button>
                )}
              </p>
            </div>
            <h3>{currentPost && currentPost[0].title}</h3>
            <p>{currentPost && currentPost[0].comment}</p>
          </div>
        )}

        <p className="m-3">
          {allComments && allComments?.length > 0
            ? "replies:"
            : "No comments here yet!"}{" "}
        </p>
        <div className="container-fluid">
          <div className="row">
            <div className="all-comments-container col-12 col-lg-10 col-xl-8">
              {allComments &&
                allComments
                  ?.sort(
                    (a, b) => parseInt(a.lastUpdated) - parseInt(b.lastUpdated)
                  )
                  .map((comment: Comment) => (
                    <div
                      className={`comment-container ${
                        comment.sessionID === sessionID ? "my-forum-post" : ""
                      }`}
                    >
                      <div className="comment-header">
                        <p>
                          Post date:{" "}
                          {new Date(Number(comment.date) * 1000).toUTCString()}
                        </p>
                        <p>
                          {comment.sessionID === sessionID && (
                            <span
                              className="material-symbols-outlined"
                              title="You"
                            >
                              star_rate
                            </span>
                          )}
                          Post id: {comment.commentID}
                          {comment.sessionID === sessionID &&
                            !comment.deleted && (
                              <button
                                className="fa fa-solid fa-trash trash"
                                onClick={() =>
                                  deleteComment(
                                    comment.commentID,
                                    comment.forumPostID
                                  )
                                }
                              ></button>
                            )}
                        </p>
                      </div>
                      <p className="comment-content">
                        {!comment.deleted && comment.comment}
                      </p>
                      {comment.deleted && (
                        <p className="comment-content deleted">
                          <i>This comment was deleted.</i>
                        </p>
                      )}
                    </div>
                  ))}
            </div>
            <div className="make-comment-container col-12 col-lg-4">
              <div className="dialogue-box">
                <p className="error-dialogue">{error && <>{error}</>}</p>
                <p className="posting-as-dialogue">Posting as: {sessionID}</p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comment) {
                    setError("comments cannot be blank");
                    return setLoading(false);
                  }
                  setLoading(true);
                  handleNewPost();
                  window.location.reload();
                }}
              >
                <textarea
                  id="comment"
                  placeholder="type your reply..."
                  onChange={(e) => {
                    setError(null);
                    setComment(e.target.value);
                  }}
                />
                <button disabled={loading} type="submit">
                  {loading ? "loading" : "Submit Comment"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Post;
