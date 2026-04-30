'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

export default function ContactForm() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')

    if (!name.trim() || !message.trim()) {
      setStatusMessage('Please enter your name and message.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('public_contact_messages').insert({
      name: name.trim(),
      email: email.trim() || null,
      subject: subject.trim() || null,
      message: message.trim(),
      status: 'new',
    })

    if (error) {
      setStatusMessage(error.message)
      setLoading(false)
      return
    }

    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setStatusMessage('Message sent successfully.')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 rounded-2xl border border-yellow-900/40 bg-[#120707] p-5 md:p-6'>
      <div>
        <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
          Contact
        </p>
        <h2 className='mt-2 text-2xl font-bold'>Send a Message</h2>
        <p className='mt-2 text-sm leading-6 text-gray-400'>
          Send a message to The Kingdom Citizens. You do not need an account to use this form.
        </p>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='w-full rounded bg-white p-3 text-black'
        placeholder='Your name'
        required
      />

      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='w-full rounded bg-white p-3 text-black'
        placeholder='Your email optional'
      />

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className='w-full rounded bg-white p-3 text-black'
        placeholder='Subject optional'
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='min-h-40 w-full rounded bg-white p-3 text-black'
        placeholder='Write your message'
        required
      />

      <button
        disabled={loading}
        className='w-full rounded-full bg-yellow-500 px-5 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50'
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>

      {statusMessage && (
        <p className='rounded-xl border border-yellow-900/40 bg-black/30 p-3 text-sm text-yellow-300'>
          {statusMessage}
        </p>
      )}
    </form>
  )
}