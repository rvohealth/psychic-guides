import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function Websockets() {
  return (
    <div className="app-websockets app-section">
      <h2>
        <Link to="/docs/utils/websockets/overview">Websockets</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            To run migrations, generate resources, and more, Psychic provides a
            fully-functioning CLI.
          </p>
        </div>
      </div>

      <Banner
        gifUrl="/img/routes-demo.gif"
        gifPreviewUrl="/img/routes-demo-preview.png"
        orientation="right"
      >
        <div>
          <p className="subtext">
            Use the suite of db commands to make adjustments to your database.
          </p>
        </div>

        <nav>
          <Link to="/docs/utils/cli/migrations">
            See our migration guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        gifUrl="/img/routes-demo.gif"
        gifPreviewUrl="/img/routes-demo-preview.png"
      >
        <div>
          <p className="subtext">
            Use generators to quickly create new models, controllers,
            serializers, resources, and more!
          </p>
        </div>

        <nav>
          <Link to="/docs/utils/cli/generators">
            See our generator guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        gifUrl="/img/routes-demo.gif"
        gifPreviewUrl="/img/routes-demo-preview.png"
        orientation="right"
      >
        <div>
          <p className="subtext">
            Use provided spec runners to run unit and feature specs
          </p>
        </div>

        <nav>
          <Link to="/docs/utils/cli/spec-runners">
            See our spec runner guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>

      <Banner
        gifUrl="/img/routes-demo.gif"
        gifPreviewUrl="/img/routes-demo-preview.png"
      >
        <div>
          <p className="subtext">
            Start your dev server locally to play with your application.
          </p>
        </div>

        <nav>
          <Link to="/docs/utils/cli/dev-server">
            See our dev-server guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
