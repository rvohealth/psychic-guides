---
sidebar_position: 2
---

# installation

In order to get started with psychic, you will first need to download the&nbsp;
[psychic cli](https://github.com/rvohealth/psychic-cli"). This package is
really only needed to get a new app up and running. Once it is, you will use yarn scripts to
access the psychic cli, which will be useful for running migrations, generating resources,
starting your development server, etc...

```bash
yarn global add https://github.com/@rvohealth/psychic
```

Once done, you can use the global cli to provision a new psychic app, simply run `psy new myapp`, like so:

```bash
# replace "myapp" with the name of your app
psy new myapp
```

This will prompt you to ask a few questions, and then provision a new psychic app for you in the "myapp" folder of your current directory. All of your dependencies will be automatically installed (for both your server and client apps, if you are generating with a client) and committed to a new git repo.

For more information, see [the new app guides](/docs/getting-started/new-app).
