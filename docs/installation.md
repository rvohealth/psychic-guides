---
sidebar_position: 2
---

# Installation

In order to get started with psychic, you will first need to install the [psychic](https://github.com/rvohealth/psychic") package globally. The global CLI is really only needed to get a new app up and running. Once it is, you will use yarn scripts to access the non-global psychic cli, which will be useful for running migrations, generating resources, starting your development server, etc...

```bash
npm i -g @rvoh/psychic-cli
```

Once done, you can use the global cli to provision a new psychic app, simply run `psy new myapp`, like so:

```bash
# replace "myapp" with the name of your app
psy new myapp
```

This will prompt you to ask a few questions, and then provision a new psychic app for you in the "myapp" folder of your current directory. All of your dependencies will be automatically installed (for both your server and client apps, if you are generating with a client) and committed to a new git repo.

For more information, see [the new app guides](/docs/tutorials/new-app).

## local dependencies

In order for you to run your local dev server, you will need to have the following other dependencies installed:

```bash
node >= 20.9.0
postgres >= 13.4
redis >= 7.2.0
```

You will need postgres and redis to be running locally for this to work, and if your credentials are different than those set up in your local `.env` and `.env.test` files, those credentials will need to be set/updated to reflect.

## installing Dream without Psychic

Though we don't encourage it, Dream can be used without an encapsulating Psychic app. To do this, you can install dream globally.

```bash
yarn global add https://github.com/@rvohealth/dream
```

Once done, you can use the global cli to provision a new dream app, simply run `dream new myapp`, like so:

```bash
dream new myapp
```

Once finished answering the cli's prompt, a new app will be bootstrapped for you which contains the bear bindings for a dream app, but no psychic app attached to it.

## Integrating dream into an existing application

If you have an existing web application written in typescript, and you'd like to bring in `Dream` as a dependency without creating a brand new app, you can use the `init` command

```bash
cd my/project/folder
dream init
```

The cli will prompt you with a few questions so it can build out a valid configuration for you, and then builds out the necessary infrastructure within your app to facilitate a dream structure.

:::warning
This feature is experimental, and it is still recommended that you use Dream and Psychic together to get the full benefits of the framework.
:::
