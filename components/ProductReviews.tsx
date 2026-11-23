'use client'

import { useState, useTransition } from 'react'
import { submitProductReview, deleteProductReview } from '@/app/products/[slug]/actions'

export interface ReviewItem {
  id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  reviewer_name: string
}

export default function ProductReviews({
  productId,
  slug,
  reviews,
  currentUserId,
  canReview,
}: {
  productId: string
  slug: string
  reviews: ReviewItem[]
  currentUserId: string | null
  canReview: boolean
}) {
  const existingUserReview = reviews.find((r) => r.user_id === currentUserId)
  const [rating, setRating] = useState(existingUserReview?.rating ?? 5)
  const [comment, setComment] = useState(existingUserReview?.comment ?? '')
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await submitProductReview(formData)
      if (res?.error) {
        setFeedback({ type: 'error', text: res.error })
      } else {
        setFeedback({ type: 'success', text: 'Your verified buyer review has been saved!' })
      }
    })
  }

  function handleDelete(reviewId: string) {
    startTransition(async () => {
      const res = await deleteProductReview(reviewId, slug)
      if (!res?.error) {
        setComment('')
        setRating(5)
        setFeedback({ type: 'success', text: 'Review deleted.' })
      }
    })
  }

  return (
    <section aria-labelledby="reviews-heading" className="border-t border-gray-200 dark:border-gray-800 pt-10 mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="reviews-heading" className="text-2xl font-bold">
            Customer Reviews
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {reviews.length > 0
              ? `${averageRating} out of 5 (${reviews.length} verified ${reviews.length === 1 ? 'review' : 'reviews'})`
              : 'No reviews yet.'}
          </p>
        </div>
      </div>

      {/* Review Form — Visible only to verified buyers */}
      {canReview ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-8 space-y-4"
        >
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="slug" value={slug} />
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {existingUserReview ? 'Update Your Review' : 'Write a Verified Buyer Review'}
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
              ✓ Verified Buyer
            </span>
          </div>

          <div>
            <label htmlFor="review-rating" className="block text-sm font-medium mb-1">
              Rating
            </label>
            <select
              id="review-rating"
              name="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-lg px-3 py-2 text-sm"
            >
              <option value={5}>★★★★★ (5 - Excellent)</option>
              <option value={4}>★★★★☆ (4 - Good)</option>
              <option value={3}>★★★☆☆ (3 - Average)</option>
              <option value={2}>★★☆☆☆ (2 - Fair)</option>
              <option value={1}>★☆☆☆☆ (1 - Poor)</option>
            </select>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium mb-1">
              Your Review
            </label>
            <textarea
              id="review-comment"
              name="comment"
              rows={3}
              required
              minLength={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on fit, material, and build quality..."
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-lg p-3 text-sm"
            />
          </div>

          {feedback && (
            <p
              className={`text-sm ${
                feedback.type === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : existingUserReview ? 'Update Review' : 'Post Review'}
            </button>
            {existingUserReview && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(existingUserReview.id)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-8">
          Only verified buyers who have purchased this item can leave a review.
        </p>
      )}

      {/* Review List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{review.reviewer_name}</span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Verified Buyer
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div
                aria-label={`${review.rating} out of 5 stars`}
                className="text-amber-500 text-sm tracking-wide"
              >
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}