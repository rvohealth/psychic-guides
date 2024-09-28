import BoxLines from './box-lines'
import GifWithPreview from './gif-with-preview'

export default function Banner({
  title = null,
  gifUrl,
  gifPreviewUrl,
  children,
  orientation = 'left',
}) {
  return (
    <div className="banner above-night-sky" data-orientation={orientation}>
      <div className="banner-image-container">
        {title && <div className="title">{title}</div>}
        <GifWithPreview gifUrl={gifUrl} gifPreviewUrl={gifPreviewUrl} />
        <BoxLines
          top={true}
          right={orientation === 'left'}
          left={orientation === 'right'}
        />
      </div>
      <div className="banner-text-container">
        <div className="banner-text">{children}</div>
      </div>
    </div>
  )
}
