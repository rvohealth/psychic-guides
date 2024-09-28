export default function BoxLines({
  top = false,
  bottom = false,
  right = false,
  left = false,
}) {
  return (
    <div
      className="box-lines"
      style={{
        borderBottomWidth: bottom ? 2 : 0,
        borderTopWidth: top ? 2 : 0,
        borderLeftWidth: left ? 2 : 0,
        borderRightWidth: right ? 2 : 0,
      }}
    ></div>
  )
}
