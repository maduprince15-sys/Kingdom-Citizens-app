import Link from 'next/link'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'
import ContactForm from './ContactForm'

export default function PublicContactPage() {
  return (
    <main className='min-h-screen bg-[#050303] pb-20 text-white md:pb-0'>
      <PublicHeader />

      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-[#210808] via-[#0b0505] to-black px-4 py-10 md:px-8 md:py-16'>
        <div className='mx-auto max-w-5xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            The Kingdom Citizens
          </p>

          <h1 className='mt-3 text-4xl font-black md:text-6xl'>
            Contact Us
          </h1>

          <p className='mt-4 max-w-3xl text-sm leading-7 text-gray-300 md:text-base'>
            Send a message to The Kingdom Citizens. You can ask a question, request information,
            or contact the board through this public message box.
          </p>

          <Link
            href='/'
            className='mt-6 inline-block rounded-full border border-yellow-700 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-900/20'
          >
            Back to Home
          </Link>
        </div>
      </section>

      <section className='mx-auto max-w-3xl px-4 py-10 md:px-8'>
        <ContactForm />
      </section>

      <PublicFooter />
    </main>
  )
}