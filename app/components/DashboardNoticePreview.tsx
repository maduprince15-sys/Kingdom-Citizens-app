'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type NoticeSlide = {
  id: string
  type: string
  label: string
  title: string
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  avatar_url?: string | null
  date_text?: string | null
  link_url?: string | null
}

type Props = {
  slides: NoticeSlide[]
  intervalMs?: number
}

export default function DashboardNoticePreview({
  slides,
  intervalMs = 12000,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const safeSlides = useMemo(() => slides || [], [slides])
  const currentSlide = safeSlides[currentIndex]

  useEffect(() => {
    if (safeSlides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % safeSlides.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [safeSlides.length, intervalMs])

  if (!currentSlide) {
    return (
      <Link
        href='/display/notice-board'
        className='group mb-8 block overflow-hidden rounded-[2rem] border border-yellow-700/50 bg-gradient-to-br from-[#2a0909] via-[#120707] to-black p-6 shadow-2xl shadow-black/40 transition hover:-translate-y-1 hover:border-yellow-400 md:p-8'
      >
        <p className='text-xs uppercase tracking-[0.35em] text-yellow-400'>
          Kingdom Citizens Notice Board
        </p>

        <h2 className='mt-3 text-3xl font-black text-white md:text-5xl'>
          Notice Board
        </h2>

        <p className='mt-4 max-w-3xl text-sm leading-7 text-gray-300 md:text-base'>
          No active notices are available yet. Open the notice board for the full display screen.
        </p>

        <div className='mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 text-sm font-black text-black group-hover:bg-yellow-400'>
          Open Notice Board →
        </div>
      </Link>
    )
  }

  return (
    <Link
      href='/display/notice-board'
      className='group mb-8 block overflow-hidden rounded-[2rem] border border-yellow-700/50 bg-gradient-to-br from-[#2a0909] via-[#120707] to-black p-5 shadow-2xl shadow-black/40 transition hover:-translate-y-1 hover:border-yellow-400 md:p-8'
    >
      <div className='grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] md:items-center'>
        <div className='flex justify-center md:justify-start'>
          {currentSlide.image_url ? (
            <img
              src={currentSlide.image_url}
              alt={currentSlide.title}
              className='h-48 w-full rounded-2xl object-cover shadow-lg shadow-black/40 md:h-56 md:w-56'
            />
          ) : currentSlide.avatar_url ? (
            <img
              src={currentSlide.avatar_url}
              alt={currentSlide.title}
              className='h-44 w-44 rounded-full border-4 border-yellow-500 object-cover shadow-lg shadow-yellow-900/30 md:h-52 md:w-52'
            />
          ) : (
            <div className='flex h-44 w-44 items-center justify-center rounded-full border-4 border-yellow-700 bg-[#120707] shadow-lg shadow-yellow-900/30 md:h-52 md:w-52'>
              <span className='text-6xl font-black text-yellow-500'>
                {currentSlide.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <p className='rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black'>
              {currentSlide.label}
            </p>

            {safeSlides.length > 1 && (
              <p className='rounded-full border border-yellow-900/50 bg-black/30 px-3 py-1 text-xs text-yellow-300'>
                {currentIndex + 1} / {safeSlides.length}
              </p>
            )}
          </div>

          <h2 className='mt-5 text-3xl font-black leading-tight text-white md:text-5xl'>
            {currentSlide.title}
          </h2>

          {currentSlide.date_text && (
            <p className='mt-3 text-lg font-bold text-yellow-300'>
              {currentSlide.date_text}
            </p>
          )}

          {currentSlide.subtitle && (
            <p className='mt-3 text-lg font-bold text-yellow-100 md:text-xl'>
              {currentSlide.subtitle}
            </p>
          )}

          {currentSlide.description && (
            <p className='mt-4 line-clamp-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-gray-300 md:text-base'>
              {currentSlide.description}
            </p>
          )}

          <div className='mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 text-sm font-black text-black shadow-lg shadow-yellow-900/30 group-hover:bg-yellow-400'>
            Open Full Notice Board →
          </div>
        </div>
      </div>

      {safeSlides.length > 1 && (
        <div className='mt-6 flex justify-center gap-2'>
          {safeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type='button'
              onClick={(event) => {
                event.preventDefault()
                setCurrentIndex(index)
              }}
              className={
                index === currentIndex
                  ? 'h-2 w-10 rounded-full bg-yellow-400'
                  : 'h-2 w-2 rounded-full bg-gray-600'
              }
              aria-label={`Show notice ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Link>
  )
}