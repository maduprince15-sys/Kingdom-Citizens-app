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
    <main className='min-h-screen bg-black text-white'>
      <section className='border-b border-yellow-700/30 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_35%)]'>
        <div className='mx-auto max-w-6xl px-4 py-6 md:px-8'>
          <nav className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <Link href='/' className='text-xl font-bold text-yellow-400'>
              Kingdom Citizens
            </Link>

            <div className='flex flex-wrap gap-3 text-sm'>
              <Link href='/' className='text-gray-300 hover:text-yellow-400'>Home</Link>
              <Link href='/public/posts' className='text-gray-300 hover:text-yellow-400'>Posts</Link>
              <Link href='/public/connect' className='text-gray-300 hover:text-yellow-400'>Connect</Link>
              <Link href='/public/meetings' className='text-gray-300 hover:text-yellow-400'>Meetings</Link>
              <Link href='/login' className='text-gray-300 hover:text-yellow-400'>Login</Link>
            </div>
          </nav>

          <div className='py-14'>
            <p className='mb-4 inline-block rounded-full border border-yellow-500/40 px-4 py-2 text-sm text-yellow-300'>
              Official Ministry Updates
            </p>
            <h1 className='text-4xl font-extrabold md:text-5xl'>Announcements</h1>
            <p className='mt-4 max-w-2xl text-gray-300'>
              Stay updated with Kingdom Citizens notices, meeting updates, ministry information, and important community communication.
            </p>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-10 md:px-8'>
        {error && (
          <div className='rounded border border-red-700 bg-red-950/40 p-4 text-red-300'>
            Error loading announcements: {error.message}
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {announcements?.map((item) => (
            <article
              key={item.id}
              className='overflow-hidden rounded-2xl border border-yellow-700/30 bg-zinc-950 shadow-xl shadow-yellow-950/10'
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className='h-64 w-full object-cover'
                />
              )}

              <div className='p-5'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='text-2xl font-bold'>{item.title}</h2>
                  {item.is_pinned && (
                    <span className='rounded bg-yellow-600 px-2 py-1 text-xs font-semibold text-black'>
                      Pinned
                    </span>
                  )}
                </div>

                <p className='mt-3 whitespace-pre-wrap leading-7 text-gray-300'>
                  {item.content}
                </p>

                {item.video_url && (
                  <p className='mt-5'>
                    <a
                      href={item.video_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded border border-yellow-600 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-950/40'
                    >
                      Watch attached video
                    </a>
                  </p>
                )}

                <p className='mt-5 text-sm text-gray-500'>
                  By {item.author_name || 'Kingdom Citizens'} · {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          ))}

          {announcements?.length === 0 && (
            <p className='text-gray-400'>No announcements yet.</p>
          )}
        </div>
      </section>

      <footer className='mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 md:px-8'>
        <div className='flex flex-col gap-3 border-t border-yellow-700/30 pt-6 sm:flex-row sm:items-center sm:justify-between'>
          <p>© Kingdom Citizens</p>
          <p>Our address is in Christ.</p>
        </div>
      </footer>
    </main>
  )
}