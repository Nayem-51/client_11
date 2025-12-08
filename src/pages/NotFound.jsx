import React from 'react'
import './Pages.css'

const NotFound = () => {
  return (
    <div className="page not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    </div>
  )
}

export default NotFound
