export default function LogoStacked({
  size = 'small',
}: { size?: string } = {}) {
  const HTag = size === 'small' ? `h2` : `h1`

  return (
    <div className={`logo-stacked ${size}`}>
      <HTag>
        <div className="top">PSYCHIC</div>
        <div className="middle">PSYCHIC</div>
        <div className="bottom">PSYCHIC</div>
      </HTag>
    </div>
  )
}
