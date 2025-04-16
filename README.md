# Psychic guides

Leverages [Docusaurus](https://docusaurus.io/) to provide a documentation site for [Dream](https://github.com/rvohealth/dream) and [Psychic](https://github.com/rvohealth/psychic) repositories.

### Installation

```
yarn
```

### Local Development

```
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
yarn build
```

### Search

To leverage the built-in local search locally, you must run the following:

```sh
yarn build && yarn serve
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Publishing

This documentation is deployed via Netlify, the hooks for which are built into the Github repository for this project.

### Updating dependencies

Follow this guide for updating dependencies: <https://docusaurus.io/docs/migration>

```bash
yarn clear # remove existing build
rm -rf node_modules yarn.lock # destroy lock
yarn # re-install
```

## Questions?

- **Ask them on [Stack Overflow](https://stackoverflow.com)**, using the `[psychic]` tag.

## Contributing

Psychic is an open source library, so we encourage you to actively contribute. Visit our [Contributing](https://github.com/rvohealth/psychic-guides/CONTRIBUTING.md) guide to learn more about the processes we use for submitting pull requests or issues.

Are you trying to report a possible security vulnerability? Visit our [Security Policy](https://github.com/rvohealth/psychic-guides/SECURITY.md) for guidelines about how to proceed.
