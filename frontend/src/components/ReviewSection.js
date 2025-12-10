import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage } from './UIComponents';

export default function ReviewSection({ foodItemId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    userName: ''
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reviews/${foodItemId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [foodItemId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReview.title || !newReview.comment || !newReview.userName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newReview,
          foodItemId,
          userEmail: localStorage.getItem('userEmail') || ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewReview({ rating: 5, title: '', comment: '', userName: '' });
        setShowReviewForm(false);
        fetchReviews();
        alert('Review submitted successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error submitting review');
    }
  };

  const renderStars = (rating, size = 'md') => {
    const sizeClass = size === 'lg' ? 'fs-5' : 'fs-6';
    return (
      <div className={sizeClass}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              color: star <= rating ? '#ffc107' : '#e9ecef',
              cursor: 'pointer'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-5 border-top pt-4">
      <h4 className="mb-4">Customer Reviews</h4>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Rating Summary */}
      {!loading && stats.totalReviews > 0 && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="text-center">
              <h2 className="mb-2">{stats.averageRating.toFixed(1)}</h2>
              {renderStars(Math.round(stats.averageRating), 'lg')}
              <p className="text-muted mt-2">{stats.totalReviews} reviews</p>
            </div>
          </div>
          <div className="col-md-8">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="d-flex align-items-center mb-2">
                <span className="me-2">{rating}★</span>
                <div className="progress flex-grow-1" style={{ height: '20px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${(stats.ratingDistribution[rating] || 0) / stats.totalReviews * 100}%`
                    }}
                  ></div>
                </div>
                <span className="ms-2">
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {!showReviewForm && (
        <button
          className="btn btn-success mb-4"
          onClick={() => setShowReviewForm(true)}
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="card p-4 mb-4">
          <h5 className="mb-3">Share Your Experience</h5>
          
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={newReview.userName}
              onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Rating</label>
            <div>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  style={{
                    fontSize: '2rem',
                    color: star <= newReview.rating ? '#ffc107' : '#e9ecef',
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Summary of your review"
              maxLength="100"
            />
            <small className="text-muted">{newReview.title.length}/100</small>
          </div>

          <div className="mb-3">
            <label className="form-label">Comment</label>
            <textarea
              className="form-control"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share more details about your experience"
              rows="4"
              maxLength="1000"
            ></textarea>
            <small className="text-muted">{newReview.comment.length}/1000</small>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Submit Review
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading && <LoadingSpinner />}

      {!loading && reviews.length === 0 && (
        <p className="text-muted">No reviews yet. Be the first to review!</p>
      )}

      {!loading && reviews.map((review) => (
        <div key={review._id} className="card mb-3 p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="mb-1">{review.title}</h6>
              {renderStars(review.rating)}
              <small className="text-muted">
                by {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
          <p className="mb-2">{review.comment}</p>
          <div className="d-flex gap-3">
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => {
                // Mark as helpful
                fetch(`/api/reviews/${review._id}/helpful`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ helpful: true })
                });
              }}
            >
              👍 Helpful ({review.helpful})
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                // Mark as unhelpful
                fetch(`/api/reviews/${review._id}/helpful`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ helpful: false })
                });
              }}
            >
              👎 Unhelpful ({review.unhelpful})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
