---
sidebar_position: 0
pagination_prev: null
ai_summary: Psychic uses Vitest for both unit and feature test suites. Configuration exposed at top level. Two spec folders: unit and features. Enhanced with extra assertion helpers for Psychic apps. See unit and feature spec guides for details.
---

# overview

Psychic was written under a strong BDD engineering culture, so having adequate testing cannot be an afterthought to our teams. However, we are in a language (Node.js, TypeScript) where plug-and-play mentality is a strong central thesis of the culture. As such, we wanted to provide you with a healthy testing environment, but not one that is hand-written by us, rather, one that everyone is already familiar with and used to using on a daily basis.

Given the constraints, we chose to use [Vitest](https://vitest.dev) as our test runner for running both our unit and feature test suites (though there are some key differences in how they are set up). We also chose to leave the configuration of Vitest up to the developer, so in a freshly-generated Psychic app, you will see two scripts in your `package.json` file for running specs, `uspec` and `fspec`.

The entire Vitest configuration is exposed at the top level of your app, but has already been set up to be enhanced by Psychic and Dream to add extra assertion helpers for working in a Psychic app. In the spec folder, you will find two separate folders, one called `unit` and one called `features`. The `unit` and `features` folders will both contain special configurations that can be used to set up your tests.

:::info
For more info, see our detailed guides

- [unit spec](/docs/specs/unit)
- [feature spec](/docs/specs/feature)
:::
