import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

export default async function AnnouncementDisplayPage() {
  const supabase = await createClient()

  const { data: announcements, error } = await supabase
    .from('app_announcements')
    .select('id, title, content, image_url, video_url, is_pinned, created_at')
    .eq('is_pinned', true)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <main className='min-h-screen bg-black text-white'>
      <section className='flex min-h-screen items-center justify-center px-4 py-10'>
        <div className='w-full max-w-6xl'>
          <div className='mb-8 flex flex-col items-center text-center'>
            <img
              src='/kingdom-citizens-logo.png'
              alt='The Kingdom Citizens'
              className='h-28 w-28 rounded-full object-cover md:h-36 md:w-36'
            />

            <p className='mt-5 text-xs uppercase tracking-[0.45em] text-yellow-500'>
              The Kingdom Citizens
            </p>

            <h1 className='mt-3 text-4xl font-black md:text-7xl'>
              Announcements
            </h1>

            <p className='mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-lg'>
              Pinned announcements and important ministry updates.
            </p>

            <div className='mt-5 flex flex-wrap justify-center gap-3'>
              <Link
                href='/'
                className='rounded-full border border-yellow-700 px-5 py-2 text-sm text-yellow-300 hover:bg-yellow-900/20'
              >
                Back to Home
              </Link>

              <Link
                href='/public/announcements'
                className='rounded-full bg-yellow-500 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-400'
              >
                All Announcements
              </Link>
            </div>
          </div>

          {error && (
            <div className='rounded-2xl border border-red-700 bg-red-950/40 p-5 text-red-300'>
              Error loading announcements: {error.message}
            </div>
          )}

          <div className='grid grid-cols-1 gap-6'>
            {announcements?.map((announcement) => (
              <article
                key={announcement.id}
                className='overflow-hidden rounded-[2rem] border border-yellow-900/40 bg-gradient-to-br from-[#180707] to-[#050303] shadow-2xl shadow-black/50'
              >
                {announcement.image_url && (
                  <img
                    src={announcement.image_url}
                    alt={announcement.title}
                    className='max-h-[520px] w-full object-cover'
                  />
                )}

                <div className='p-6 md:p-10'>
                  <div className='mb-4 inline-flex rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black'>
                    Pinned
                  </div>

                  <h2 className='text-3xl font-black md:text-6xl'>
                    {announcement.title}
                  </h2>

                  <p className='mt-6 whitespace-pre-wrap text-lg leading-9 text-gray-200 md:text-2xl md:leading-10'>
                    {announcement.content}
                  </p>

                  {announcement.video_url && (
                    <a
                      href={announcement.video_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-6 inline-block rounded-full border border-yellow-700 px-5 py-3 text-sm font-bold text-yellow-300 hover:bg-yellow-900/20'
                    >
                      Open Video
                    </a>
                  )}

                  <p className='mt-8 text-sm text-gray-500'>
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
              </article>
            ))}

            {announcements?.length === 0 && (
              <div className='rounded-2xl border border-yellow-900/30 p-8 text-center text-gray-400'>
                No pinned announcements yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}