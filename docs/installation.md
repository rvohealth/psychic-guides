---
sidebar_position: 2
---

:::warning
Dream and psychic are in a pre-release stage. We are still refining some cosmetic aspects to the framework, but that code is coming in rapidly, and we anticipate this will be ready for use by April 1st, 2025. In the mean time, feel free to tinker to your heart's desire!
:::

# Installation

To create a new psychic app, you can use the psychic app provisioner via npx, like so:

```bash
# if you would like your app's name to be "howyadoin"
npx @rvoh/create-psychic howyadoin
```

This will prompt you to ask a few questions, and then provision a new psychic app for you in the "howyadoin" folder of your current directory. All of your dependencies will be automatically installed (for both your server and client apps, if you are generating with a client) and committed to a new git repo.

## package managers

Though our app provisioner is driven by `npx`, we offer you a choice when provisioning your new Psychic application between `yarn`, `npm`, and `pnpm`. Most of our examples throughout the documentation will reference `yarn`, since this is the default, tried and true method used by the core team. However, if you would rather not use yarn (believe us, we get it, the nodejs package management ecosystem is in chaos right now), we recommend you use one of the other options we formally support.

You may be tempted to reach for `bun`, but we have not formally built our application to support it just yet. As of now, bun has issues with TypeScript 5 generators [See here for updates on this issue](https://github.com/oven-sh/bun/issues/4122). There could be a potential path forward for bun, but as of right now we recommend you stick with one of the package managers we officially support.

## esm

Psychic and Dream libraries are built on modern esm patterns, including the latest TypeScript 5 decorators. There is a very large rift in the nodejs community due to the move towards esm. Most important libraries out there have made the transition at this point, but several are stuck behind, especially those that rely on previous proposals for TypeScript decorators, which were much more friendly with regards to meta programming, and have made it very difficult for those stuck behind to adapt.

## local dependencies

In order for you to run your local dev server, you will need to have the following other dependencies installed:

```bash
node >= 20.9.0
postgres >= 13.4
redis >= 7.2.0 # (only if using websockets or workers)
```

You will need postgres and redis to be running locally for this to work, and if your credentials are different than those set up in your local `.env` and `.env.test` files, those credentials will need to be set/updated to reflect.

## installing Dream without Psychic

This is possible, but we have not completed the provisioning tools necessary to provide this feature just yet.
