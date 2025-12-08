import React, { useState, useEffect } from 'react'
import { lessonsAPI } from '../api/endpoints'
import './Pages.css'

const PublicLessons = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await lessonsAPI.getPublic()
        setLessons(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  if (loading) return <div className="page"><p>Loading lessons...</p></div>
  if (error) return <div className="page"><p>Error: {error}</p></div>

  return (
    <div className="page lessons-page">
      <h1>Public Lessons</h1>
      
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <div className="lesson-meta">
              <span className="author">By {lesson.author}</span>
              <span className="date">{new Date(lesson.createdAt).toLocaleDateString()}</span>
            </div>
            <a href={`/lessons/${lesson.id}`} className="btn btn-secondary">View Details</a>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="empty-state">
          <p>No lessons available</p>
        </div>
      )}
    </div>
  )
}

export default PublicLessons
