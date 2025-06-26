---
sidebar_position: 1
title: Monorepos
pagination_prev: null
---

When provisioning a new Psychic application, you will be asked if you want to build a monorepo or not. You may be wondering what this means and why you've been asked.

Psychic is strictly speaking a back end web framework. It does not make any attempts to bind together the back end application you are building in psychic with the front end framework you are using to leverage it, meaning we do not deliver any HTML from the back end, and provide no tools for server side rendering of your front end web frameworks.

However, if you opt into a monorepo, psychic will ask you some more questions about what stack you want to use to provision your client application. You will be asked about provisioning both a "client", as well as an "admin" application. If you opt into either of these by choosing one of the provided front end frameworks, psychic will use either `vite` or `nextjs` (depending on your choice) to provision a boilerplate client for you.

Psychic makes no adjustments to the client application that is built, and does not tamper with, nor attempt to import or hoist, the client code in any way as you develop your application. Instead, it does the following:

- creates an `api` directory, and provisions your Psychic application within it
- creates either a `client` directory, `admin` directory, or both, depending on your selection, and provisions the requested frameworks into those folders
- adds helper scripts for launching your client and admin apps to the `api/package.json` file
- provides back end feature test bindings to launch your front end applications in `spec/features/setup/globalSetup.ts`
- provides bindings in `src/conf/app.ts` to start your front end application servers whenever you run `CLIENT=1 yarn dev`

## Customization

The front end application options provided during app provisioning may not be ideal for your application's needs. In this case, you can select any option and allow Psychic to provision a client anyways. Once the provisioning is complete, simply delete the client/admin directory and re-provision using whatever tool you want to build a new version of that directory.

Since psychic's coupling mechanisms are so loose, there is hardly anything left to do once this is done. You may need to adjust the commands for starting your dev server. To do this, open the `api/package.json` file, and edit the corresponding scripts (`client`, `client:fspec`, `admin`, `admin:fspec`) to make adjustments to the way that those clients are launched from the back end.

## Opting out

If you opt out of monorepo, Psychic will provision your entire back end into the root directory of your project. You are still equipped with all the feature spec tools needed to test a client application, since you very well may have your client application in an isolated repo, but still want to be able to drive it using Psychic's feature tests. This approach is very much possible, and this level of flexiblity is intentionally provided, since many will likely prefer this approach to building their applications.
