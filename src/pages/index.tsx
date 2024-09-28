import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Controllers from '../components/home/sections/controllers'
import FeatureTesting from '../components/home/sections/feature-testing'
import Hero from '../components/home/sections/hero'
import OpenAPI from '../components/home/sections/openapi'
import ORM from '../components/home/sections/orm'
import Repl from '../components/home/sections/repl'
import Routing from '../components/home/sections/routing'
import UnitTesting from '../components/home/sections/unit-testing'
import CLI from '../components/home/sections/cli'

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <Hero />
      <ORM />
      <Controllers />
      <Routing />
      <UnitTesting />
      <FeatureTesting />
      <OpenAPI />
      <Repl />
      <CLI />

      <main></main>
    </Layout>
  )
}

// <Hero />
// <ORM />
// <Controllers />
// <Routing />
// <OpenAPI />
// <Serializers />
// <UnitTesting />
// <FeatureTesting />
// <Repl />
// <CLI />
// <Websockets />
// <BackgroundJobs />
