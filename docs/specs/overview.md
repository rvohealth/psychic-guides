---
sidebar_position: 0
---

# overview

Psychic was written under a string BDD engineering culture, so having adequate testing cannot be an afterthought to our teams. However, we are in a language (nodejs, typescript) where plug-and-play mentality is a strong central thesis of the culture. As such, we wanted to provide you with a healthy testing environment, but not one that is hand-written by us, rather, one that everyone is already familiar with and used to using on a daily basis.

Given the constraints, we chose to use [jest](https://jest.io) as our test runner for running both our unit and feature test suites (though there are some key differences in how they are set up). We also chose to leave the configuration of jest up to the developer, so in a freshly-generated psychic app, you will see two scripts in your `package.json` file for running specs, `uspec` and `fspec`.

The entire jest configuration is exposed at the top level of your app, but has already been set up to be enhanced by Psychic and Dream to add extra assertion helpers for working in a Psychic app. In the spec folder, you will find two separate folders, one called `unit` and one called `feature`. The `unit` and `feature` folders will both contain special configurations that can be used to set up your tests.

:::info

- For more information on unit specs, see our [unit spec](/docs/specs/unit)
- For more information on feature specs, see our [feature spec](/docs/specs/feature)
  :::
