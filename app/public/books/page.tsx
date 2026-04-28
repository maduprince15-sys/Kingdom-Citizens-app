import Link from 'next/link'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'

const books = [
  {
    title: 'Grace Economy Volume 1',
    description:
      'A Kingdom teaching on grace, divine life, alignment, stewardship, and living from Christ as the source.',
    status: 'Coming / Available Soon',
    link: '/books',
  },
  {
    title: 'Heavenly Citizens Volume 1',
    description:
      'A teaching on identity in Christ, heavenly citizenship, union with Christ, and living from above.',
    status: 'Coming / Available Soon',
    link: '/books',
  },
  {
    title: 'Eternal Life and the Mark of the Beast',
    description:
      'A sober Kingdom teaching on eternal life, allegiance, identity, and the end-time beast system.',
    status: 'Coming / Available Soon',
    link: '/books',
  },
  {
    title: 'Grace Partnership',
    description:
      'A Christ-centered relationship and marriage teaching beginning with purpose, identity, and alignment.',
    status: 'In Development',
    link: '/books',
  },
]

export default function PublicBooksPage() {
  return (
    <main className='min-h-screen bg-[#050303] text-white'>
      <PublicHeader />

      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-black via-[#130606] to-[#250a0a] px-4 py-10 md:px-8'>
        <div className='mx-auto max-w-6xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-4xl font-bold md:text-6xl'>
            Bookstore
          </h1>

          <p className='mt-4 max-w-3xl text-sm leading-7 text-gray-300 md:text-base'>
            Explore books and teachings from The Kingdom Citizens. These works are written
            to strengthen identity in Christ, form spiritual understanding, and establish
            believers in Kingdom order.
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/public/posts'
              className='rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400'
            >
              Read Teachings
            </Link>

            <Link
              href='/public/connect'
              className='rounded-full border border-yellow-700/70 px-5 py-3 text-sm text-yellow-300 hover:bg-yellow-700/20'
            >
              Connect With Us
            </Link>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-10 md:px-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {books.map((book) => (
            <article
              key={book.title}
              className='rounded-2xl border border-yellow-900/30 bg-gradient-to-br from-[#120707] to-[#050303] p-6 shadow-lg shadow-black/30'
            >
              <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-xl font-black text-black'>
                KC
              </div>

              <h2 className='text-2xl font-bold text-white'>{book.title}</h2>

              <p className='mt-3 text-sm leading-7 text-gray-300'>
                {book.description}
              </p>

              <p className='mt-4 inline-block rounded-full border border-yellow-800 px-3 py-1 text-xs text-yellow-300'>
                {book.status}
              </p>

              <div className='mt-5'>
                <Link
                  href={book.link}
                  className='inline-block rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400'
                >
                  View Book Area
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 pb-12 md:px-8'>
        <div className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-6'>
          <h2 className='text-2xl font-bold text-yellow-300'>
            Books as Teaching Vessels
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-gray-300'>
            The Kingdom Citizens books are not merely publications. They are teaching
            vessels for formation, alignment, doctrine, spiritual understanding, and
            Kingdom expression in Christ.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}