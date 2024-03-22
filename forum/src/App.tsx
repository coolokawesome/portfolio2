import { useEffect, useState } from 'react'
import Header from './Header'
import './assets/App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Post from './Post'
import {v4 as uuidv4} from 'uuid'

const uuid = uuidv4()

function App() {
  const [sessionId, setSessionId] = useState<string | undefined>()
  
  // set a session id 
  useEffect(() => {
    let getSessionId = localStorage.getItem('sessionId')
    if (!getSessionId) {
      getSessionId = uuid
      localStorage.setItem('sessionId', getSessionId)
    }
    setSessionId(getSessionId)
  }, [])


  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Post />}/>
        <Route path="*" element={<Home />} />
        <Route path="/suggestions" element={null} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
