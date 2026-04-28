import Link from 'next/link'
import { createClient } from '../lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from('app_announcements')
    .select('id, title, content, image_url, created_at, is_pinned')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: posts } = await supabase
    .from('app_posts')
    .select('id, title, content, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <main className='min-h-screen bg-black text-white'>
      <section className='relative overflow-hidden border-b border-yellow-700/30'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.10),transparent_30%)]' />
        <div className='relative mx-auto max-w-6xl px-4 py-6 md:px-8'>
          <nav className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <Link href='/' className='text-xl font-bold tracking-wide text-yellow-400'>
              Kingdom Citizens
            </Link>

            <div className='flex flex-wrap gap-3 text-sm'>
              <Link href='/public/announcements' className='text-gray-300 hover:text-yellow-400'>
                Announcements
              </Link>
              <Link href='/public/posts' className='text-gray-300 hover:text-yellow-400'>
                Posts
              </Link>
              <Link href='/public/connect' className='text-gray-300 hover:text-yellow-400'>
                Connect
              </Link>
              <Link href='/public/meetings' className='text-gray-300 hover:text-yellow-400'>
                Meetings
              </Link>
              <Link href='/login' className='text-gray-300 hover:text-yellow-400'>
                Login
              </Link>
            </div>
          </nav>

          <div className='grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24'>
            <div>
              <p className='mb-4 inline-block rounded-full border border-yellow-500/40 px-4 py-2 text-sm text-yellow-300'>
                Our address is in Christ
              </p>

              <h1 className='text-4xl font-extrabold leading-tight md:text-6xl'>
                A people formed by Christ, governed by the Kingdom, and living from Heaven.
              </h1>

              <p className='mt-6 max-w-xl text-base leading-7 text-gray-300 md:text-lg'>
                Kingdom Citizens is a Christ-centered community for teachings, fellowship,
                announcements, meetings, books, and spiritual growth.
              </p>

              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <Link
                  href='/register'
                  className='rounded bg-yellow-500 px-6 py-3 text-center font-semibold text-black hover:bg-yellow-400'
                >
                  Join Kingdom Citizens
                </Link>

                <Link
                  href='/public/announcements'
                  className='rounded border border-yellow-600 px-6 py-3 text-center font-semibold text-yellow-300 hover:bg-yellow-950/40'
                >
                  View Announcements
                </Link>
              </div>
            </div>

            <div className='rounded-3xl border border-yellow-700/40 bg-zinc-950/70 p-6 shadow-2xl shadow-yellow-900/20'>
              <div className='rounded-2xl border border-yellow-600/30 bg-black p-6'>
                <div className='mb-6 flex items-center justify-center'>
                  <div className='flex h-28 w-28 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500/10 text-5xl font-bold text-yellow-400'>
                    KC
                  </div>
                </div>

                <h2 className='text-center text-2xl font-bold text-yellow-300'>
                  Kingdom Citizens
                </h2>

                <p className='mt-4 text-center text-gray-300'>
                  “But our citizenship is in heaven, from which we also eagerly wait for the Savior,
                  the Lord Jesus Christ.”
                </p>

                <p className='mt-3 text-center text-sm text-gray-500'>
                  Philippians 3:20
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-12 md:px-8'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Link href='/public/announcements' className='rounded-2xl border border-yellow-700/30 bg-zinc-950 p-5 hover:border-yellow-500'>
            <h2 className='text-xl font-bold text-yellow-300'>Announcements</h2>
            <p className='mt-2 text-sm text-gray-400'>Official ministry notices and updates.</p>
          </Link>

          <Link href='/public/posts' className='rounded-2xl border border-yellow-700/30 bg-zinc-950 p-5 hover:border-yellow-500'>
            <h2 className='text-xl font-bold text-yellow-300'>Posts</h2>
            <p className='mt-2 text-sm text-gray-400'>Community and teaching posts.</p>
          </Link>

          <Link href='/books' className='rounded-2xl border border-yellow-700/30 bg-zinc-950 p-5 hover:border-yellow-500'>
            <h2 className='text-xl font-bold text-yellow-300'>Books</h2>
            <p className='mt-2 text-sm text-gray-400'>Kingdom Citizens books and resources.</p>
          </Link>

          <Link href='/public/meetings' className='rounded-2xl border border-yellow-700/30 bg-zinc-950 p-5 hover:border-yellow-500'>
            <h2 className='text-xl font-bold text-yellow-300'>Meetings</h2>
            <p className='mt-2 text-sm text-gray-400'>Live meetings and fellowship links.</p>
          </Link>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-8 md:px-8'>
        <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-yellow-500'>Latest</p>
            <h2 className='text-3xl font-bold'>Announcements</h2>
          </div>

          <Link href='/public/announcements' className='text-sm text-yellow-400 underline'>
            View all announcements
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          {announcements?.map((item) => (
            <article key={item.id} className='overflow-hidden rounded-2xl border border-yellow-700/30 bg-zinc-950'>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className='h-48 w-full object-cover'
                />
              )}

              <div className='p-5'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 className='text-xl font-bold'>{item.title}</h3>
                  {item.is_pinned && (
                    <span className='rounded bg-yellow-600 px-2 py-1 text-xs font-semibold text-black'>
                      Pinned
                    </span>
                  )}
                </div>

                <p className='mt-3 text-sm leading-6 text-gray-400'>
                  {item.content?.length > 160 ? `${item.content.slice(0, 160)}...` : item.content}
                </p>

                <p className='mt-4 text-xs text-gray-500'>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          ))}

          {announcements?.length === 0 && (
            <p className='text-gray-400'>No announcements yet.</p>
          )}
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-12 md:px-8'>
        <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-yellow-500'>Community</p>
            <h2 className='text-3xl font-bold'>Latest Posts</h2>
          </div>

          <Link href='/public/posts' className='text-sm text-yellow-400 underline'>
            View all posts
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          {posts?.map((item) => (
            <article key={item.id} className='overflow-hidden rounded-2xl border border-yellow-700/30 bg-zinc-950'>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className='h-48 w-full object-cover'
                />
              )}

              <div className='p-5'>
                <h3 className='text-xl font-bold'>{item.title}</h3>

                <p className='mt-3 text-sm leading-6 text-gray-400'>
                  {item.content?.length > 160 ? `${item.content.slice(0, 160)}...` : item.content}
                </p>

                <p className='mt-4 text-xs text-gray-500'>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          ))}

          {posts?.length === 0 && (
            <p className='text-gray-400'>No posts yet.</p>
          )}
        </div>
      </section>

      <section className='border-y border-yellow-700/30 bg-zinc-950'>
        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-2 md:px-8'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-yellow-500'>Connect</p>
            <h2 className='mt-2 text-3xl font-bold'>Stay connected with Kingdom Citizens</h2>
            <p className='mt-4 text-gray-400'>
              Access official links, live meetings, books, and teaching updates from one place.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Link href='/public/connect' className='rounded-xl border border-yellow-700/30 p-4 text-yellow-300 hover:bg-black'>
              Official Links
            </Link>
            <Link href='/public/meetings' className='rounded-xl border border-yellow-700/30 p-4 text-yellow-300 hover:bg-black'>
              Live Meetings
            </Link>
            <Link href='/books' className='rounded-xl border border-yellow-700/30 p-4 text-yellow-300 hover:bg-black'>
              Books
            </Link>
            <Link href='/dashboard' className='rounded-xl border border-yellow-700/30 p-4 text-yellow-300 hover:bg-black'>
              Dashboard
            </Link>
          </div>
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