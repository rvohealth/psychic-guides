import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function Controllers() {
  return (
    <div className="app-controllers app-section">
      <h2>
        <Link to="/docs/controller/overview">Controllers</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            Psychic leverages the{' '}
            <a href="https://en.wikipedia.org/wiki/Model–view–controller">
              Model View Controller
            </a>{' '}
            paradigm to drive routes to specific controllers and methods. We
            provide controllers with deep integrations to your model layer,
            enabling you to quickly and easily respond to requests.
          </p>
        </div>
      </div>

      <Banner gifUrl="/img/routes-demo.gif">
        <p className="subtext">
          Easily bring params into your controller layer, running implicit
          validations under the hood to protect you from invalid data. Any
          params failing to cast will cause the controller to raise a 400 status
          code.
        </p>

        <nav>
          <Link to="/docs/controllers/params">
            See our params guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner gifUrl="/img/routes-demo.gif" orientation="right">
        <p className="subtext">
          Leverage helpful status code methods to easily render specific HTTP
          statuses.
        </p>

        <nav>
          <Link to="/docs/controllers/status-codes">
            See our status code guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner gifUrl="/img/routes-demo.gif">
        <p className="subtext">
          Easily bring params into your controller layer, running implicit
          validations under the hood to protect you from invalid data. Any
          params failing to cast will cause the controller to raise a 400 status
          code.
        </p>

        <nav>
          <Link to="/docs/controllers/params">
            See our params guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
