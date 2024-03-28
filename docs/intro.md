---
sidebar_position: 1
---

# welcome

Psychic is a node/typescript MVC-based web framework built on top of&nbsp;
[expressjs](https://expressjs.com) and
[dream ORM](https://github.com/@rvohealth/dream). It provides a light wrapper around
express, gifting you a custom routing mechanism which allows one to compose routes much like
they would in Ruby on Rails, Laravel, pheonix, or most other popular MVC-based web frameworks,
and then uses express to direct the defined routes to controller methods.

```ts
// conf/routes.ts

import { PsychicRouter } from 'psychic'

export default (r: PsychicRouter) => {
  r.get('/', 'welcome#index')
  r.namespace('api', (r) => {
    r.namespace('v1', (r) => {
      r.resources('users', { only: ['create', 'index'] })
    })
  })
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
