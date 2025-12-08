import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { lessonsAPI } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'
import './Pages.css'

const LessonDetails = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await lessonsAPI.getById(id)
        setLesson(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [id])

  const handleAddFavorite = async () => {
    try {
      await lessonsAPI.addFavorite(id)
      setIsFavorite(true)
    } catch (err) {
      console.error('Failed to add favorite:', err)
    }
  }

  const handleRemoveFavorite = async () => {
    try {
      await lessonsAPI.removeFavorite(id)
      setIsFavorite(false)
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    }
  }

  if (loading) return <div className="page"><p>Loading lesson...</p></div>
  if (error) return <div className="page"><p>Error: {error}</p></div>
  if (!lesson) return <div className="page"><p>Lesson not found</p></div>

  return (
    <div className="page lesson-details-page">
      <div className="lesson-header">
        <h1>{lesson.title}</h1>
        <div className="lesson-info">
          <span className="author">{lesson.author}</span>
          <span className="date">{new Date(lesson.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="lesson-content">
        <p>{lesson.description}</p>
        <div className="lesson-body">{lesson.content}</div>

        {isAuthenticated && (
          <div className="lesson-actions">
            {isFavorite ? (
              <button 
                onClick={handleRemoveFavorite} 
                className="btn btn-danger"
              >
                Remove from Favorites
              </button>
            ) : (
              <button 
                onClick={handleAddFavorite} 
                className="btn btn-primary"
              >
                Add to Favorites
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonDetails
