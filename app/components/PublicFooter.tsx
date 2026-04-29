import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className='border-t border-yellow-900/40 bg-black px-4 py-8 text-white md:px-8'>
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3'>
        <div>
          <h2 className='text-xl font-bold text-yellow-400'>The Kingdom Citizens</h2>
          <p className='mt-2 text-sm text-gray-400'>
            Our address is in Christ.
          </p>
        </div>

<Link href='/public/giving' className='hover:text-yellow-400'>Giving</Link>

        <div>
          <h3 className='font-semibold text-yellow-300'>Public Pages</h3>
          <div className='mt-3 flex flex-col gap-2 text-sm text-gray-400'>
            <Link href='/public/announcements' className='hover:text-yellow-400'>Announcements</Link>
            <Link href='/public/posts' className='hover:text-yellow-400'>Posts</Link>
            <Link href='/public/books' className='hover:text-yellow-400'>Books</Link>
            <Link href='/public/connect' className='hover:text-yellow-400'>Connect</Link>
            <Link href='/public/meetings' className='hover:text-yellow-400'>Meetings</Link>
          </div>
        </div>

        <div>
          <h3 className='font-semibold text-yellow-300'>Member Access</h3>
          <div className='mt-3 flex flex-col gap-2 text-sm text-gray-400'>
            <Link href='/login' className='hover:text-yellow-400'>Login</Link>
            <Link href='/register' className='hover:text-yellow-400'>Register</Link>
          </div>
        </div>
      </div>

      <div className='mx-auto mt-8 max-w-6xl border-t border-yellow-900/30 pt-4 text-sm text-gray-500'>
        © {new Date().getFullYear()} The Kingdom Citizens. All rights reserved.
      </div>
    </footer>
  )
}