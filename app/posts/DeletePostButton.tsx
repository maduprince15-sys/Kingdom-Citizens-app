'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  id: number | string
}

export default function DeletePostButton({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleDelete() {
    const confirmed = window.confirm('Delete this post?')
    if (!confirmed) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'Delete failed.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.refresh()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error.'
      setMessage(msg)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className='rounded bg-red-700 px-3 py-1 text-sm text-white disabled:opacity-50'
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
      {message && <p className='mt-1 text-xs text-red-400'>{message}</p>}
    </div>
  )
}
