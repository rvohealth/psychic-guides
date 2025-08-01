import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function OpenAPI() {
  return (
    <div className="app-openapi app-section">
      <h2>
        <Link to="/docs/openapi/overview">Open API</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            Maintaining specs for your api can often be a chore, since though
            you are aware of what your response shapes are, to communicate them
            to others often involves constructing api documents using OpenAPI
            and manually shaping each endpoint to match your actual response
            payloads. Psychic provides deep and powerful OpenAPI integrations to
            enable the application to automatically know what the payload shapes
            will be, and to automatically shape the document to reflect these
            shapes.
          </p>
        </div>
      </div>

      <Banner
        gifUrl="/img/openapi-demo.gif"
        gifPreviewUrl="/img/openapi-demo-preview.png"
      >
        <div>
          <p className="subtext">
            Define OpenAPI decorators on your controller endpoints, enabling you
            to easily express payload shapes by simply pointing the decorator at
            a serializer.
          </p>
        </div>

        <nav>
          <Link to="/docs/openapi/controllers">
            See our OpenAPI controller guides &gt;&gt;&gt;
          </Link>
          <br />
          <Link to="/docs/openapi/serializers">
            See our OpenAPI serializer guides &gt;&gt;&gt;
          </Link>
        </nav>
      </Banner>
    </div>
  )
}
