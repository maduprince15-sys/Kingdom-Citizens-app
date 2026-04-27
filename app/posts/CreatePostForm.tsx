'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreatePostForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'Failed to create post.')
        setLoading(false)
        return
      }

      setTitle('')
      setContent('')
      setMessage('Post published.')
      setLoading(false)
      router.refresh()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error.'
      setMessage(msg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mb-8 space-y-4 rounded border border-gray-700 p-4'>
      <h2 className='text-xl font-bold'>Create Post</h2>

      <input
        type='text'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className='w-full rounded border border-gray-300 bg-white p-3 text-black'
        required
      />

      <textarea
        placeholder='Write your post here'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className='min-h-36 w-full rounded border border-gray-300 bg-white p-3 text-black'
        required
      />

      <button
        type='submit'
        disabled={loading}
        className='rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-50'
      >
        {loading ? 'Publishing...' : 'Publish Post'}
      </button>

      {message && <p className='text-sm text-green-400'>{message}</p>}
    </form>
  )
}
