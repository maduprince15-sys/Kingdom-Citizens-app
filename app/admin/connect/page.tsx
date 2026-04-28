import Link from 'next/link'
import { requireOwnerOrAdmin } from '../AdminGuard'
import ConnectForm from './ConnectForm'

export default async function AdminConnectPage() {
  const { supabase } = await requireOwnerOrAdmin()

  const { data: links, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen bg-[#050303] p-4 text-white md:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
              The Kingdom Citizens
            </p>
            <h1 className='mt-2 text-3xl font-bold md:text-5xl'>
              Manage Connect Links
            </h1>
          </div>

          <Link href='/dashboard' className='rounded-full border border-yellow-700 px-4 py-2 text-yellow-300'>
            Dashboard
          </Link>
        </div>

        {error && <p className='mb-4 text-red-400'>{error.message}</p>}

        <ConnectForm links={links || []} />
      </div>
    </main>
  )
}