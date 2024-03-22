import { useState } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router-dom'

function Home() {
    const pages = [1,2,3,4,5]
    const [makePost, setMakePost] = useState(false)
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
                    fetch("http://localhost:3001/", {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body:  JSON.stringify({message: 'hello'})
                    }).then((res => console.log(res)))
                  
                }}>
                  <div className='post-row'><label htmlFor='title'>Title</label><input id='title' type='text'></input></div>
                 <div className='post-row'> <label htmlFor='comment'>Comment</label><textarea id='comment'></textarea></div>
                  <button>submit</button>
                </form>
              </div>
            )
          }
    </div>
  )
}

export default Home