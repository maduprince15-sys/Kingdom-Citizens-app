'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

type ContactMessage = {
  id: string
  name: string
  email: string | null
  subject: string | null
  message: string
  status: string
  created_at: string
}

type Props = {
  messages: ContactMessage[]
}

const statuses = ['new', 'read', 'replied', 'archived', 'spam']

export default function ContactMessagesManager({ messages }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('public_contact_messages')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm('Delete this message?')
    if (!confirmed) return

    const { error } = await supabase
      .from('public_contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className='space-y-4'>
      {messages.map((item) => (
        <article
          key={item.id}
          className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'
        >
          <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
                {item.status}
              </p>

              <h2 className='mt-2 text-2xl font-bold'>
                {item.subject || 'No subject'}
              </h2>

              <p className='mt-2 text-sm text-gray-400'>
                From: {item.name}
                {item.email ? ` · ${item.email}` : ''}
              </p>

              <p className='mt-2 text-xs text-gray-500'>
                {new Date(item.created_at).toLocaleString()}
              </p>

              <p className='mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-300'>
                {item.message}
              </p>
            </div>

            <div className='min-w-52 space-y-3'>
              <select
                value={item.status}
                onChange={(e) => updateStatus(item.id, e.target.value)}
                className='w-full rounded bg-white p-3 text-black'
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={() => deleteMessage(item.id)}
                className='w-full rounded bg-red-700 px-4 py-2 text-sm font-bold text-white'
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}

      {messages.length === 0 && (
        <div className='rounded-2xl border border-yellow-900/30 p-6 text-gray-400'>
          No public contact messages yet.
        </div>
      )}
    </div>
  )
}