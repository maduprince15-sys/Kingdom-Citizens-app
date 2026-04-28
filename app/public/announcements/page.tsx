import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

export default async function PublicAnnouncementsPage() {
  const supabase = await createClient()

  const { data: announcements, error } = await supabase
    .from('app_announcements')
    .select('id, title, content, image_url, video_url, author_name, created_at, is_pinned')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen bg-[#070303] text-white'>
      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-[#180707] via-[#090505] to-black px-4 py-6 md:px-8'>
        <div className='mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
              Kingdom Citizens
            </p>
            <h1 className='mt-2 text-3xl font-bold md:text-5xl'>
              Official Announcements
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base'>
              Ministry notices, meeting reminders, prayer gatherings, schedule updates,
              and official Kingdom Citizens communication.
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/'
              className='rounded-full border border-yellow-700/70 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-700/20'
            >
              Home
            </Link>
            <Link
              href='/public/posts'
              className='rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400'
            >
              Read Posts
            </Link>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-8 md:px-8'>
        {error && (
          <div className='rounded border border-red-700 bg-red-950/40 p-4 text-red-300'>
            Error loading announcements: {error.message}
          </div>
        )}

        <div className='mb-6 rounded-2xl border border-yellow-900/40 bg-[#120707] p-4 md:p-6'>
          <h2 className='text-xl font-semibold text-yellow-300'>Notice Board</h2>
          <p className='mt-2 text-sm text-gray-300'>
            Pinned announcements appear first. Check this page for official updates.
          </p>
        </div>

        <div className='space-y-5'>
          {announcements?.map((item) => (
            <article
              key={item.id}
              className='overflow-hidden rounded-2xl border border-yellow-900/30 bg-gradient-to-br from-[#120707] to-[#050303] shadow-lg shadow-black/30'
            >
              {item.image_url && (
                <div className='border-b border-yellow-900/30 bg-black'>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className='max-h-[420px] w-full object-cover'
                  />
                </div>
              )}

              <div className='p-5 md:p-6'>
                <div className='flex flex-wrap items-center gap-2'>
                  {item.is_pinned && (
                    <span className='rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black'>
                      Pinned
                    </span>
                  )}
                  <span className='rounded-full border border-yellow-900/60 px-3 py-1 text-xs text-yellow-300'>
                    Official Notice
                  </span>
                </div>

                <h2 className='mt-4 text-2xl font-bold md:text-3xl'>{item.title}</h2>

                <p className='mt-4 whitespace-pre-wrap text-base leading-7 text-gray-200'>
                  {item.content}
                </p>

                {item.video_url && (
                  <p className='mt-5'>
                    <a
                      href={item.video_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-block rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400'
                    >
                      Watch attached video
                    </a>
                  </p>
                )}

                <div className='mt-6 border-t border-yellow-900/30 pt-4 text-sm text-gray-400'>
                  By {item.author_name || 'Kingdom Citizens'} ·{' '}
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            </article>
          ))}

          {announcements?.length === 0 && (
            <div className='rounded-2xl border border-yellow-900/30 p-6 text-gray-400'>
              No announcements yet.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}