'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type GivingOption = {
  id: string
  title: string
  description: string | null
  method: string | null
  giving_url: string | null
  account_details: string | null
  is_active: boolean | null
  display_order: number | null
}

type Props = {
  options: GivingOption[]
}

export default function GivingForm({ options }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [method, setMethod] = useState('')
  const [givingUrl, setGivingUrl] = useState('')
  const [accountDetails, setAccountDetails] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [displayOrder, setDisplayOrder] = useState('0')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setMethod('')
    setGivingUrl('')
    setAccountDetails('')
    setIsActive(true)
    setDisplayOrder('0')
    setMessage('')
  }

  function startEdit(option: GivingOption) {
    setEditingId(option.id)
    setTitle(option.title || '')
    setDescription(option.description || '')
    setMethod(option.method || '')
    setGivingUrl(option.giving_url || '')
    setAccountDetails(option.account_details || '')
    setIsActive(Boolean(option.is_active))
    setDisplayOrder(String(option.display_order ?? 0))
    setMessage('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const payload = {
      title,
      description: description || null,
      method: method || null,
      giving_url: givingUrl || null,
      account_details: accountDetails || null,
      is_active: isActive,
      display_order: Number(displayOrder) || 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = editingId
      ? await supabase.from('giving_options').update(payload).eq('id', editingId)
      : await supabase.from('giving_options').insert(payload)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(editingId ? 'Giving option updated.' : 'Giving option added.')
    setLoading(false)
    resetForm()
    router.refresh()
  }

  async function deleteOption(id: string) {
    const confirmed = window.confirm('Delete this giving option?')
    if (!confirmed) return

    const { error } = await supabase
      .from('giving_options')
      .delete()
      .eq('id', id)

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
          {editingId ? 'Edit Giving Option' : 'Add Giving Option'}
        </h2>

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Title e.g. Support The Kingdom Citizens'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Method e.g. PayPal, Bank Transfer, Wise, Stripe'
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Giving URL'
          value={givingUrl}
          onChange={(e) => setGivingUrl(e.target.value)}
        />

        <textarea
          className='min-h-28 w-full rounded bg-white p-3 text-black'
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className='min-h-32 w-full rounded bg-white p-3 text-black'
          placeholder='Account details or giving instructions'
          value={accountDetails}
          onChange={(e) => setAccountDetails(e.target.value)}
        />

        <input
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Display order'
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
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
            {loading ? 'Saving...' : editingId ? 'Update Option' : 'Add Option'}
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
        {options.map((option) => (
          <article key={option.id} className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-xl font-bold'>{option.title}</h3>
              {!option.is_active && (
                <span className='rounded-full bg-red-800 px-2 py-1 text-xs text-white'>
                  Hidden
                </span>
              )}
            </div>

            <p className='mt-2 text-sm text-yellow-300'>
              {option.method || 'Giving Option'} · Order: {option.display_order ?? 0}
            </p>

            {option.description && (
              <p className='mt-2 text-sm leading-6 text-gray-300'>
                {option.description}
              </p>
            )}

            {option.giving_url && (
              <p className='mt-2 break-all text-sm text-cyan-300'>
                {option.giving_url}
              </p>
            )}

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                onClick={() => startEdit(option)}
                className='rounded bg-yellow-600 px-3 py-1 text-sm text-white'
              >
                Edit
              </button>

              <button
                onClick={() => deleteOption(option.id)}
                className='rounded bg-red-700 px-3 py-1 text-sm text-white'
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {options.length === 0 && <p className='text-gray-400'>No giving options yet.</p>}
      </div>
    </div>
  )
}