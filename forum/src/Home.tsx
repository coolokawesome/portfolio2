import { useState } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'


interface Post {
  title?: string,
  comment?: string,
  date?: number,
  id?: string, 
  sessionId?: string,
  subject?: string
}

function Home({sessionId}:{sessionId: string}) {
    const pages = [1,2,3,4,5]
    const [makePost, setMakePost] = useState(false)
    const [postContent, setPostContent] = useState<Post>({
      title: "",
      comment: "",
      date: undefined,
      id: undefined,
      sessionId: undefined,
      subject: undefined
    })
    const [error, setError] = useState<string | undefined>(undefined)

    const navigate = useNavigate()
  return (
    <div>
        <Header />
        <p>Welcome to the forum</p>
        <button onClick={() => setMakePost((p) => !p)}>Create a post</button>
        <p>recent posts:</p>
        <div className='home-content-container'>
            <ul>
            {pages.map((page) => (
              <li>
                <a onClick={() => navigate(`/post/${page}`)}>{page}</a>
              </li>
            ))}
            </ul>
        </div>
        {
            makePost && (
              <div className='make-post-container'>
                <h5>Make Post</h5>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    if (!postContent.title || postContent.title === "") {
                      return setError('Please enter a title.')
                    }
                    fetch("http://localhost:3001/", {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        ...postContent,
                        date: Math.floor(new Date().getTime() / 1000),
                        id: uuidv4(),
                        sessionId: sessionId

                      })
                    })
                    .then((res => console.log(res)))
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
                      <label htmlFor='selection'>Subject</label>
                      <select onChange={(e) =>
                      setPostContent(() => ({
                        ...postContent,
                        subject: e.target.value
                      }))
                    }>
                        <option value='misc'>Misc</option>
                        <option value='school'>School</option>

                      </select>
                     </div>
                  <button>submit</button>
                </form>
              </div>
            )
          }
    </div>
  )
}

export default Home