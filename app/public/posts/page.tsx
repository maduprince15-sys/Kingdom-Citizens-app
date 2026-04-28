import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

export default async function PublicPostsPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('app_posts')
    .select('id, title, content, image_url, video_url, author_name, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen bg-[#050505] text-white'>
      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-black via-[#100606] to-[#1a0808] px-4 py-6 md:px-8'>
        <div className='mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
              Kingdom Citizens Teachings
            </p>
            <h1 className='mt-2 text-3xl font-bold md:text-5xl'>
              Public Posts
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base'>
              Teachings, reflections, meditations, and public write-ups for spiritual
              formation in Christ.
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
              href='/public/announcements'
              className='rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400'
            >
              Announcements
            </Link>
          </div>
        </div>
      </section>

      <section className='mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-6'>
          {error && (
            <div className='rounded border border-red-700 bg-red-950/40 p-4 text-red-300'>
              Error loading posts: {error.message}
            </div>
          )}

          {posts?.map((item) => (
            <article
              key={item.id}
              className='overflow-hidden rounded-2xl border border-yellow-900/30 bg-[#0d0d0d] shadow-lg shadow-black/30'
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className='max-h-[440px] w-full object-cover'
                />
              )}

              <div className='p-5 md:p-7'>
                <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
                  Teaching Post
                </p>

                <h2 className='mt-3 text-2xl font-bold leading-tight md:text-4xl'>
                  {item.title}
                </h2>

                <p className='mt-3 text-sm text-gray-400'>
                  By {item.author_name || 'Kingdom Citizens'} ·{' '}
                  {new Date(item.created_at).toLocaleString()}
                </p>

                <div className='mt-5 whitespace-pre-wrap text-base leading-8 text-gray-200'>
                  {item.content}
                </div>

                {item.video_url && (
                  <p className='mt-6'>
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
              </div>
            </article>
          ))}

          {posts?.length === 0 && (
            <div className='rounded-2xl border border-yellow-900/30 p-6 text-gray-400'>
              No posts yet.
            </div>
          )}
        </div>

        <aside className='h-fit rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
          <p className='text-xs uppercase tracking-[0.3em] text-yellow-500'>
            Formation
          </p>
          <h2 className='mt-2 text-xl font-bold'>Read With Discernment</h2>
          <p className='mt-3 text-sm leading-6 text-gray-300'>
            These posts are designed for teaching, meditation, and spiritual formation.
            Read prayerfully, examine the Scriptures, and let the Word govern your heart.
          </p>

          <div className='mt-5 border-t border-yellow-900/30 pt-5'>
            <Link
              href='/public/announcements'
              className='text-sm text-yellow-300 underline'
            >
              View official announcements
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}