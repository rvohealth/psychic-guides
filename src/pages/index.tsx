import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import { IoChevronDownCircle as ChevronDownIcon } from 'react-icons/io5'
import Heading from '@theme/Heading'
import Logo from '../components/logo'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <div className="app-hero">
      <div className="above-night-sky">
        <Logo size="large" />
        <div>
          <div className="subtext-container">
            <p className="subtext">
              An express-driven web framework with a jaw-dropping ORM built on
              Kysely
            </p>

            <nav>
              <Link to="/docs/intro">guides</Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main></main>
    </Layout>
  )
}
