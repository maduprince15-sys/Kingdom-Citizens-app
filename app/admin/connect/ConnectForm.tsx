'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type SocialLink = {
  id: string
  name: string | null
  url: string | null
  category: string | null
  is_active: boolean | null
  sort_order: number | null
  created_at: string | null
}

type Props = {
  links: SocialLink[]
}

export default function ConnectForm({ links }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('0')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEditingId(null)
    setName('')
    setUrl('')
    setCategory('')
    setIsActive(true)
    setSortOrder('0')
    setMessage('')
  }

  function startEdit(link: SocialLink) {
    setEditingId(link.id)
    setName(link.name || '')
    setUrl(link.url || '')
    setCategory(link.category || '')
    setIsActive(Boolean(link.is_active))
    setSortOrder(String(link.sort_order ?? 0))
    setMessage('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const payload = {
      name,
      url,
      category: category || null,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
    }

    const { error } = editingId
      ? await supabase.from('social_links').update(payload).eq('id', editingId)
      : await supabase.from('social_links').insert(payload)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(editingId ? 'Link updated.' : 'Link added.')
    setLoading(false)
    resetForm()
    router.refresh()
  }

  async function deleteLink(id: string) {
    const confirmed = window.confirm('Delete this link?')
    if (!confirmed) return

    const { error } = await supabase.from('social_links').delete().eq('id', id)

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
          {editingId ? 'Edit Connect Link' : 'Add Connect Link'}
        </h2>

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Name e.g. Teachings YouTube'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='URL'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Category e.g. YouTube, Facebook, Music'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Sort order'
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />

        <label className='flex items-center gap-2 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active / visible publicly
        </label>

        <div className='flex flex-wrap gap-3'>
          <button
            disabled={loading}
            className='rounded-full bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50'
          >
            {loading ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
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
        {links.map((link) => (
          <article key={link.id} className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-xl font-bold'>{link.name}</h3>
              {!link.is_active && (
                <span className='rounded-full bg-red-800 px-2 py-1 text-xs text-white'>
                  Hidden
                </span>
              )}
            </div>

            <p className='mt-2 break-all text-sm text-cyan-300'>{link.url}</p>

            <p className='mt-2 text-sm text-gray-400'>
              Category: {link.category || '-'} · Order: {link.sort_order ?? 0}
            </p>

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                onClick={() => startEdit(link)}
                className='rounded bg-yellow-600 px-3 py-1 text-sm text-white'
              >
                Edit
              </button>

              <button
                onClick={() => deleteLink(link.id)}
                className='rounded bg-red-700 px-3 py-1 text-sm text-white'
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {links.length === 0 && <p className='text-gray-400'>No links yet.</p>}
      </div>
    </div>
  )
}