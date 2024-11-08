---
sidebar_position: 1
---

# Welcome

Psychic is a web framework built on [Express](https://expressjs.com/). Dream is an ORM built on the [Kysely query builder](https://kysely-org.github.io/kysely-apidoc/). They are inspired by the elegance, expressiveness, and convention over configuration philosphy of [Ruby on Rails](https://rubyonrails.org/) and [ActiveRecord](https://guides.rubyonrails.org/active_record_basics.html), respectively, but with the power of Typescript.

Don't Repeat Yourself (DRY), is a guiding philosophy of Dream and Psychic, revealing itself in:

- model attribute types that are derived from the database, so when you write a migration that, for example, adds an enum, the one place that change is defined is in the migration, and it automatically cascades everywhere the enum is referenced or set
- OpenAPI definitions that are fleshed out automatically from the routes file and model serializers
- `HasOne`, `HasMany`, and `BelongsTo` association decorators that encapsulate all the complexity of an association into a single declaration that, once defined, becomes an abstraction in a well defined domain
- powerful decorators like `@SoftDelete` and `@Sortable` that automatically and universally handle common use cases which would otherwise introduce complexity into your application
- cli code generators that set up models, serializers, and controllers using best practice conventions, such as controllers inheriting from an authenticated ancestor right from the start
- advanced association constructs such as polymorphism that enable models to be associated with many different model types

Together, Psycic and Dream (or even Dream alone, which can be used with other frameworks besides Psychic) provide an elegant framework for modeling complex domains, facilitating rapid development of maintainable applications.

:::info
In this guide, we will be covering the following:

- [What is Dream?](#what-is-dream)
  - [Powerful associations](#powerful-associations)
- [What is Psychic?](#what-is-psychic)
  - [Routing](#routing)
  - [Controllers](#controllers)
- [Philosophy](#philosophy)
  - [Use familiar technologies](#use-familiar-technologies)
  - [Convention over configuration](#convention-over-configuration)
- [Testing](#testing)
  - [Unit specs](#unit-specs)
  - [Feature specs](#feature-end-to-end-specs)

You may be familiar with the concepts, and want to skip ahead to [installation](/docs/installation), or to one of the primary sections of the documentation, such as:

- [routing](/docs/routing/overview)
- [controllers](/docs/controllers/overview)
- [models](/docs/models/overview)
- [serializers](/docs/serializers/overview)
- [specs](/docs/specs/overview)
- [cli](/docs/cli/overview)
  :::

## What is Dream?

At the heart of any web application is a database, with, at least generally speaking, a tightly-defined set of table schemas to guard the integrity of its data. Dream follows the conventional [Active Record](https://en.wikipedia.org/wiki/Active_record_pattern) practices for modeling data, but provides a very powerful TypeScript-driven set of features to unleash powerful autocomplete mechanisms that make even the most dense applications possible to navigate.

```ts
@SoftDelete()
export default class User extends ApplicationModel {
  public get table() {
    return 'users' as const
  }

  public id: DreamColumn<User, 'id'>
  public name: DreamColumn<User, 'name'>
  public createdAt: DreamColumn<User, 'createdAt'>
  public updatedAt: DreamColumn<User, 'updatedAt'>
  public deletedAt: DreamColumn<User, 'deletedAt'>

  @Validates('contains', '@')
  @Validates('presence')
  public email: string

  @Validates('length', { min: 4, max: 18 })
  public passwordDigest: string

  @Virtual()
  public password?: string | null

  @BeforeSave()
  public async hashPass() {
    if (this.password) this.passworDigest = await Hash.gen(this.password)
    this.password = undefined
  }

  public async checkPassword(password: string) {
    if (!this.passworDigest) return false
    return await Hash.check(password, this.passworDigest)
  }
}
```

### Powerful associations

In addition to powerful decorators for describing validations and custom scoping on your models, Dream also provides a powerful association layer, enabling you to describe rich, intimate associations with elegant simplicity:

```ts
class Post extends ApplicationModel {
  ...

  @Post.BelongsTo('User')
  public user: User

  @Post.HasMany('Comment')
  public comments: Comment[]

  @Post.HasMany('Reply', { through: 'comments' })
  public replies: Reply[]
}

const post = await Post.firstOrFail()
await post
  .joins('comments', { body: ops.ilike('%oops%') }, 'replies')
  .distinct('body')
  .order('position')
  .preload('comments', 'replies')
  .all()
// [Post{ body: 'oops' }, Post{ body: 'oops, I did it again' }]
```

> See the [Dream guides](/docs/models/overview) for more information on modeling in Dream and Psychic

## What is Psychic?

Psychic is a fully-featured, TypeScript-driven web framework. It leverages the MVC (Model, View, Controller) paradigm, providing the Dream ORM under the hood for data modeling. Philisophically, Psychic and Dream use opinionated conventions to enable seamless development, allowing beautiful type integrations to flow throughout your app with ease. By following a strict convention-over-configuration philosophy throughout our design, we enable you to write less while following best practice design concepts.

### Routing

Psychic enables you to programatically define routes, as well as their connections to controllers within your app. With these routes defined, your web server will automatically point any requests to these paths to the matching controllers.

> See our [Routing guide](/docs/routing/crud) for more information on routing

```ts
// conf/routes.ts

import { PsychicRouter } from '@rvohealth/psychic'

export default (r: PsychicRouter) => {
  r.get('', 'Welcome#index')
  r.namespace('api', (r) => {
    r.namespace('v1', (r) => {
      r.resources('ingredients')
    })
  })
}
```

### Controllers

With routes defined, you can build matching controllers to add functionality to your endpoints. Psychic deals strictly in json, so all endpoints will generally just be rendering json, if anything.

```ts
// controllers/Api/V1/IngredientsController.ts

export default class ApiV1IngredientsController extends AuthedController {
  public async create() {
    const ingredient = await Ingredient.create(this.paramsFor(Ingredient))
    this.created(ingredient.id)
  }

  public async index() {
    const ingredients = await Ingredient.all()
    this.ok(ingredients)
  }

  public async show() {
    const ingredient = await Ingredient.preload([
      'nutrition',
      'macros',
    ]).findOrFail(this.castParam('id', 'bigint'))

    this.ok(ingredient)
  }

  public async update() {
    const ingredient = await Ingredient.findOrFail(
      this.castParam('id', 'bigint')
    )
    await ingredient.update(this.paramsFor(Ingredient))
    this.noContent()
  }

  public async destroy() {
    const ingredient = await Ingredient.findOrFail(
      this.castParam('id', 'bigint')
    )
    await ingredient.destroy()
    this.noContent()
  }
}
```

As you can already see above, our Dream ORM is clearly at work to keep our code so tidy. Psychic will automatically respond with a `404` for any failures caused by `findOrFail`, and `castParam` will fail with a `400` if the incoming param does not match the described schema. These design patterns are designed to allow you to get ouot of your own way, enabling the composition of extremely simple design patterns with powerful intuitions about your needs.

> See our [Controller guides](/docs/controllers/generating) for more information on implementing controllers

## Philosophy

Psychic and Dream provide an end-to-end solution for modern web applications, without getting in the way by intervening in the front end client building process. Instead, we encourage Psychic developers to use whatever front end framework they want for prototyping their app, and we make little to no interventions, setting it up whatever way they see fit. We do not provide any templating engines, or any mechanisms for rendering anything other than JSON data, which can be consumed by whatver API consumers need to do so.

We do, however, provide a tools for composing a robust backend, as well as the testing infrastructure to cover any set of web client integrations you desire.

### Use familiar technologies

In choosing to provide a framework, we were not interested in reinventing the wheel at every turn, which is why, like most in the nodejs world, have turned to leaning on popular open source tooling to provide the underlying mechanisms of our framework. This enables us to focus on providing the important features we care about, while leaning on tools everyone is familiar with for driving the rest.

Considering, here is a breakdown of the technologies we are leaning on for our application stack:

- expressjs (drives the underlying web server)
- node-redis (adds node bindings to redis, enabling us to support both distributed websocket systems, as well as background job systems)
- bullmq (used for driving background jobs)
- socket.io (used for websockets)
- kysely (used for driving the Dream ORM)
- node-pg (used for driving the ORM)
- jest (used for driving unit and feature tests)
- playwright (used for driving feature tests)

### Convention over configuration

Since Psychic and Dream are meant to be used together, Psychic is well-fit to automatically absorb implicit configurations at the Dream layer, allowing you to define things once, rather than many times. These sensible expectations by our app enable you to compose with ease, and make changes that can flow through to the top level of your app without even needing to make changes.

## Testing

Psychic can easily act as a standalone JSON web delivery system, but it also encourages certain paradigms which enable the developer to still write end-to-end tests, as well as a rich tooling system for composing unit tests. Psychic was designed with a `BDD` philosophy in mind, which means that our system _must_ provide adequate tooling for spec'ing out our entire app.

As most in the javascript world are comfortable with [jest](https://jestjs.io), we have built our tooling to rest comfortably on top of it, allowing you to bring in custom jest plugins of your choice without any trouble from the framework. We do, however, provide some useful jest extensions to make your life easier when spec'ing in Dream and Psychic.

### Unit specs

Unit specs describe the behavior of your app. When practicing BDD, the unit specs are written before the functionality they describe, and allow you to test the behavior of your function from the outside in. Psychic and Dream provide special tools to enhance this process and make it seamless for you to interact with your app in a test environment.

> For more information, see [The Unit spec guides](/docs/specs/unit).

#### Dream (model) specs

When spec'ing your models, you can leverage special jest extensions to make assertions simple, and can very easily test all sorts of extraneous behavior using the same suite of tools:

```ts
import { describe as context } from '@jest/globals'
...

describe('User', () => {
  describe('upon creation', () => {
    context('UserSettings model creation', () => {
      it('creates a user settings model, and attaches it to the user', async () => {
        expect(await UserSettings.count()).toEqual(0)
        const user = await createUser()
        expect(await UserSettings.firstOrFail()).toMatchDreamModel(user.userSettings)
      })
    })
  })

  describe('#checkPassword', () => {
    let user: User

    beforeEach(async () => {
      user = await createUser({ password: 'howyadoin' })
    })

    context('with a valid password', () => {
      it('returns true', async () => {
        expect(await user.checkPassword('howyadoin')).toBe(true)
      })
    })

    context('with an invalid password', () => {
      it('returns false', async () => {
        expect(await user.checkPassword('invalid')).toBe(false)
      })
    })
  })
})
```

#### Controller specs

Psychic also provides helpers to enable easy endpoint testing, allowing you to hit your routes with real requests and test the response mechanisms of your app under a variety of circumstances.

```ts
// api/spec/unit/controllers/Api/V1/UsersController.spec.ts

import { specRequest as request } from '@rvohealth/psychic/spec-helpers'
import createUser from '../../../../factories/UserFactory'

describe('ApiV1UsersController', () => {
  beforeEach(async () => {
    await request.init()
  })

  describe('GET /api/v1/users/me', () => {
    async function getSession() {
      return await request.session(
        '/api/v1/signin',
        { email: 'how@yadoin', password: 'password' },
        204
      )
    }

    it('returns 204 with an authed user', async () => {
      await createUser({ email: 'how@yadoin', password: 'password' })
      const session = await getSession()
      await session.get('/api/v1/users/me').expect(204)
    })

    it('returns 401 with no authed user', async () => {
      await createUser({ email: 'how@yadoin', password: 'password' })
      await request.get('/api/v1/users/me', 401)
    })
  })
})
```

### Feature (end-to-end) specs

For those who opt into the client integration, Psychic will automatically bootstrap with Playwright to provide a headless browser you can use to test a web application end-to-end. Whenever these tests run, a psychic server will automatically be started which can be used by your client application, allowing you to test your frontend integration with your backend.

> For more information, see [The Feature spec guides](/docs/specs/feature).

```ts
// api/spec/features/visitor/signs-up.spec.ts

import User from '../../../src/app/models/User'
import clickButton from '../helpers/clickButton'
import expectContent from '../helpers/expectContent'
import fillInput from '../helpers/fillInput'
import visit from '../helpers/visit'

describe('visitor visits the signup page', () => {
  it('allows visitor to fill sign up for a new account and then log in with the same credentials', async () => {
    await visit('/signup')
    await fillInput('#email', 'hello@world')
    await fillInput('#password', 'mypassword')
    await clickButton('sign up')

    await expectContent('Log in')
    await fillInput('#email', 'hello@world')
    await fillInput('#password', 'mypassword')
    await clickButton('log in')

    await expectContent('DASHBOARD')

    const user = await User.last()
    expect(user.email).toEqual('hello@world')
    expect(await user.checkPassword('mypassword')).toEqual(true)
  })
})
```

:::tip
Wondering how to get started? A good place to go next is our [installation](/docs/installation) guide.
Not quite ready for a deep dive just yet? You can visit our [authenticating](/docs/getting-started/authenticating) guide, which will give you an idea of what it's like to build in this framework.

Otherwise, you may want to read up more on some of the major features provided by Dream and Psychic:

- [routing](/docs/routing/overview)
- [controllers](/docs/controllers/overview)
- [models](/docs/models/overview)
- [serializers](/docs/serializers/overview)
- [specs](/docs/specs/overview)
- [cli](/docs/cli/overview)
  :::
