import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function FeatureTesting() {
  return (
    <div className="app-unit-testing app-section">
      <h2>Feature testing</h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            For those doing full-stack development, Psychic provides a testing
            paradigm for driving a headless browser through your front end,
            enabling you to perform end-to-end testing on your application.
          </p>
        </div>
      </div>

      <Banner gifUrl="/img/routes-demo.gif">
        <div>
          <p className="subtext">
            In addition to providing jest bindings for testing your backend,
            Psychic also provides a framework for writing end-to-end tests. When
            configuring Psychic with a client application, it will automatically
            generate a framework for running `feature tests`, enabling you to
            drive a headless browser through your front end and backend at once.
          </p>
        </div>

        <div>
          <p className="subtext">
            This is all driven by playwright and puppeteer, both of which are
            configured in your Psychic application by default. Since the
            configurations are provided, but committed to your repository, you
            can make any changes you see fit to adapt to your own custom setup.
          </p>
        </div>

        <nav>
          <Link to="/docs/intro">
            See our feature testing guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
