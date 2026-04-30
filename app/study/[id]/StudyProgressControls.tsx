'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type Props = {
  resourceId: string
  userId: string
  initialIsBookmarked: boolean
  initialIsCompleted: boolean
  initialProgressPercent: number
  initialPersonalNote: string
}

export default function StudyProgressControls({
  resourceId,
  userId,
  initialIsBookmarked,
  initialIsCompleted,
  initialProgressPercent,
  initialPersonalNote,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted)
  const [progressPercent, setProgressPercent] = useState(String(initialProgressPercent || 0))
  const [personalNote, setPersonalNote] = useState(initialPersonalNote || '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function saveProgress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const percent = Math.max(0, Math.min(100, Number(progressPercent) || 0))

    const { error } = await supabase.from('study_progress').upsert({
      user_id: userId,
      resource_id: resourceId,
      is_bookmarked: isBookmarked,
      is_completed: isCompleted,
      progress_percent: isCompleted ? 100 : percent,
      personal_note: personalNote.trim() || null,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Study progress saved.')
    setLoading(false)
    router.refresh()
  }

  return (
    <form
      onSubmit={saveProgress}
      className='mt-8 rounded-3xl border border-yellow-900/40 bg-[#120707] p-5 md:p-6'
    >
      <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
        Member Study Progress
      </p>

      <h2 className='mt-2 text-2xl font-bold'>
        Save Your Progress
      </h2>

      <p className='mt-2 text-sm leading-6 text-gray-400'>
        Bookmark this study, mark it completed, save your progress percentage, and keep a private study note.
      </p>

      <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
        <label className='flex items-center gap-3 rounded-xl border border-yellow-900/30 bg-black/30 p-4 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={isBookmarked}
            onChange={(e) => setIsBookmarked(e.target.checked)}
          />
          Bookmark this study
        </label>

        <label className='flex items-center gap-3 rounded-xl border border-yellow-900/30 bg-black/30 p-4 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={isCompleted}
            onChange={(e) => {
              setIsCompleted(e.target.checked)
              if (e.target.checked) {
                setProgressPercent('100')
              }
            }}
          />
          Mark as completed
        </label>
      </div>

      <div className='mt-5'>
        <label className='mb-2 block text-sm text-gray-300'>
          Progress Percentage
        </label>
        <input
          type='number'
          min='0'
          max='100'
          value={progressPercent}
          onChange={(e) => setProgressPercent(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='0 to 100'
        />
      </div>

      <div className='mt-5'>
        <label className='mb-2 block text-sm text-gray-300'>
          Private Study Note
        </label>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          className='min-h-32 w-full rounded bg-white p-3 text-black'
          placeholder='Write a private note about this study'
        />
      </div>

      <button
        disabled={loading}
        className='mt-5 rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50'
      >
        {loading ? 'Saving...' : 'Save Study Progress'}
      </button>

      {message && (
        <p className='mt-4 rounded-xl border border-yellow-900/40 bg-black/30 p-3 text-sm text-yellow-300'>
          {message}
        </p>
      )}
    </form>
  )
}