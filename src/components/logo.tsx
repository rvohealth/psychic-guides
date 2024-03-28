export default function Logo({ size = "small" }: { size?: string } = {}) {
  const HTag = size === "small" ? `h2` : `h1`;

  return (
    <div className={`logo ${size}`}>
      <HTag>
        <span>p</span>
        <span>s</span>
        <span>y</span>
        <span>c</span>
        <span>h</span>
        <span>i</span>
        <span>c</span>
      </HTag>
    </div>
  );
}
