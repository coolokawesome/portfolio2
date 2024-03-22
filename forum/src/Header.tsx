import React from 'react'
import { useNavigate } from 'react-router'

function Header() {
    const navigate = useNavigate()
    
  return (
    <div className="header-container">
        <div>
            <h4>Forum</h4>
        </div>
       <div className='forum-header-right'>
        <a onClick={ () => navigate("/")}>Home</a>
        <a target="#" href="https://github.com">Repo</a>
       </div>
    </div>
  )
}

export default Header