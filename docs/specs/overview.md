---
sidebar_position: 0
pagination_prev: null
ai_summary: "Psychic uses Vitest for both unit and feature test suites, run BDD-style against real database records built by factories, never stubs of Dream internals. Configuration exposed at top level. Spec folders: unit, features, and factories. Enhanced with extra assertion helpers for Psychic apps. See unit and feature spec guides for details."
---

# overview

Psychic was written under a strong BDD engineering culture, so having adequate testing cannot be an afterthought to teams. However, we are in a language (Node.js, TypeScript) where plug-and-play mentality is a strong central thesis of the culture. As such, we wanted to provide you with a healthy testing environment, but not one that is hand-written by us, rather, one that everyone is already familiar with and used to using on a daily basis.

Write the failing spec first, then implement. Every bug fix should add the missing regression spec before the fix lands; otherwise the same behavior can regress without warning.

Given the constraints, we chose to use [Vitest](https://vitest.dev) as the test runner for running both unit and feature test suites (though there are some key differences in how they are set up). We also chose to leave the configuration of Vitest up to the developer, so in a freshly-generated Psychic app, you will see two scripts in your `package.json` file for running specs, `uspec` and `fspec`.

The entire Vitest configuration is exposed at the top level of your app, but has already been set up to be enhanced by Psychic and Dream to add extra assertion helpers for working in a Psychic app. In the spec folder, you will find three special folders: `unit` and `features` hold the specs themselves, and `factories` holds the data-creation helpers both suites rely on.

Specs are written BDD-style: they describe outcomes ("given X, the user sees Y"), not implementation. Tests run against real database records built by factories — Psychic's testing conventions actively discourage stubbing or mocking Dream internals like `.find()` or `.create()`.

:::info Every bug is a missing spec
When a bug is discovered after the fact — in QA, in production logs, during an audit — the bug itself is evidence that an automated test was missing. Write the regression spec **before** committing the fix, even when the fix is a one-line change. Once the fix is committed, the urgency to add the spec evaporates and the gap stays open.
:::

:::info
For more info, see the detailed guides

- [unit spec](/docs/specs/unit)
- [feature spec](/docs/specs/feature)
:::
