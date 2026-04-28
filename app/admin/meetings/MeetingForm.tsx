'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type Meeting = {
  id: string
  title: string | null
  platform: string | null
  meeting_url: string | null
  description: string | null
  meeting_date: string | null
  meeting_time: string | null
}

type Props = {
  meetings: Meeting[]
}

export default function MeetingForm({ meetings }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [description, setDescription] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setPlatform('')
    setMeetingUrl('')
    setDescription('')
    setMeetingDate('')
    setMeetingTime('')
    setMessage('')
  }

  function startEdit(meeting: Meeting) {
    setEditingId(meeting.id)
    setTitle(meeting.title || '')
    setPlatform(meeting.platform || '')
    setMeetingUrl(meeting.meeting_url || '')
    setDescription(meeting.description || '')
    setMeetingDate(meeting.meeting_date || '')
    setMeetingTime(meeting.meeting_time || '')
    setMessage('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const payload = {
      title,
      platform: platform || null,
      meeting_url: meetingUrl || null,
      description: description || null,
      meeting_date: meetingDate || null,
      meeting_time: meetingTime || null,
    }

    const { error } = editingId
      ? await supabase.from('meetings').update(payload).eq('id', editingId)
      : await supabase.from('meetings').insert(payload)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(editingId ? 'Meeting updated.' : 'Meeting added.')
    setLoading(false)
    resetForm()
    router.refresh()
  }

  async function deleteMeeting(id: string) {
    const confirmed = window.confirm('Delete this meeting?')
    if (!confirmed) return

    const { error } = await supabase.from('meetings').delete().eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]'>
      <form onSubmit={handleSubmit} className='space-y-4 rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
        <h2 className='text-2xl font-bold'>
          {editingId ? 'Edit Meeting' : 'Add Meeting'}
        </h2>

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Platform e.g. Zoom, Google Meet, Proton Meet'
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Meeting URL'
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />

        <textarea
          className='min-h-32 w-full rounded bg-white p-3 text-black'
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type='date'
          className='w-full rounded bg-white p-3 text-black'
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Meeting time e.g. 8:00 PM'
          value={meetingTime}
          onChange={(e) => setMeetingTime(e.target.value)}
        />

        <div className='flex flex-wrap gap-3'>
          <button
            disabled={loading}
            className='rounded-full bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50'
          >
            {loading ? 'Saving...' : editingId ? 'Update Meeting' : 'Add Meeting'}
          </button>

          {editingId && (
            <button
              type='button'
              onClick={resetForm}
              className='rounded-full border border-yellow-700 px-5 py-3 text-yellow-300'
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className='text-sm text-yellow-300'>{message}</p>}
      </form>

      <div className='space-y-4'>
        {meetings.map((meeting) => (
          <article key={meeting.id} className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
            <h3 className='text-xl font-bold'>{meeting.title}</h3>

            <p className='mt-2 text-sm text-gray-300'>
              {meeting.description}
            </p>

            <p className='mt-3 text-sm text-gray-400'>
              Platform: {meeting.platform || '-'} · Date: {meeting.meeting_date || '-'} · Time: {meeting.meeting_time || '-'}
            </p>

            {meeting.meeting_url && (
              <p className='mt-2 break-all text-sm text-cyan-300'>
                {meeting.meeting_url}
              </p>
            )}

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                onClick={() => startEdit(meeting)}
                className='rounded bg-yellow-600 px-3 py-1 text-sm text-white'
              >
                Edit
              </button>

              <button
                onClick={() => deleteMeeting(meeting.id)}
                className='rounded bg-red-700 px-3 py-1 text-sm text-white'
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {meetings.length === 0 && <p className='text-gray-400'>No meetings yet.</p>}
      </div>
    </div>
  )
}