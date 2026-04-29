import Link from 'next/link'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import VideoEmbed from '../../components/VideoEmbed'
import { createClient } from '../../../lib/supabase/server'
import PublicPostComments from './PublicPostComments'

export default async function PublicPostsPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('app_posts')
    .select('id, title, content, image_url, video_url, author_name, created_at')
    .order('created_at', { ascending: false })

  const { data: comments } = await supabase
    .from('app_post_comments')
    .select('id, post_id, author_id, author_name, guest_name, content, created_at')
    .order('created_at', { ascending: true })

  function getComments(postId: number) {
    return comments?.filter((comment) => comment.post_id === postId) || []
  }

  return (
    <main className='min-h-screen bg-[#050303] pb-20 text-white md:pb-0'>
      <PublicHeader />

      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-black via-[#130606] to-[#260909] px-4 py-8 md:px-8'>
        <div className='mx-auto max-w-5xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-3xl font-bold md:text-5xl'>
            Posts
          </h1>

          <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-300'>
            Public teachings, community posts, meditations, and Kingdom Citizens updates.
          </p>

          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/'
              className='rounded-full border border-yellow-700/70 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-700/20'
            >
              Home
            </Link>

            <Link
              href='/login'
              className='rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400'
            >
              Member Login
            </Link>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-5xl px-4 py-8 md:px-8'>
        {error && (
          <div className='mb-6 rounded border border-red-700 bg-red-950/40 p-4 text-red-300'>
            Error loading posts: {error.message}
          </div>
        )}

        <div className='space-y-6'>
          {posts?.map((item) => (
            <article
              key={item.id}
              className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5 md:p-7'
            >
              <h2 className='text-2xl font-bold md:text-3xl'>
                {item.title}
              </h2>

              <p className='mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-300 md:text-base'>
                {item.content}
              </p>

              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className='mt-5 max-h-[520px] w-full rounded-2xl object-cover'
                />
              )}

              {item.video_url && <VideoEmbed url={item.video_url} />}

              <p className='mt-5 text-sm text-gray-500'>
                By {item.author_name || 'The Kingdom Citizens'} ·{' '}
                {new Date(item.created_at).toLocaleString()}
              </p>

              <PublicPostComments
                postId={item.id}
                comments={getComments(item.id)}
              />
            </article>
          ))}

          {posts?.length === 0 && (
            <div className='rounded-2xl border border-yellow-900/30 p-6 text-gray-400'>
              No public posts yet.
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}