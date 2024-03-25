import { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export interface PostInfo {
  title?: string;
  comment?: string;
  date?: number;
  forumPostID?: string;
  sessionID?: string;
  lastUpdated?: number;
  image?: File;
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
  const [error, setError] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<PostInfo[] | undefined>(undefined);
  const [whatsNew, setWhatsNew] = useState<any>();
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
        console.log("res", res);
        setAllPosts(
          res.sort((a: PostInfo, b: PostInfo) => {
            return parseInt(b.lastUpdated) - parseInt(a.lastUpdated);
          })
        );
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

  // get commits
  useEffect(() => {
    fetch("http://localhost:3001/commits/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => setWhatsNew(res));
  }, []);

  // get all comments

  return (
    <div>
      <Header />
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
          <button className="create-post-button my-4" onClick={() => setMakePost((p) => !p)}>Create a post</button>
            <h2>Recent Posts</h2>
            <div className="home-content-container row">
              {allPosts &&
                allPosts.map((post) => (
                  <div
                    onClick={() => navigate(`/post/${post.forumPostID}`)}
                    className="recent-post-container col-12 col-lg-6 col-xl-4"
                  >
                    <div className="recent-post-inner">
                      <a>{post.title}</a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="col-12 col-md-3 col-lg-4 whats-new-container">
            <h2 className="pb-4">What's new</h2>
            {whatsNew &&
              whatsNew
                ?.map((item: any) => (
                  <div className="commit-block mb-4">
                    <h5>{new Date(item.commit.author.date).toDateString()}</h5>
                    <p>{item?.commit?.message}</p>
                  </div>
                ))
                .slice(0, 5)}
          </div>
        </div>
      </div>
      {makePost && (
        <div className="make-post-container container">
          <h5>Make Post</h5>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!postContent.title || postContent.title === "") {
                return setError("Please enter a title.");
              }
              setPost();
              window.location.reload();
            }}
          >
            {error && <p className="error-text">{error}</p>}
            <div className="post-row">
              <label htmlFor="title">Title</label>
              <input
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
      )}
    </div>
  );
}

export default Home;
