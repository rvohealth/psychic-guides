import BoxLines from './box-lines'

export default function Banner({ gifUrl, children, orientation = 'left' }) {
  return (
    <div className="banner above-night-sky" data-orientation={orientation}>
      <div className="banner-image-container">
        <div
          className="banner-image"
          style={{ backgroundImage: `url(${gifUrl})` }}
        ></div>
        <BoxLines
          width="10vw"
          height="40vh"
          top={true}
          right={orientation === 'left'}
          left={orientation === 'right'}
          x={orientation === 'left' ? '60vw' : '-10vw'}
          y="30vh"
        />
      </div>
      <div className="banner-text-container">
        <div className="banner-text">{children}</div>
        <BoxLines
          width="2px"
          height="20vh"
          right={true}
          x={orientation === 'left' ? '80vw' : '20vw'}
        />
      </div>
    </div>
  )
}
