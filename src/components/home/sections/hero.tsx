import Link from '@docusaurus/Link'
import LogoStacked from '../logo-stacked'
import BoxLines from '../box-lines'

export default function Hero() {
  return (
    <div className="app-hero">
      <div className="above-night-sky logo-container">
        <LogoStacked size="large" />
        <BoxLines bottom={true} left={true} />
        <div>
          <div className="subtext-container">
            <div className="subtext">
              <span>A TypeScript-driven</span>
              <span>web framework</span>
              <span>that reads your mind.</span>
            </div>

            <nav>
              <Link to="/docs/intro">SEE THE GUIDES&gt;&gt;&gt;</Link>
              <br />
              <Link to="https://github.com/rvohealth/psychic">
                GITHUB&gt;&gt;&gt;
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
