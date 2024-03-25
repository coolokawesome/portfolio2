import React from 'react'
import { useNavigate } from 'react-router'

function Header() {
    const navigate = useNavigate()
    
  return (
    <header className="header-container">
        <div>
        <h2>Tech Talk</h2>
        </div>
       <div className='forum-header-right'>
        <a onClick={ () => navigate("/")}>Home</a>
        <a target="#" href="https://github.com">Repo</a>
       </div>
    </header>
  )
}

export default Header