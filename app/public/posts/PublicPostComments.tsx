'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type Comment = {
  id: string
  author_id: string | null
  author_name: string | null
  guest_name: string | null
  content: string
  created_at: string
}

type Props = {
  postId: number
  comments: Comment[]
}

export default function PublicPostComments({ postId, comments }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [guestName, setGuestName] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let authorName = guestName.trim() || 'Guest'
    let authorId: string | null = null

    if (user) {
      authorId = user.id

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      authorName = profile?.full_name || profile?.email || user.email || 'Member'
    }

    const { error } = await supabase.from('app_post_comments').insert({
      post_id: postId,
      author_id: authorId,
      author_name: user ? authorName : null,
      guest_name: user ? null : authorName,
      content,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setGuestName('')
    setContent('')
    setMessage('Comment posted.')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className='mt-6 border-t border-yellow-900/30 pt-5'>
      <h3 className='text-lg font-bold text-yellow-300'>Comments</h3>

      <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
        <input
          type='text'
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Your name'
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='min-h-24 w-full rounded bg-white p-3 text-black'
          placeholder='Write a comment'
          required
        />

        <button
          disabled={loading}
          className='rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50'
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>

        {message && <p className='text-sm text-yellow-300'>{message}</p>}
      </form>

      <div className='mt-6 space-y-3'>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className='rounded-xl border border-yellow-900/30 bg-black/30 p-4'
          >
            <p className='text-sm font-semibold text-yellow-300'>
              {comment.author_name || comment.guest_name || 'Guest'}
            </p>

            <p className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300'>
              {comment.content}
            </p>

            <p className='mt-2 text-xs text-gray-500'>
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className='text-sm text-gray-500'>No comments yet.</p>
        )}
      </div>
    </div>
  )
}