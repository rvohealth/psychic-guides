---
sidebar_position: 1
---

# welcome

Psychic is a fully-featured, TypeScript-driven web framework. It leverages the MVC (Model, View, Controller) paradigm, providing the Dream ORM under the hood for data modeling. Philisophically, Psychic and Dream use opinionated conventions to enable seamless development, allowing beautiful type integrations to flow throughout your app with ease. By following a strict convention-over-configuration philosophy throughout our design, we enable you to write less while following best practice design concepts.

## Routing

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

## Controllers

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
      this.castParam('id', 'bigint'),
    )
    await ingredient.update(this.paramsFor(Ingredient))
    this.noContent()
  }

  public async destroy() {
    const ingredient = await Ingredient.findOrFail(
      this.castParam('id', 'bigint'),
    )
    await ingredient.destroy()
    this.noContent()
  }
}
```

As you can already see above, a powerful ORM is clearly at work to keep our code so tidy. Psychic will automatically respond with a `404` for any failures caused by `findOrFail`, and `castParam` will fail with a `400` if the incoming param does not match the described schema.

> See our [Controller guides](/docs/controllers/generating) for more information on implementing controllers

## Dream

At the heart of any web application is a database, with, at least generally speaking, a tightly-defined set of table schemas to guard the integrity of it's data. Dream follows the conventional [Active Record](https://en.wikipedia.org/wiki/Active_record_pattern) practices for modeling data, but provides a very powerful TypeScript-driven set of features to unleash powerful autocomplete mechanisms that make even the most dense applications possible to navigate.

```ts
import { Dream, BeforeCreate, BeforeUpdate, Column, Validates, Hash } from '@rvohealth/psychic'

@SoftDelete()
export default class User extends Dream {
  public readonly get table() {
    return 'users' as const
  }

  public id: DreamColumn<User, 'id'>
  public name: DreamColumn<User, 'name'>
  public createdAt: DreamColumn<User, 'createdAt'>
  public updatedAt: DreamColumn<User, 'updatedAt'>

  @Validates('contains', '@')
  @Validates('presence')
  public email: string

  @Validates('length', { min: 4, max: 18 })
  public passwordDigest: string

  @Virtual()
  public password?: string | null

  @BeforeCreate()
  @BeforeUpdate()
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

In addition to powerful decorators for describing validations and custom scoping on your models, Dream also provides a powerful association layer, enabling you to describe rich, intimate associations with elegant simplicity:

```ts
class Post extends ApplicationModel {
  ...

  @BelongsTo(() => User)
  public user: User

  @HasMany(() => Comment)
  public comments: Comment[]

  @HasMany(() => Reply, { through: 'comments' })
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

> See the [Dream guides](/docs/models/generating) for more information on modeling in Dream and Psychic

## Testing

Psychic can easily act as a standalone JSON web delivery system, but it also encourages certain paradigms which enable the developer to still write end-to-end tests, as well as a rich tooling system for composing unit tests. Psychic was designed with a `BDD` philosophy in mind, which means that our system _must_ provide adequate tooling for spec'ing out our entire app.

As most in the javascript world are comfortable with [jest](NEED_LINK), we have built our tooling to rest comfortably on top of it, allowing you to bring in custom jest plugins of your choice without any trouble from the framework. We do, however, provide some useful jest extensions to make your life easier when spec'ing in Dream and Psychic.

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
        204,
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
