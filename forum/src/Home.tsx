import { useEffect, useState } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'


export interface PostInfo {
  title?: string,
  comment?: string,
  date?: number,
  forumPostID?: string, 
  sessionID?: string,
  lastUpdated?: number,
  image?: File
}


function Home({sessionID}:{sessionID: string}) {
    const [, setMakePost] = useState(false)
    const [postContent, setPostContent] = useState<PostInfo>({
      title: "",
      comment: "",
      date: undefined,
      forumPostID: undefined,
      sessionID: undefined,
      lastUpdated: undefined,
      image: undefined
    })
    const [error, setError] = useState<string | undefined>(undefined)
    const [allPosts, setAllPosts] = useState<PostInfo[] | undefined>(undefined)
    const navigate = useNavigate()

    useEffect(() => {
      fetch("http://localhost:3001/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }})
        .then((res => res.json()))
        .then((res) => {
          console.log('res', res)
          setAllPosts(res)
        })
    }, [])

    const setPost = () => {
      fetch("http://localhost:3001/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postContent,
          date: Math.floor(new Date().getTime() / 1000).toString(),
          lastUpdated: Math.floor(new Date().getTime() / 1000).toString(),
          forumPostID: uuidv4(),
          sessionId: sessionID

        })
      })
      .then((res => console.log(res)))
    }


  return (
    <div>
        <Header />
        <div className='forum-hero-container'>
          <div className='forum-hero-left'>
          <h1>Welcome to TechTalk</h1>
          <span className="material-symbols-outlined">forum</span>
          </div>
          <div className='forum-hero-right'>
            <img src='https://www.shutterstock.com/image-vector/social-network-icon-people-illustration-600nw-390109174.jpg' />
          </div>
        </div>
        <button onClick={() => setMakePost((p) => !p)}>Create a post</button>
        <p>recent posts:</p>
        <div className='home-content-container'>
            <ul>
            {allPosts && allPosts.map((post) => (
              <li>
                <a onClick={() => navigate(`/post/${post.forumPostID}`)}>{post.title}</a>
              </li>
            ))}
            </ul>
        </div>
              <div className='make-post-container'>
                <h5>Make Post</h5>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    if (!postContent.title || postContent.title === "") {
                      return setError('Please enter a title.')
                    }
                    setPost();
                    window.location.reload()
                  }}>
                  { error && <p className='error-text'>{error}</p>}
                  <div className='post-row'><label htmlFor='title'>Title</label>
                  <input
                    onChange={(e) =>
                      setPostContent(() => ({
                        ...postContent,
                        title: e.target.value
                      }))
                    }
                    id='title'
                    type='text'
                  />
                 </div>
                  <div className='post-row'> <label htmlFor='comment'>Comment</label><textarea 
                    onChange={(e) =>
                      setPostContent(() => ({
                        ...postContent,
                        comment: e.target.value
                      }))
                    }
                     id='comment'></textarea></div>
                     <div>
                      <label htmlFor='selection'>Image</label>
                      <input accept=".png" type='file' />
                     </div>
                  <button>submit</button>
                </form>
              </div>
    </div>
  )
}

export default Home