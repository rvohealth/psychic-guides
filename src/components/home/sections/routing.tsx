import Link from '@docusaurus/Link'
import Banner from '../banner'

export default function Routing() {
  return (
    <div className="app-routing app-section">
      <h2>
        <Link to="/docs/routing/overview">Routing</Link>
      </h2>

      <div className="main-text">
        <div className="paragraph-container">
          <p>
            To provide mechanisms to direct specific routes to your controllers, Psychic provides you with an
            elegant routing solution. Take advantage of resourceful routing patterns and elegant callback
            mechanisms to create beautiful nested route patterns.
          </p>
        </div>
      </div>

      <Banner
        gifUrl="/img/routing-crud-demo.gif"
        gifPreviewUrl="/img/routing-crud-demo-preview.png"
        orientation="right"
      >
        <p className="subtext">express RESTful routes programatically</p>

        <nav>
          <Link to="/docs/routing/rest">See our REST guides &gt;&gt;&gt;</Link>
        </nav>
      </Banner>

      <Banner title="namespacing" gifPreviewUrl="/img/routes-demo-preview.png" gifUrl="/img/routes-demo.gif">
        <p className="subtext">Leverage namespace and scope methods to group route expressions together</p>

        <nav>
          <Link to="/docs/routing/namespacing">See our namespacing guides &gt;&gt;&gt;</Link>
        </nav>
      </Banner>
    </div>
  )
}
