function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    return null
  } catch {
    return null
  }
}

type Props = {
  url: string
}

export default function VideoEmbed({ url }: Props) {
  const embedUrl = getYouTubeEmbedUrl(url)

  if (!embedUrl) {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-block rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400'
      >
        Watch attached video
      </a>
    )
  }

  return (
    <div className='mt-5 overflow-hidden rounded-xl border border-yellow-900/40'>
      <iframe
        src={embedUrl}
        title='Attached video'
        className='aspect-video w-full'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  )
}