'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
}

type Props = {
  recipients: Profile[]
  defaultRecipientId?: string
  defaultSubject?: string
  parentMessageId?: string
}

export default function MessageForm({
  recipients,
  defaultRecipientId = 'all',
  defaultSubject = '',
  parentMessageId,
}: Props) {
  const router = useRouter()

  const [recipientId, setRecipientId] = useState(defaultRecipientId)
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId,
        subject,
        body,
        parentMessageId: parentMessageId || null,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || 'Message failed.')
      setLoading(false)
      return
    }

    setMessage(
      recipientId === 'all'
        ? 'Broadcast sent successfully.'
        : 'Message sent successfully.'
    )

    setLoading(false)

    setTimeout(() => {
      router.push('/messages')
      router.refresh()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div>
        <label className='mb-2 block text-sm text-gray-300'>Recipient</label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className='w-full rounded border border-gray-300 bg-white p-3 text-black'
        >
          <option value='all'>Broadcast to all members</option>

          {recipients.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {(profile.full_name || profile.email || 'Member') + ` (${profile.role || 'member'})`}
            </option>
          ))}
        </select>

        {recipientId === 'all' && (
          <p className='mt-2 text-sm text-yellow-300'>
            This will send the message to every member except you.
          </p>
        )}
      </div>

      <div>
        <label className='mb-2 block text-sm text-gray-300'>Subject</label>
        <input
          type='text'
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className='w-full rounded border border-gray-300 bg-white p-3 text-black'
          placeholder='Message subject'
          required
        />
      </div>

      <div>
        <label className='mb-2 block text-sm text-gray-300'>Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className='min-h-56 w-full rounded border border-gray-300 bg-white p-3 text-black'
          placeholder='Write the message'
          required
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50'
      >
        {loading
          ? 'Sending...'
          : recipientId === 'all'
            ? 'Send Broadcast'
            : 'Send Message'}
      </button>

      {message && <p className='text-sm text-yellow-300'>{message}</p>}
    </form>
  )
}