import { useCallback, useEffect, useState } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'


export interface Post {
  title?: string,
  comment?: string,
  date?: number,
  forumPostID?: string, 
  sessionId?: string,
  lastUpdated?: number,
  image?: File
}


function Home({sessionId}:{sessionId: string}) {
    const [makePost, setMakePost] = useState(false)
    const [postContent, setPostContent] = useState<Post>({
      title: "",
      comment: "",
      date: undefined,
      forumPostID: undefined,
      sessionId: undefined,
      lastUpdated: undefined,
      image: undefined
    })
    const [error, setError] = useState<string | undefined>(undefined)
    const [allPosts, setAllPosts] = useState<Post[] | undefined>(undefined)
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
          sessionId: sessionId

        })
      })
      .then((res => console.log(res)))
    }


  return (
    <div>
        <Header />
        <p>Welcome to the forum</p>
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