import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function Repl() {
  return (
    <div className="app-repl app-section">
      <h2>
        <Link to="/docs/cli/repl">Repl</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            Psychic provides a simple repl for you, which automatically imports
            all your models and services to a global namespace for you to
            access.
          </p>
        </div>
      </div>

      <Banner gifUrl="/img/routes-demo.gif">
        <div>
          <p className="subtext">
            Use the repl to pull introspoect models and make changes to your
            database.
          </p>
        </div>

        <nav>
          <Link to="/docs/openapi/controllers">
            See our repl guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
