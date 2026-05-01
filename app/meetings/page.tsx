import { createClient } from '../../lib/supabase/server'

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select(
      'id, title, platform, meeting_url, description, meeting_date, meeting_time, host_name'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className='min-h-screen bg-[#050303] px-4 py-8 text-white md:px-8'>
        <section className='mx-auto max-w-5xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-4xl font-black md:text-6xl'>
            Meetings
          </h1>

          <div className='mt-6 rounded-2xl border border-red-800/50 bg-red-950/30 p-5 text-red-300'>
            Error loading meetings: {error.message}
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
            Meetings <br className='hidden sm:block' />
            and Live Sessions
          </h1>

          <p className='mt-5 max-w-3xl text-base leading-8 text-gray-300 md:text-lg'>
            Join upcoming Kingdom Citizens meetings, Bible studies, fellowships,
            and live ministry sessions.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-8 md:px-8'>
        <div className='mb-6 rounded-3xl border border-yellow-900/40 bg-[#120707] p-5 shadow-lg shadow-black/30 md:p-6'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            Upcoming Meetings
          </p>

          <h2 className='mt-2 text-2xl font-bold text-white md:text-3xl'>
            Stay connected and join live
          </h2>

          <p className='mt-3 max-w-3xl text-sm leading-7 text-gray-400'>
            Access official meeting links, schedules, hosts, and programme details
            for Kingdom Citizens gatherings.
          </p>
        </div>

        {meetings?.length ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className='rounded-3xl border border-yellow-900/35 bg-gradient-to-br from-[#160707] via-[#0b0505] to-black p-6 shadow-lg shadow-black/30'
              >
                <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
                  {meeting.platform || 'Meeting'}
                </p>

                <h2 className='mt-3 text-3xl font-black leading-tight text-white'>
                  {meeting.title}
                </h2>

                <div className='mt-5 space-y-2 text-sm leading-6 text-gray-300'>
                  <p>
                    <span className='font-bold text-white'>Platform:</span>{' '}
                    {meeting.platform || 'To be announced'}
                  </p>

                  <p>
                    <span className='font-bold text-white'>Date:</span>{' '}
                    {meeting.meeting_date || 'To be announced'}
                  </p>

                  <p>
                    <span className='font-bold text-white'>Time:</span>{' '}
                    {meeting.meeting_time || 'To be announced'}
                  </p>

                  <p>
                    <span className='font-bold text-white'>Host:</span>{' '}
                    {meeting.host_name || 'Kingdom Citizens'}
                  </p>
                </div>

                {meeting.description && (
                  <div className='mt-5 rounded-2xl border border-yellow-900/30 bg-[#120707] p-4'>
                    <p className='text-xs uppercase tracking-[0.2em] text-yellow-500'>
                      Details
                    </p>

                    <p className='mt-3 text-base leading-8 text-gray-300'>
                      {meeting.description}
                    </p>
                  </div>
                )}

                <a
                  href={meeting.meeting_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400'
                >
                  Join Meeting →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className='rounded-3xl border border-yellow-900/40 bg-[#120707] p-6 text-gray-400'>
            No meetings available yet.
          </div>
        )}
      </section>
    </main>
  )
}