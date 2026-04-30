'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

type StudyResource = {
  id: string
  title: string
  slug: string | null
  category: string | null
  summary: string | null
  content: string | null
  scripture_references: string | null
  resource_type: string | null
  pdf_url: string | null
  video_url: string | null
  audio_url: string | null
  image_url: string | null
  is_public: boolean
  is_published: boolean
  display_order: number
}

type Props = {
  resources: StudyResource[]
  currentUserId: string
}

const resourceTypes = ['lesson', 'doctrine', 'note', 'course', 'study_plan', 'resource']
const categories = [
  'general',
  'grace',
  'eternal_life',
  'faith',
  'kingdom',
  'spirit_of_christ',
  'marriage',
  'prayer',
  'healing',
  'authority',
  'wilderness',
]

export default function StudyResourceManager({
  resources,
  currentUserId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('general')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [scriptureReferences, setScriptureReferences] = useState('')
  const [resourceType, setResourceType] = useState('lesson')
  const [pdfUrl, setPdfUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isPublished, setIsPublished] = useState(true)
  const [displayOrder, setDisplayOrder] = useState('0')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setSlug('')
    setCategory('general')
    setSummary('')
    setContent('')
    setScriptureReferences('')
    setResourceType('lesson')
    setPdfUrl('')
    setVideoUrl('')
    setAudioUrl('')
    setImageUrl('')
    setIsPublic(true)
    setIsPublished(true)
    setDisplayOrder('0')
    setMessage('')
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function startEdit(resource: StudyResource) {
    setEditingId(resource.id)
    setTitle(resource.title || '')
    setSlug(resource.slug || '')
    setCategory(resource.category || 'general')
    setSummary(resource.summary || '')
    setContent(resource.content || '')
    setScriptureReferences(resource.scripture_references || '')
    setResourceType(resource.resource_type || 'lesson')
    setPdfUrl(resource.pdf_url || '')
    setVideoUrl(resource.video_url || '')
    setAudioUrl(resource.audio_url || '')
    setImageUrl(resource.image_url || '')
    setIsPublic(Boolean(resource.is_public))
    setIsPublished(Boolean(resource.is_published))
    setDisplayOrder(String(resource.display_order ?? 0))
    setMessage('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const finalSlug = slug.trim() || makeSlug(title)

    const payload = {
      title: title.trim(),
      slug: finalSlug || null,
      category,
      summary: summary.trim() || null,
      content: content.trim() || null,
      scripture_references: scriptureReferences.trim() || null,
      resource_type: resourceType,
      pdf_url: pdfUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      audio_url: audioUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      is_public: isPublic,
      is_published: isPublished,
      display_order: Number(displayOrder) || 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = editingId
      ? await supabase.from('study_resources').update(payload).eq('id', editingId)
      : await supabase.from('study_resources').insert({
          ...payload,
          created_by: currentUserId,
        })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(editingId ? 'Study resource updated.' : 'Study resource created.')
    setLoading(false)
    resetForm()
    router.refresh()
  }

  async function deleteResource(id: string) {
    const confirmed = window.confirm('Delete this study resource?')
    if (!confirmed) return

    const { error } = await supabase.from('study_resources').delete().eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-[440px_1fr]'>
      <form
        onSubmit={handleSubmit}
        className='h-fit space-y-4 rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'
      >
        <div>
          <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
            Study Resource
          </p>
          <h2 className='mt-2 text-2xl font-bold'>
            {editingId ? 'Edit Resource' : 'Create Resource'}
          </h2>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Title'
          required
        />

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Slug optional, e.g. grace-as-life'
        />

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='w-full rounded bg-white p-3 text-black'
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className='w-full rounded bg-white p-3 text-black'
          >
            {resourceTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className='min-h-24 w-full rounded bg-white p-3 text-black'
          placeholder='Summary'
        />

        <textarea
          value={scriptureReferences}
          onChange={(e) => setScriptureReferences(e.target.value)}
          className='min-h-24 w-full rounded bg-white p-3 text-black'
          placeholder='Scripture references e.g. John 7:37-38; Romans 5:17'
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='min-h-72 w-full rounded bg-white p-3 text-black'
          placeholder='Full study content'
        />

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Image URL optional'
        />

        <input
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='PDF URL optional'
        />

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Video URL optional'
        />

        <input
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Audio URL optional'
        />

        <input
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className='w-full rounded bg-white p-3 text-black'
          placeholder='Display order'
        />

        <label className='flex items-center gap-2 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public/member visible
        </label>

        <label className='flex items-center gap-2 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>

        <div className='flex flex-wrap gap-3'>
          <button
            disabled={loading}
            className='rounded-full bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50'
          >
            {loading ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
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
        <h2 className='text-2xl font-bold'>Study Resources</h2>

        {resources.map((resource) => (
          <article
            key={resource.id}
            className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'
          >
            {resource.image_url && (
              <img
                src={resource.image_url}
                alt={resource.title}
                className='mb-4 max-h-80 w-full rounded-xl object-cover'
              />
            )}

            <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
              {resource.category || 'general'} · {resource.resource_type || 'lesson'}
            </p>

            <h3 className='mt-2 text-2xl font-bold'>
              {resource.title}
            </h3>

            {resource.summary && (
              <p className='mt-2 text-sm leading-6 text-gray-300'>
                {resource.summary}
              </p>
            )}

            {resource.scripture_references && (
              <p className='mt-3 text-xs leading-6 text-yellow-300'>
                Scriptures: {resource.scripture_references}
              </p>
            )}

            <p className='mt-3 text-xs text-gray-500'>
              Published: {resource.is_published ? 'Yes' : 'No'} · Order: {resource.display_order}
            </p>

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                onClick={() => startEdit(resource)}
                className='rounded bg-yellow-600 px-3 py-1 text-sm text-white'
              >
                Edit
              </button>

              <button
                onClick={() => deleteResource(resource.id)}
                className='rounded bg-red-700 px-3 py-1 text-sm text-white'
              >
                Delete
              </button>

              <a
                href={`/study/${resource.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='rounded border border-yellow-700 px-3 py-1 text-sm text-yellow-300'
              >
                View
              </a>
            </div>
          </article>
        ))}

        {resources.length === 0 && (
          <div className='rounded-2xl border border-yellow-900/30 p-6 text-gray-400'>
            No study resources yet.
          </div>
        )}
      </div>
    </div>
  )
}