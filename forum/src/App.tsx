import { useEffect, useState } from 'react'
import './assets/App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Post from './Post'
import {v4 as uuidv4} from 'uuid'

const uuid = uuidv4()

function App() {
  const [sessionID, setSessionId] = useState<string | undefined>()
  
  // set a session id 
  useEffect(() => {
    let getSessionID = localStorage.getItem('sessionId')
    if (!getSessionID) {
      getSessionID = uuid
      localStorage.setItem('sessionId', getSessionID)
    }
    setSessionId(getSessionID)
  }, [])


  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home sessionID={sessionID!} />} />
        <Route path="/post/:id" element={<Post sessionID={sessionID!} />}/>
        <Route path="*" element={<Home sessionID={sessionID!} />} />
        <Route path="/suggestions" element={null} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
