'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

type ChatMessage = {
  id: string
  sender_id: string
  sender_name: string | null
  sender_role: string | null
  body: string
  chat_room: string
  is_deleted: boolean
  created_at: string
}

type Props = {
  messages: ChatMessage[]
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  canModerate: boolean
}

export default function ChatRoom({
  messages,
  currentUserId,
  currentUserName,
  currentUserRole,
  canModerate,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const cleanBody = body.trim()

    if (!cleanBody) {
      setMessage('Write a message first.')
      setLoading(false)
      return
    }

    if (cleanBody.length > 2000) {
      setMessage('Message is too long. Maximum is 2000 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('chat_messages').insert({
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_role: currentUserRole,
      body: cleanBody,
      chat_room: 'general',
      is_deleted: false,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setBody('')
    setMessage('')
    setLoading(false)
    router.refresh()
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm('Remove this chat message from the group chat?')
    if (!confirmed) return

    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUserId,
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-3xl border border-yellow-900/40 bg-[#120707] p-5 md:p-6'>
        <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
          General Group Chat
        </p>

        <h2 className='mt-2 text-2xl font-bold'>
          Citizens Discussion
        </h2>

        <p className='mt-2 text-sm leading-6 text-gray-400'>
          This is the general members-only group chat. Messages are visible to logged-in Citizens only.
        </p>

        <form onSubmit={sendMessage} className='mt-5 space-y-4'>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className='min-h-28 w-full rounded bg-white p-3 text-black'
            placeholder='Write a message to the Citizens...'
          />

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              disabled={loading}
              className='rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50'
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            <p className='text-xs text-gray-500'>
              Posting as {currentUserName} · {currentUserRole}
            </p>
          </div>

          {message && (
            <p className='rounded-xl border border-yellow-900/40 bg-black/30 p-3 text-sm text-yellow-300'>
              {message}
            </p>
          )}
        </form>
      </div>

      <div className='rounded-3xl border border-yellow-900/40 bg-[#120707] p-5 md:p-6'>
        <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
              Chat Messages
            </p>

            <h2 className='mt-2 text-2xl font-bold'>
              Recent Discussion
            </h2>
          </div>

          <p className='text-sm text-gray-500'>
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className='space-y-4'>
          {messages.map((item) => {
            const mine = item.sender_id === currentUserId

            return (
              <article
                key={item.id}
                className={
                  item.is_deleted
                    ? 'rounded-2xl border border-red-900/40 bg-red-950/20 p-4 opacity-70'
                    : mine
                      ? 'rounded-2xl border border-yellow-700/40 bg-yellow-950/20 p-4'
                      : 'rounded-2xl border border-yellow-900/30 bg-black/30 p-4'
                }
              >
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-bold text-white'>
                        {item.sender_name || 'Citizen'}
                      </p>

                      <span className='rounded-full border border-yellow-900/40 px-2 py-0.5 text-xs capitalize text-yellow-300'>
                        {item.sender_role || 'member'}
                      </span>

                      {mine && (
                        <span className='rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black'>
                          You
                        </span>
                      )}

                      {item.is_deleted && (
                        <span className='rounded-full bg-red-700 px-2 py-0.5 text-xs font-bold text-white'>
                          Removed
                        </span>
                      )}
                    </div>

                    <p className='mt-1 text-xs text-gray-500'>
                      {new Date(item.created_at).toLocaleString()}
                    </p>

                    <p className='mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200 md:text-base'>
                      {item.is_deleted ? 'This message was removed by a moderator.' : item.body}
                    </p>
                  </div>

                  {canModerate && !item.is_deleted && (
                    <button
                      onClick={() => deleteMessage(item.id)}
                      className='rounded-full border border-red-700 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-900/20'
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            )
          })}

          {messages.length === 0 && (
            <div className='rounded-2xl border border-yellow-900/30 bg-black/30 p-6 text-gray-400'>
              No group chat messages yet. Start the first discussion.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}