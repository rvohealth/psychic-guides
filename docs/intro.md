---
sidebar_position: 1
---

# welcome

Psychic is a node/typescript MVC-based web framework built on top of&nbsp;
[expressjs](https://expressjs.com) and
[dream ORM](https://github.com/rvohealth/dream). It provides a light wrapper around
express, gifting you a custom routing mechanism which allows one to compose routes much like
they would in Ruby on Rails, Laravel, pheonix, or most other popular MVC-based web frameworks,
and then uses express to direct the defined routes to controller methods.

```ts
// conf/routes.ts

import { PsychicRouter } from 'psychic'

export default (r: PsychicRouter) => {
  r.get('', 'Welcome#index')
  r.namespace('api', (r) => {
    r.namespace('v1', (r) => {
      r.resources('ingredients')
    })
  })
}
```

Once those routes are defined, we can add a controller to match:

```ts
// controllers/Api/V1/IngredientsController.ts
export default class ApiV1IngredientsController extends AuthedController {
  public async create() {
    const ingredient = await Ingredient.create(this.ingredientParams)
    this.created(ingredient.id)
  }

  public async index() {
    const ingredients = await Ingredient.all()
    this.ok(ingredients)
  }

  public async show() {
    const ingredient = await Ingredient.preload(['nutrition', 'macros']).find(
      this.castParam('id', 'bigint')
    )
    if (!ingredient) return this.notFound()

    this.ok(ingredient)
  }

  public async update() {
    const ingredient = await Ingredient.find(this.castParam('id', 'bigint'))
    if (!ingredient) return this.notFound()

    await ingredient.update(this.ingredientParams)
    this.noContent()
  }

  public async destroy() {
    const ingredient = await Ingredient.find(this.castParam('id', 'bigint'))
    if (!ingredient) return this.notFound()

    await ingredient.destroy()
    this.noContent()
  }

  private get ingredientParams() {
    return this.paramsFor(Ingredient)
  }
}
```

In addition, Psychic provides a full-force typescript/node/postgres driven ORM that runs on top of
[Kysely](https://kysely.dev). Modeled after the active record provided by Ruby on Rails, Dream
provides a full suite of powerful features with a robust typing system to aid you in your code
journeys.

```ts
import { Dream, BeforeCreate, BeforeUpdate, Column, Validates, Hash } from 'psychic'

export default class User extends Dream {
  public readonly get table() {
    return 'users' as const
  }

  public id: number
  public name: string
  public createdAt: Date
  public updatedAt: Date

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

Psychic also bootstraps your app with a fully functioning repl, as well as bindings to jest which allow you to cover endpoint testing, unit testing, and even feature testing (for those who are using a client integration).
