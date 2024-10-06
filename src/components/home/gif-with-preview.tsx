import { useState } from 'react'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'
import { IoIosPlay } from 'react-icons/io'
import { IoStopSharp } from 'react-icons/io5'

export default function GifWithPreview({ gifUrl, gifPreviewUrl }) {
  const [playing, setPlaying] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)

  return (
    <div
      className={`gif-with-preview  ${playing ? 'playing' : 'stopped'} ${fullScreen ? 'full-screen' : ''}`}
    >
      <div
        className="banner-image"
        style={{ backgroundImage: `url(${playing ? gifUrl : gifPreviewUrl})` }}
      ></div>
      <button className="pause-play-btn" onClick={() => setPlaying(!playing)}>
        {playing ? <IoStopSharp /> : <IoIosPlay />}
      </button>
      <button
        className="full-screen-btn"
        onClick={() => setFullScreen(!fullScreen)}
      >
        {fullScreen ? <BsFullscreen /> : <BsFullscreenExit />}
      </button>
    </div>
  )
}
