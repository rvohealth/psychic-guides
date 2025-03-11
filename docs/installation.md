---
sidebar_position: 2
---

# Installation

To create a new psychic app, you can use the psychic app provisioner via npx, like so:

```bash
# if you would like your app's name to be "howyadoin"
npx @rvoh/create-psychic howyadoin
```

This will prompt you to ask a few questions, and then provision a new psychic app for you in the "howyadoin" folder of your current directory. All of your dependencies will be automatically installed (for both your server and client apps, if you are generating with a client) and committed to a new git repo.

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
