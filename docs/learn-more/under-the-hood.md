---
sidebar_position: 2
title: Under the hood
pagination_next: null
ai_summary: Dream uses Kysely for database queries, generates types from database introspection. Psychic wraps Express with MVC patterns, automatic OpenAPI generation. Decorators require syncing for types. Circular dependencies handled with lookup method. Node.js >= 22 recommended for decorator support.
---

## Dream

Dream provides the underlying ORM in a Psychic application. As such, it does not contain any web server bindings, nor any of the other framework-related bells and whistles that Psychic provides. Dream is simply an ORM. However, in order for that ORM to be useful in a typescript context, it also provides the necessary tools for:

- generating new models
- generating new migrations
- running and rolling back migrations
- db type introspection utils
- CalendarDate and DateTime classes, powered by [luxon](https://moment.github.io/luxon/#/)

### kysely

Dream uses [Kysely](https://kysely.dev) to drive its database engine, which means that all queries executed by Dream will run through the Kysely engine. Kysely uses database introspection to build types from your database, which it can then be supplied with to provide powerful type completion mechanisms to drive your Kysely queries. Dream by default bootstraps the migration engine to automatically re-sync these types whenever a new migration is run, or the database is reset. It will also happen any time `pnpm psy sync` is called.

The types generated for kysely are located in `src/types/db.ts`. They take slight augmentations from Dream, so that their datetime and date types can properly sync up with the DateTime and CalendarDate classes provided by Dream.

## Psychic

Psychic provides the web server bindings for a Psychic application. You can essentially think of it as a light wrapper around [express](https://expressjs.com). However, Psychic uses conventional MVC (Model-View-Controller) patterns, so it provides a custom routing system to point routes to controllers within your application, further enhancing these controllers with powerful utilities to bind with Dream models and Serializers and automatically generate powerful openapi documents for your application.

### express

Express.js is a very popular, minimalistic web framework for Node.js. We have selected it so that those interested in tapping into the bountiful dev tools built around the Express.js ecosystem, they would still have a way to do that when using Psychic. By default, we configure Express to leverage the `cors`, `cookie`, and `body-parser` libraries, but exposes the configuration to you in `conf/app.ts`, enabling you to easily make adjustments. In addition, we provide lifecycle hooks for startup, enabling you to patch in Express middleware to your heart's desire!

### openapi

OpenAPI is an essential tool both for communicating your API to other teams, as well as for using codegen tools to auto-build API mechanisms and other utilities to ease the burden of integrating with your backend services. That being said, it is cumbersome to maintain OpenAPI documents, and tricky to keep them up to date with changes in your application's code.

Psychic provides powerful integration with Dream models and serializers to automatically understand and generate clean OpenAPI documents that represent your schema, and automatically shift as changes are made to your models and serializers, meaning that you no longer have to maintain your OpenAPI documents to coerce them into reflecting the underlying changes to your models, it will now happen automatically for you.

## decorators

Since the typescript community prefers decorators for class composition, we have leaned into them for architecting our apis. The composition element of it is quite friendly, but from a typing perspective, it is a bit of a nightmare. First of all, the decorator api has shifted radically in the accepted proposal for TypeScript >= 5, and the new api makes metaprogramming quite a hurdle. In addition to a myriad of odd hoops that must be jumped through to achieve the same level of class composition as in earlier decorator proposals, there were never _any_ decorator proposals in the TypeScript ecosystem that ever could capture types during composition and associate them with their decorated properties. Whenever a decorator is called, there is no way to implicitly bind the type system from the arguments being passed to the decorator to the property or method it is decorating, leaving us in a strange bind when we want to provide type protections to the underlying properties or methods.

As such, we have leaned into using syncing functions provided by both Dream and Psychic to read your models, controllers, services, serializers, and configuration, and use all of it to generate type files that they can then consume to provide your application's types. These syncing operations can correctly read the decorated classes and cache the relevant type data for consumption, and syncing must happen anyways to correctly generate the updated types for Kysely, so we are simply tapping into an existing, essential tool and just having it do a little more to make up for the pains of decorators.

## circular dependencies

Circular dependencies are one of the most frustrating bugs that can endlessly plague you in the Node.js world. It happens when a file imports from another file, which then, either eventually or immediately, imports back from the original file and uses that for anything other than typing. If this happens, Node.js will at some point in the import cycle have undefined for one or more of the classes involved, leaving your application to error out in bizarre and unexpected ways. This usually only happens when your application grows to a certain scale.

For example, this code demonstrates a pattern encouraged by our ORM. It will break on a version of Nodejs < 22, because the usage of User in the call to `DreamSerializer` creates a circular reference for the User class, since User is used as a real argument, instead of just being used for typing.

```ts
// serializers/UserSerializer.ts
export const UserSerializer = (user: User) =>
  // the use of User in the below line would create a circular
  // reference issue in Node < 22
  DreamSerializer(User, user).attribute('email')

// models/User.ts
class User extends ApplicationModel {
  public get serializers() {
    return {
      default: UserSerializer,
    }
  }
}
```

In the original Dream architecture (well before the project was made public or open sourced), we discovered many of these circular reference headaches in the import cycles between our models and serializers, as well as between models and other models, since they would often both need to import from and reference each other. We solved this problem before hitting v1 by refactoring the serializer layer of dream to use top-level callback functions, since these are safe from circular reference issues. Additionally, we provided an internal global name system for associating models with each other to avoid any circular references there, since all model associations are driven by string refs instead of actual model classes.

To support this, Dream has a built in `ioc` (inversion of control) system to enable Dream to capture all of your models and serializers, namespace them (based on their file path, or file path _and_ export name for serializers), and then build association mappings between your classes safely, without tripping up any circular import issues that can plague node orms. Consequentially, and to your benefit, the [lookup](/docs/models/lookup) method provided by Dream offers devs an escape hatch in scenarios where they insist on commiting this nodejs crime.

## Syncing

Dream and Psychic both rely on special type-syncing operations to happen in certain contexts. The generated files produced by these operations go into the `src/types` folder within your app, and are then fed back into your application via a few entry points. For Dream, these types are fed back into your application via the `ApplicationModel` class, automatically created for you whenever you provision a new Psychic application.

```ts
import { Dream } from '@rvoh/dream'
import { DBClass } from '../../types/db.js'
import { globalSchema, schema } from '../../types/dream.js'

export default class ApplicationModel extends Dream {
  public declare DB: DBClass

  public override get schema() {
    return schema
  }

  public override get globalSchema() {
    return globalSchema
  }
}
```

Psychic types are similarly fed back into your application via the `ApplicationController` class

```ts
import { PsychicController, PsychicOpenapiNames } from '@rvoh/psychic'
import psychicTypes from '../../types/psychic.js'

export default class ApplicationController extends PsychicController {
  public get psychicTypes() {
    return psychicTypes
  }
}
```

These same types are also fed into base classes provided by the [@rvoh/psychic-workers](https://github.com/rvohealth/psychic-workers) package, but these will only be present in your application if you opted into workers when provisioning your psychic application.

### When to sync

As mentioned previously, syncing will happen automatically for you whenever you run migrations. However, other changes within your application will also require you to re-sync types, such as:

- generating (or manually adding) a new model, migration, serializer, or controller
- renaming a model or serializer
- changing a route
- adding a new OpenAPI decorator to a controller
- changing an openapi configuration for psychic (using `psy.set('openapi', ...)`)
- adding new queues or workstreams to your workers initializer (only if you are using @rvoh/psychic-workers)

For example, say you just generated a new `Post` model. If you open up the `Post` model, you will also be assaulted with a barrage of type errors. Fear not, this is all normal. Our type system is incredibly strict, and it does not yet know about the Post model you just generated. To fix this, you can simply run `pnpm psy db:migrate` to run migrations for your new model and regenerate the types. Once this is done, your editor should no longer be showing any type errors. If it is, it can sometimes be necessary to force TypeScript to reload, or to get your editor to reload the file, so that it can pick up on the changes that were written to those files outside your editor, but it should just automatically clear all the type errors in those files.

Be sure to commit your changes to files in the `src/types` folder, since these will enable other developers to automatically pick up on the shifts to schema as well without having to sync.

### dream

In addition to the types generated by kysely, the Dream library itself is also dependent on generated types to supply your application with all the type helpers it needs to perform correctly. These types are generated to the `src/types/dream.ts` file, and are used to supply Dream with information about how associated models are connected to eachother, amongst other things.

### psychic

Though the types required by psychic are minimal, it does perform some type syncing endeavors as part of the sync hook lifecycle as well, mainly to supply top-level openapi configuration information to your app. However, sync hooks in Psychic are able to exploit custom return values as part of the hook, which enable custom plugins to write their types in as part of the psychic types file. The workers package provided by Psychic takes advantage of this to write information about your application's queues to the types file, which is used for type completion when setting background job options on your backgrounded and scheduled services and models. The types file for psychic can be found at `src/types/psychic.ts`
