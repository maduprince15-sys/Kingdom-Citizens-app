import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className='border-b border-yellow-900/40 bg-black/90 px-4 py-4 text-white md:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <Link href='/' className='text-xl font-bold tracking-wide text-yellow-400'>
          The Kingdom Citizens
        </Link>

        <nav className='flex flex-wrap gap-3 text-sm'>
          <Link href='/' className='text-gray-300 hover:text-yellow-400'>Home</Link>
          <Link href='/public/announcements' className='text-gray-300 hover:text-yellow-400'>Announcements</Link>
          <Link href='/public/posts' className='text-gray-300 hover:text-yellow-400'>Posts</Link>
          <Link href='/public/books' className='text-gray-300 hover:text-yellow-400'>Books</Link>
          <Link href='/public/connect' className='text-gray-300 hover:text-yellow-400'>Connect</Link>
          <Link href='/public/meetings' className='text-gray-300 hover:text-yellow-400'>Meetings</Link>
          <Link href='/login' className='rounded-full bg-yellow-500 px-3 py-1 font-semibold text-black hover:bg-yellow-400'>
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}