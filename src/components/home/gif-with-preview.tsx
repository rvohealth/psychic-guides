import { useState } from 'react'

export default function GifWithPreview({ gifUrl, gifPreviewUrl }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className={`gif-with-preview  ${playing ? 'playing' : 'stopped'}`}>
      <div
        className="banner-image"
        style={{ backgroundImage: `url(${playing ? gifUrl : gifPreviewUrl})` }}
      ></div>
      <button onClick={() => setPlaying(!playing)}>
        {playing ? 'STOP' : 'PLAY'}
      </button>
    </div>
  )
}
