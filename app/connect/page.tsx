import { createClient } from '../../lib/supabase/server'

export default async function ConnectPage() {
  const supabase = await createClient()

  const { data: links, error } = await supabase
    .from('social_links')
    .select('id, name, url, category, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <main className='min-h-screen bg-[#050303] px-4 py-8 text-white md:px-8'>
        <section className='mx-auto max-w-5xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-4xl font-black md:text-6xl'>
            Connect
          </h1>

          <div className='mt-6 rounded-2xl border border-red-800/50 bg-red-950/30 p-5 text-red-300'>
            Error loading links: {error.message}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-[#050303] pb-28 text-white md:pb-10'>
      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-black via-[#130606] to-[#260909] px-4 py-10 md:px-8 md:py-16'>
        <div className='mx-auto max-w-6xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-4xl font-black leading-tight md:text-6xl'>
            Connect With <br className='hidden sm:block' />
            Kingdom Citizens
          </h1>

          <p className='mt-5 max-w-3xl text-base leading-8 text-gray-300 md:text-lg'>
            Follow our official ministry channels, pages, media platforms, and community links.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-8 md:px-8'>
        <div className='mb-6 rounded-3xl border border-yellow-900/40 bg-[#120707] p-5 shadow-lg shadow-black/30 md:p-6'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            Official Links
          </p>

          <h2 className='mt-2 text-2xl font-bold text-white md:text-3xl'>
            Channels and ministry platforms
          </h2>

          <p className='mt-3 max-w-3xl text-sm leading-7 text-gray-400'>
            Use these links to access Kingdom Citizens teachings, music, fellowship platforms,
            and public communication channels.
          </p>
        </div>

        {links?.length ? (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            {links.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                className='group rounded-3xl border border-yellow-900/35 bg-gradient-to-br from-[#160707] via-[#0b0505] to-black p-6 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-yellow-500/70'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
                      {item.category || 'Link'}
                    </p>

                    <h3 className='mt-3 text-2xl font-black text-white'>
                      {item.name}
                    </h3>

                    <p className='mt-3 break-all text-sm leading-6 text-gray-400'>
                      {item.url}
                    </p>
                  </div>

                  <div className='rounded-full bg-yellow-500 px-3 py-1 text-sm font-black text-black transition group-hover:bg-yellow-400'>
                    ↗
                  </div>
                </div>

                <p className='mt-6 text-sm font-bold text-yellow-400 group-hover:text-yellow-300'>
                  Open Link →
                </p>
              </a>
            ))}
          </div>
        ) : (
          <div className='rounded-3xl border border-yellow-900/40 bg-[#120707] p-6 text-gray-400'>
            No links available yet.
          </div>
        )}
      </section>
    </main>
  )
}