import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function ORM() {
  return (
    <div className="app-orm app-section">
      <h2>
        <Link to="/docs/models/overview">Dream</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            The heart of any modern web application is its database, the single
            source of truth for all data within your application. Psychic comes
            equipped out of the box with{' '}
            <Link to="/docs/models/overview">Dream</Link>, an ORM which empowers
            developers to leverage beautiful active record paradigms to compose
            keep their database layer beautiful and expressive.
          </p>
        </div>
      </div>

      <Banner
        gifUrl="/img/query-demo.gif"
        gifPreviewUrl="/img/query-demo-preview.png"
      >
        <p className="subtext">
          Leverage the query building API within Dream to easily construct
          powerful queries. Dream provides tools to enable you to easily
          construct even the most sophisticated queries without ever writing a
          line of sql.
        </p>

        <nav>
          <Link to="/docs/models/querying/overview" style={{}}>
            See our query building guides&gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        title="saving records"
        gifUrl="/img/saving-records-demo.gif"
        gifPreviewUrl="/img/saving-records-demo-preview.png"
        orientation="right"
      >
        <p className="subtext">
          Use built-in methods for easily updating data on your records
        </p>

        <nav>
          <Link to="/docs/models/associations/overview" style={{}}>
            See our model creation guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        title="associations"
        gifUrl="/img/associations-demo.gif"
        gifPreviewUrl="/img/associations-demo-preview.png"
      >
        <p className="subtext">
          Take advantage of powerful association mechanisms to clarify your
          domain, as well as to gain easy access to your associated models.
        </p>

        <nav>
          <Link to="/docs/models/associations/overview" style={{}}>
            See our association guides&gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        title="validations"
        gifUrl="/img/validations-demo.gif"
        gifPreviewUrl="/img/validations-demo-preview.png"
        orientation="right"
      >
        <p className="subtext">
          Leverage our validation decorators to easily apply validations before
          saving your records.
        </p>

        <nav>
          <Link to="/docs/models/validations/contains" style={{}}>
            See our validation guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        title="encryption"
        gifUrl="/img/encrypted-demo.gif"
        gifPreviewUrl="/img/encrypted-demo-preview.png"
      >
        <p className="subtext">
          Automatically encrypt columns on their way into the database, and
          decrypt them upon accessing.
        </p>

        <nav>
          <Link to="/docs/models/decorators/encrypted" style={{}}>
            See our encryption guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
