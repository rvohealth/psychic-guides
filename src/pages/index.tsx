import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import { useEffect, useState } from 'react'
import CLI from '../components/home/sections/cli'
import Controllers from '../components/home/sections/controllers'
import FeatureTesting from '../components/home/sections/feature-testing'
import Hero from '../components/home/sections/hero'
import OpenAPI from '../components/home/sections/openapi'
import ORM from '../components/home/sections/orm'
import Repl from '../components/home/sections/repl'
import Routing from '../components/home/sections/routing'
import UnitTesting from '../components/home/sections/unit-testing'

function getBannerHeights() {
  const banners = document.querySelectorAll('.banner')

  const bannerHeightMap: [number, number][] = []
  banners.forEach((el, index) => {
    bannerHeightMap.push([index, el.getBoundingClientRect().y])
  })
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  useEffect(() => {
    document.body.dataset.location = 'home'
    document.body.dataset.scrollSection = 'hero'

    return () => {
      document.body.dataset.location = 'guides'
    }
  }, [])

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <div
        id="home-scroll-container"
        onScroll={(e) => {
          const currentScrollTop = (e.target as HTMLDivElement).scrollTop

          if (currentScrollTop <= window.innerHeight) {
            document.body.dataset.scrollSection = 'hero'
          } else {
            document.body.dataset.scrollSection = 'not-hero'
          }

          const banners = document.querySelectorAll('.banner')
          banners.forEach((el, i) => {
            const elAsDiv = el as HTMLDivElement
            const elDistanceFromTop =
              currentScrollTop +
              elAsDiv.getBoundingClientRect().top -
              window.innerHeight * 0.5

            if (i === 0)
              console.log({
                windowScrollY: window.scrollY,
                elDistanceFromTop,
                currentScrollTop,
              })

            if (
              currentScrollTop > elDistanceFromTop &&
              !elAsDiv.classList.contains('active')
            ) {
              elAsDiv.classList.add('active')
              return
            }
          })
        }}
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
      </div>

      <main></main>
    </Layout>
  )
}

// <Websockets />
// <BackgroundJobs />
