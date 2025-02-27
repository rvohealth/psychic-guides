import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function UnitTesting() {
  return (
    <div className="app-unit-testing app-section">
      <h2>Unit testing</h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            No application is complete without a functioning test suite to prove
            its capabilities. Psychic bootstraps your app with{' '}
            <a href="http://jestjs.io/">Jest</a>, a powerful testing tool which
            has become the standard testing platform for modern javascript
            applications.
          </p>
        </div>
      </div>

      <Banner
        gifUrl="/img/unit-specs-demo.gif"
        gifPreviewUrl="/img/unit-specs-demo-preview.png"
      >
        <p className="subtext">
          Take advantage of custom jest assertions, designed to help you easily
          interact with Psychic and Dream constructs.
        </p>

        <nav>
          <Link to="/docs/intro">See our unit testing guides &gt;&gt;&gt;</Link>
        </nav>
      </Banner>

      <Banner
        title="specRequest"
        gifUrl="/img/unit-specs-spec-request-demo.gif"
        gifPreviewUrl="/img/unit-specs-spec-request-demo-preview.png"
        orientation="right"
      >
        <p className="subtext">
          Use our in-house specRequest singleton for making requests to your
          endpoints, allowing you to easily assert response expectaions and
          payloads.
        </p>

        <nav>
          <Link to="/docs/intro">See our unit testing guides &gt;&gt;&gt;</Link>
        </nav>
      </Banner>
    </div>
  )
}
