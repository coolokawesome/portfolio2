import { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Footer from "./Footer";

export interface PostInfo {
  title?: string;
  comment?: string;
  date?: number;
  forumPostID?: string;
  sessionID?: string;
  lastUpdated?: string;
  pinned?: boolean;
}
// obviously there's much more to GitHub's JSON response
interface WhatsNew {
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

function Home({ sessionID }: { sessionID: string }) {
  const [makePost, setMakePost] = useState(false);
  const [postContent, setPostContent] = useState<PostInfo>({
    title: "",
    comment: "",
    date: undefined,
    forumPostID: undefined,
    sessionID: undefined,
    lastUpdated: undefined,
    image: undefined,
  });
  const [error, setError] = useState<string | undefined>();
  const [allPosts, setAllPosts] = useState<PostInfo[] | undefined>();
  const [whatsNew, setWhatsNew] = useState<WhatsNew[] | undefined>();
  const navigate = useNavigate();

  // get posts
  useEffect(() => {
    fetch("http://localhost:3001/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setAllPosts(res);
      });
  }, []);

  //set a post
  const setPost = () => {
    fetch("http://localhost:3001/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postContent,
        date: Math.floor(new Date().getTime() / 1000).toString(),
        lastUpdated: Math.floor(new Date().getTime() / 1000).toString(),
        forumPostID: uuidv4(),
        sessionID: sessionID,
      }),
    }).then((res) => console.log(res));
  };

  // get github stuff (check console)
  useEffect(() => {
    fetch("http://localhost:3001/commits/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Github Response: ", res);
        return setWhatsNew(res);
      });
  }, []);

  return (
    <div>
      <Header />
      <div className="parent">
        <div className="forum-hero-container">
          <div className="forum-hero-left">
            <h1>Welcome to TechTalk</h1>
            <span className="material-symbols-outlined">forum</span>
          </div>
          <div className="forum-hero-right">
            <img src="https://www.shutterstock.com/image-vector/social-network-icon-people-illustration-600nw-390109174.jpg" />
          </div>
        </div>
        <div className="home-container container-fluid">
          <div className="row">
            <div className="col-12 col-md-9 col-lg-8">
              <button
                className="create-post-button my-4"
                onClick={() => setMakePost((p) => !p)}
              >
                Create a post
              </button>
              <h2>Recent Posts</h2>
              <div className="home-content-container row">
                {allPosts &&
                  allPosts.map((post) => (
                    <div className="recent-post-container col-12">
                      <div className={`recent-post-inner p-4 ${post.pinned && 'pinned'}`}>
                        <div className="d-flex justify-content-between">
                          <h2 className="post-header">{post.title} {post.pinned && <>{"📌"}</>}</h2>
                          <p>
                            {post.date &&
                              new Date(post.date * 1000).toDateString()}

                          </p>
                        </div>
                        <p className="post-comment">{post.comment}</p>
                        <div className="d-flex justify-content-end mt-4">
                          <a
                            onClick={() =>
                              navigate(`/post/${post.forumPostID}`)
                            }
                            className="arrow"
                          >
                            <b>
                              See more{" "}
                              <i className="fa fa-solid fa-arrow-right"></i>
                            </b>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="col-12 col-md-3 col-lg-4 whats-new-container">
              <h2 className="pb-4">What's new</h2>
              {whatsNew &&
                whatsNew
                  ?.map((newItem: WhatsNew) => (
                    <div className="commit-block mb-4">
                      <h5>
                        {new Date(
                          newItem.commit.author.date || ""
                        ).toDateString()}
                      </h5>
                      <p>{newItem.commit.message}</p>
                    </div>
                  ))
                  .slice(0, 5)}
            </div>
          </div>
        </div>
        {makePost && (
          <div className="make-post-container col-12 col-lg-4">
            <div className="d-flex justify-content-between">
              <h5>Make Post</h5>
              <p>Posting as: {sessionID && <>{sessionID}</>}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!postContent.title || postContent.title === "") {
                  return setError("Please enter a title.");
                }
                if (!postContent.comment && postContent.comment === "") {
                  return setError("Please enter a comment.");
                }
                setPost();
                window.location.reload();
              }}
            >
              {error && <p className="error-text">{error}</p>}
              <div className="post-row">
                <input
                  placeholder="Post title"
                  onChange={(e) =>
                    setPostContent(() => ({
                      ...postContent,
                      title: e.target.value,
                    }))
                  }
                  id="title"
                  type="text"
                />
              </div>
              <div className="post-row">
                {" "}
                <textarea
                  placeholder="What's on your mind?"
                  onChange={(e) =>
                    setPostContent(() => ({
                      ...postContent,
                      comment: e.target.value,
                    }))
                  }
                  id="comment"
                />
              </div>
              <button>submit</button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
