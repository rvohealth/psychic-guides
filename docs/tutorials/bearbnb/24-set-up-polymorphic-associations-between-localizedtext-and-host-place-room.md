---
title: Set up polymorphic associations between LocalizedText and Host/Place/Room
---

# Set up polymorphic associations between LocalizedText and Host/Place/Room

## Commit Message

````
Set up polymorphic associations between LocalizedText and Host/Place/Room
Create a default LocalizedText for each Host/Place/Room

```console
pnpm psy db:migrate
pnpm uspec spec/unit/models
````

Also flesh out the LocalizedText controller. Since LocalizedText belongs to different types (Host/Place/Room), restricting the controller to only allow access to owned LocalizedText requires a different strategy. The switch statement used is future proofed so that if LocalizedText is added to another model in the future, access will automatically be restricted until it is explicitly added to the controller. Note that not-found (404), is preferred over forbidden (403), so as to avoid giving away information about the presence or lack thereof of the target. This also aligns with the not-found response returned when `user.associationQuery('<some-association').findOrFail(this.castParam('id', 'bigint'))` is used to limit access to owned resources.

Change the controller from `scrollPaginate` to `many` since we won't ever, practically speaking, have so many different translations as to require pagination.

```console
pnpm uspec spec/unit/controllers/V1/Host/LocalizedTextsController.spec.ts
```

Before committing, ensure all specs pass:

```console
pnpm uspec
```

````

## Changes

```diff
diff --git a/api/spec/factories/LocalizedTextFactory.ts b/api/spec/factories/LocalizedTextFactory.ts
index 0df341b..638e4f4 100644
--- a/api/spec/factories/LocalizedTextFactory.ts
+++ b/api/spec/factories/LocalizedTextFactory.ts
@@ -1,10 +1,12 @@
-import { UpdateableProperties } from '@rvoh/dream/types'
 import LocalizedText from '@models/LocalizedText.js'
+import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from './PlaceFactory.js'

 let counter = 0

 export default async function createLocalizedText(attrs: UpdateableProperties<LocalizedText> = {}) {
   return await LocalizedText.create({
+    localizable: attrs.localizable ? null : await createPlace(),
     locale: 'en-US',
     title: `LocalizedText title ${++counter}`,
     markdown: `LocalizedText markdown ${counter}`,
diff --git a/api/spec/unit/controllers/V1/Host/LocalizedTextsController.spec.ts b/api/spec/unit/controllers/V1/Host/LocalizedTextsController.spec.ts
index 9cfebae..7306040 100644
--- a/api/spec/unit/controllers/V1/Host/LocalizedTextsController.spec.ts
+++ b/api/spec/unit/controllers/V1/Host/LocalizedTextsController.spec.ts
@@ -1,6 +1,9 @@
 import LocalizedText from '@models/LocalizedText.js'
 import User from '@models/User.js'
-import createLocalizedText from '@spec/factories/LocalizedTextFactory.js'
+import createHost from '@spec/factories/HostFactory.js'
+import createHostPlace from '@spec/factories/HostPlaceFactory.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+import createRoomDen from '@spec/factories/Room/DenFactory.js'
 import createUser from '@spec/factories/UserFactory.js'
 import { RequestBody, session, SpecRequestType } from '@spec/unit/helpers/authentication.js'

@@ -13,76 +16,283 @@ describe('V1/Host/LocalizedTextsController', () => {
     request = await session(user)
   })

-  describe('PATCH update', () => {
-    const updateLocalizedText = async <StatusCode extends 204 | 400 | 404>(
-      localizedText: LocalizedText,
-      data: RequestBody<'patch', '/v1/host/localized-texts/{id}'>,
-      expectedStatus: StatusCode
-    ) => {
-      return request.patch('/v1/host/localized-texts/{id}', expectedStatus, {
-        id: localizedText.id,
-        data,
+  context('belonging to a Host', () => {
+    let localizedText: LocalizedText
+
+    beforeEach(async () => {
+      const host = await createHost({ user })
+      localizedText = await host.associationQuery('localizedTexts').firstOrFail()
+    })
+
+    describe('PATCH update', () => {
+      const updateLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        data: RequestBody<'patch', '/v1/host/localized-texts/{id}'>,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.patch('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+          data,
+        })
+      }
+
+      it('updates the LocalizedText', async () => {
+        await updateLocalizedText(
+          localizedText,
+          {
+            locale: 'es-ES',
+            title: 'Updated LocalizedText title',
+            markdown: 'Updated LocalizedText markdown',
+          },
+          204,
+        )
+
+        await localizedText.reload()
+        expect(localizedText.locale).toEqual('es-ES')
+        expect(localizedText.title).toEqual('Updated LocalizedText title')
+        expect(localizedText.markdown).toEqual('Updated LocalizedText markdown')
+      })
+
+      context('a LocalizedText created by another Host', () => {
+        it('is not updated', async () => {
+          const otherHost = await createHost()
+          localizedText = await otherHost.associationQuery('localizedTexts').firstOrFail()
+          const originalLocale = localizedText.locale
+          const originalTitle = localizedText.title
+          const originalMarkdown = localizedText.markdown
+
+          await updateLocalizedText(
+            localizedText,
+            {
+              locale: 'es-ES',
+              title: 'Updated LocalizedText title',
+              markdown: 'Updated LocalizedText markdown',
+            },
+            404,
+          )
+
+          await localizedText.reload()
+          expect(localizedText.locale).toEqual(originalLocale)
+          expect(localizedText.title).toEqual(originalTitle)
+          expect(localizedText.markdown).toEqual(originalMarkdown)
+        })
+      })
+    })
+
+    describe('DELETE destroy', () => {
+      const destroyLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.delete('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+        })
+      }
+
+      it('deletes the LocalizedText', async () => {
+        await destroyLocalizedText(localizedText, 204)
+
+        expect(await LocalizedText.find(localizedText.id)).toBeNull()
       })
-    }

-    it('updates the LocalizedText', async () => {
-      const localizedText = await createLocalizedText({ user })
+      context('a LocalizedText created by another Host', () => {
+        it('is not deleted', async () => {
+          const otherHost = await createHost()
+          localizedText = await otherHost.associationQuery('localizedTexts').firstOrFail()

-      await updateLocalizedText(localizedText, {
-        locale: 'es-ES',
-        title: 'Updated LocalizedText title',
-        markdown: 'Updated LocalizedText markdown',
-      }, 204)
+          await destroyLocalizedText(localizedText, 404)

-      await localizedText.reload()
-      expect(localizedText.locale).toEqual('es-ES')
-      expect(localizedText.title).toEqual('Updated LocalizedText title')
-      expect(localizedText.markdown).toEqual('Updated LocalizedText markdown')
+          expect(await LocalizedText.find(localizedText.id)).toMatchDreamModel(localizedText)
+        })
+      })
     })
+  })

-    context('a LocalizedText created by another User', () => {
-      it('is not updated', async () => {
-        const localizedText = await createLocalizedText()
-        const originalLocale = localizedText.locale
-        const originalTitle = localizedText.title
-        const originalMarkdown = localizedText.markdown
+  context('belonging to a Place', () => {
+    let localizedText: LocalizedText

-        await updateLocalizedText(localizedText, {
-          locale: 'es-ES',
-          title: 'Updated LocalizedText title',
-          markdown: 'Updated LocalizedText markdown',
-        }, 404)
+    beforeEach(async () => {
+      const host = await createHost({ user })
+      const place = await createPlace()
+      await createHostPlace({ host, place })
+      localizedText = await place.associationQuery('localizedTexts').firstOrFail()
+    })
+
+    describe('PATCH update', () => {
+      const updateLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        data: RequestBody<'patch', '/v1/host/localized-texts/{id}'>,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.patch('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+          data,
+        })
+      }
+
+      it('updates the LocalizedText', async () => {
+        await updateLocalizedText(
+          localizedText,
+          {
+            locale: 'es-ES',
+            title: 'Updated LocalizedText title',
+            markdown: 'Updated LocalizedText markdown',
+          },
+          204,
+        )

         await localizedText.reload()
-        expect(localizedText.locale).toEqual(originalLocale)
-        expect(localizedText.title).toEqual(originalTitle)
-        expect(localizedText.markdown).toEqual(originalMarkdown)
+        expect(localizedText.locale).toEqual('es-ES')
+        expect(localizedText.title).toEqual('Updated LocalizedText title')
+        expect(localizedText.markdown).toEqual('Updated LocalizedText markdown')
+      })
+
+      context('a LocalizedText associated with a Place belonging to a different Host', () => {
+        it('is not updated', async () => {
+          const otherPlace = await createPlace()
+          localizedText = await otherPlace.associationQuery('localizedTexts').firstOrFail()
+          const originalLocale = localizedText.locale
+          const originalTitle = localizedText.title
+          const originalMarkdown = localizedText.markdown
+
+          await updateLocalizedText(
+            localizedText,
+            {
+              locale: 'es-ES',
+              title: 'Updated LocalizedText title',
+              markdown: 'Updated LocalizedText markdown',
+            },
+            404,
+          )
+
+          await localizedText.reload()
+          expect(localizedText.locale).toEqual(originalLocale)
+          expect(localizedText.title).toEqual(originalTitle)
+          expect(localizedText.markdown).toEqual(originalMarkdown)
+        })
+      })
+    })
+
+    describe('DELETE destroy', () => {
+      const destroyLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.delete('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+        })
+      }
+
+      it('deletes the LocalizedText', async () => {
+        await destroyLocalizedText(localizedText, 204)
+
+        expect(await LocalizedText.find(localizedText.id)).toBeNull()
+      })
+
+      context('a LocalizedText associated with a Place belonging to a different Host', () => {
+        it('is not deleted', async () => {
+          const otherPlace = await createPlace()
+          localizedText = await otherPlace.associationQuery('localizedTexts').firstOrFail()
+
+          await destroyLocalizedText(localizedText, 404)
+
+          expect(await LocalizedText.find(localizedText.id)).toMatchDreamModel(localizedText)
+        })
       })
     })
   })

-  describe('DELETE destroy', () => {
-    const destroyLocalizedText = async <StatusCode extends 204 | 400 | 404>(localizedText: LocalizedText, expectedStatus: StatusCode) => {
-      return request.delete('/v1/host/localized-texts/{id}', expectedStatus, {
-        id: localizedText.id,
+  context('belonging to a Room', () => {
+    let localizedText: LocalizedText
+
+    beforeEach(async () => {
+      const host = await createHost({ user })
+      const place = await createPlace()
+      await createHostPlace({ host, place })
+      const room = await createRoomDen({ place })
+      localizedText = await room.associationQuery('localizedTexts').firstOrFail()
+    })
+
+    describe('PATCH update', () => {
+      const updateLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        data: RequestBody<'patch', '/v1/host/localized-texts/{id}'>,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.patch('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+          data,
+        })
+      }
+
+      it('updates the LocalizedText', async () => {
+        await updateLocalizedText(
+          localizedText,
+          {
+            locale: 'es-ES',
+            title: 'Updated LocalizedText title',
+            markdown: 'Updated LocalizedText markdown',
+          },
+          204,
+        )
+
+        await localizedText.reload()
+        expect(localizedText.locale).toEqual('es-ES')
+        expect(localizedText.title).toEqual('Updated LocalizedText title')
+        expect(localizedText.markdown).toEqual('Updated LocalizedText markdown')
       })
-    }

-    it('deletes the LocalizedText', async () => {
-      const localizedText = await createLocalizedText({ user })
+      context('a LocalizedText associated with a Room belonging to a different Host', () => {
+        it('is not updated', async () => {
+          const otherRoom = await createRoomDen()
+          localizedText = await otherRoom.associationQuery('localizedTexts').firstOrFail()
+          const originalLocale = localizedText.locale
+          const originalTitle = localizedText.title
+          const originalMarkdown = localizedText.markdown

-      await destroyLocalizedText(localizedText, 204)
+          await updateLocalizedText(
+            localizedText,
+            {
+              locale: 'es-ES',
+              title: 'Updated LocalizedText title',
+              markdown: 'Updated LocalizedText markdown',
+            },
+            404,
+          )

-      expect(await LocalizedText.find(localizedText.id)).toBeNull()
+          await localizedText.reload()
+          expect(localizedText.locale).toEqual(originalLocale)
+          expect(localizedText.title).toEqual(originalTitle)
+          expect(localizedText.markdown).toEqual(originalMarkdown)
+        })
+      })
     })

-    context('a LocalizedText created by another User', () => {
-      it('is not deleted', async () => {
-        const localizedText = await createLocalizedText()
+    describe('DELETE destroy', () => {
+      const destroyLocalizedText = async <StatusCode extends 204 | 400 | 404>(
+        localizedText: LocalizedText,
+        expectedStatus: StatusCode,
+      ) => {
+        return request.delete('/v1/host/localized-texts/{id}', expectedStatus, {
+          id: localizedText.id,
+        })
+      }
+
+      it('deletes the LocalizedText', async () => {
+        await destroyLocalizedText(localizedText, 204)
+
+        expect(await LocalizedText.find(localizedText.id)).toBeNull()
+      })
+
+      context('a LocalizedText associated with a Room belonging to a different Host', () => {
+        it('is not deleted', async () => {
+          const otherRoom = await createRoomDen()
+          localizedText = await otherRoom.associationQuery('localizedTexts').firstOrFail()

-        await destroyLocalizedText(localizedText, 404)
+          await destroyLocalizedText(localizedText, 404)

-        expect(await LocalizedText.find(localizedText.id)).toMatchDreamModel(localizedText)
+          expect(await LocalizedText.find(localizedText.id)).toMatchDreamModel(localizedText)
+        })
       })
     })
   })
diff --git a/api/spec/unit/models/Host.spec.ts b/api/spec/unit/models/Host.spec.ts
index ef54e54..cdcb8d6 100644
--- a/api/spec/unit/models/Host.spec.ts
+++ b/api/spec/unit/models/Host.spec.ts
@@ -1,5 +1,6 @@
 import createHost from '@spec/factories/HostFactory.js'
 import createHostPlace from '@spec/factories/HostPlaceFactory.js'
+import createLocalizedText from '@spec/factories/LocalizedTextFactory.js'
 import createPlace from '@spec/factories/PlaceFactory.js'

 describe('Host', () => {
@@ -10,4 +11,21 @@ describe('Host', () => {

     expect(await host.associationQuery('places').all()).toMatchDreamModels([place])
   })
+
+  it('has many LocalizedTexts', async () => {
+    const host = await createHost()
+    const esLocalizedText = await createLocalizedText({ localizable: host, locale: 'es-ES' })
+
+    const localizedText = await host.associationQuery('localizedTexts', { and: { locale: 'es-ES' } }).last()
+    expect(localizedText).toMatchDreamModel(esLocalizedText)
+  })
+
+  context('upon creation', () => {
+    it('creates en-US LocalizedText for the Host', async () => {
+      const host = await createHost()
+      const localizedText = await host.associationQuery('localizedTexts').firstOrFail()
+
+      expect(localizedText.locale).toEqual('en-US')
+    })
+  })
 })
diff --git a/api/spec/unit/models/Place.spec.ts b/api/spec/unit/models/Place.spec.ts
index 6315065..7399652 100644
--- a/api/spec/unit/models/Place.spec.ts
+++ b/api/spec/unit/models/Place.spec.ts
@@ -1,5 +1,6 @@
 import createHost from '@spec/factories/HostFactory.js'
 import createHostPlace from '@spec/factories/HostPlaceFactory.js'
+import createLocalizedText from '@spec/factories/LocalizedTextFactory.js'
 import createPlace from '@spec/factories/PlaceFactory.js'

 describe('Place', () => {
@@ -10,4 +11,22 @@ describe('Place', () => {

     expect(await place.associationQuery('hosts').all()).toMatchDreamModels([host])
   })
+
+  it('has many LocalizedTexts', async () => {
+    const place = await createPlace()
+    const esLocalizedText = await createLocalizedText({ localizable: place, locale: 'es-ES' })
+
+    const localizedText = await place.associationQuery('localizedTexts', { and: { locale: 'es-ES' } }).last()
+    expect(localizedText).toMatchDreamModel(esLocalizedText)
+  })
+
+  context('upon creation', () => {
+    it('creates en-US LocalizedText for the Place', async () => {
+      const place = await createPlace({ style: 'cottage' })
+      const localizedText = await place.associationQuery('localizedTexts').firstOrFail()
+
+      expect(localizedText.locale).toEqual('en-US')
+      expect(localizedText.title).toEqual('My cottage')
+    })
+  })
 })
diff --git a/api/spec/unit/models/Room.spec.ts b/api/spec/unit/models/Room.spec.ts
index 1e8d460..0c9281f 100644
--- a/api/spec/unit/models/Room.spec.ts
+++ b/api/spec/unit/models/Room.spec.ts
@@ -1,3 +1,28 @@
+import createLocalizedText from '@spec/factories/LocalizedTextFactory.js'
+import createRoomDen from '@spec/factories/Room/DenFactory.js'
+
 describe('Room', () => {
-  it.todo('add a test here to get started building Room')
+  it('has many LocalizedTexts', async () => {
+    // using Den as a stand-in for any Room since STI base models cannot be
+    // saved to the database (enforced by intentionally omitting the base
+    // STI model controller name from the enum values allowed for `type`)
+    const room = await createRoomDen()
+    const esLocalizedText = await createLocalizedText({ localizable: room, locale: 'es-ES' })
+
+    const localizedText = await room.associationQuery('localizedTexts', { and: { locale: 'es-ES' } }).last()
+    expect(localizedText).toMatchDreamModel(esLocalizedText)
+  })
+
+  context('upon creation', () => {
+    it('creates en-US LocalizedText for the Room', async () => {
+      // using Den as a stand-in for any Room since STI base models cannot be
+      // saved to the database (enforced by intentionally omitting the base
+      // STI model controller name from the enum values allowed for `type`)
+      const room = await createRoomDen()
+      const localizedText = await room.associationQuery('localizedTexts').firstOrFail()
+
+      expect(localizedText.locale).toEqual('en-US')
+      expect(localizedText.title).toEqual('Den')
+    })
+  })
 })
diff --git a/api/src/app/controllers/V1/Host/LocalizedTextsController.ts b/api/src/app/controllers/V1/Host/LocalizedTextsController.ts
index 38fd532..cd82d48 100644
--- a/api/src/app/controllers/V1/Host/LocalizedTextsController.ts
+++ b/api/src/app/controllers/V1/Host/LocalizedTextsController.ts
@@ -1,6 +1,8 @@
+import LocalizedText from '@models/LocalizedText.js'
+import Place from '@models/Place.js'
+import Room from '@models/Room.js'
 import { OpenAPI } from '@rvoh/psychic'
 import V1HostBaseController from './BaseController.js'
-import LocalizedText from '@models/LocalizedText.js'

 const openApiTags = ['localized-texts']

@@ -11,9 +13,9 @@ export default class V1HostLocalizedTextsController extends V1HostBaseController
     description: 'Update a LocalizedText',
   })
   public async update() {
-    // const localizedText = await this.localizedText()
-    // await localizedText.update(this.paramsFor(LocalizedText))
-    // this.noContent()
+    const localizedText = await this.localizedText()
+    await localizedText.update(this.paramsFor(LocalizedText))
+    this.noContent()
   }

   @OpenAPI({
@@ -22,14 +24,51 @@ export default class V1HostLocalizedTextsController extends V1HostBaseController
     description: 'Destroy a LocalizedText',
   })
   public async destroy() {
-    // const localizedText = await this.localizedText()
-    // await localizedText.destroy()
-    // this.noContent()
+    const localizedText = await this.localizedText()
+    await localizedText.destroy()
+    this.noContent()
   }

   private async localizedText() {
-    // return await this.currentUser.associationQuery('localizedTexts')
-    //   .preloadFor('default')
-    //   .findOrFail(this.castParam('id', 'string'))
+    const localizedText = await LocalizedText.preload('localizable').findOrFail(
+      this.castParam('id', 'string'),
+    )
+
+    const localizable = localizedText.localizable
+
+    switch (localizedText.localizableType) {
+      case 'Host':
+        if (!localizable.equals(this.currentHost)) this.notFound()
+        return localizedText
+
+      case 'Place':
+        // the next line safely informs typescript that localizable is a Place
+        if (!(localizable instanceof Place)) throw new Error('unreachable')
+
+        if (!(await localizable.associationQuery('hosts', { and: { id: this.currentHost.id } }).exists()))
+          this.notFound()
+
+        return localizedText
+
+      case 'Room':
+        // the next line safely informs typescript that localizable is a Room
+        if (!(localizable instanceof Room)) throw new Error('unreachable')
+
+        if (
+          !(await localizable
+            .query()
+            .innerJoin('place', 'hosts', { and: { id: this.currentHost.id } })
+            .exists())
+        )
+          this.notFound()
+
+        return localizedText
+
+      default:
+        this.notFound()
+        // notFound already throws an exception, but Typescript doesn't know that; the following
+        // line informs typescript that this method always returns a LocalizableText
+        throw new Error('unreachable')
+    }
   }
 }
diff --git a/api/src/app/models/Host.ts b/api/src/app/models/Host.ts
index b7d7420..f0bb141 100644
--- a/api/src/app/models/Host.ts
+++ b/api/src/app/models/Host.ts
@@ -3,6 +3,7 @@ import User from '@models/User.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import HostPlace from './HostPlace.js'
+import LocalizedText from './LocalizedText.js'
 import Place from './Place.js'

 const deco = new Decorators<typeof Host>()
@@ -32,4 +33,12 @@ export default class Host extends ApplicationModel {

   @deco.HasMany('Place', { through: 'hostPlaces' })
   public places: Place[]
+
+  @deco.HasMany('LocalizedText', { polymorphic: true, on: 'localizableId', dependent: 'destroy' })
+  public localizedTexts: LocalizedText[]
+
+  @deco.AfterCreate()
+  public async createDefaultLocalizedText(this: Host) {
+    await this.createAssociation('localizedTexts', { locale: 'en-US' })
+  }
 }
diff --git a/api/src/app/models/LocalizedText.ts b/api/src/app/models/LocalizedText.ts
index d73684f..aecf7ca 100644
--- a/api/src/app/models/LocalizedText.ts
+++ b/api/src/app/models/LocalizedText.ts
@@ -1,6 +1,9 @@
+import ApplicationModel from '@models/ApplicationModel.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
-import ApplicationModel from '@models/ApplicationModel.js'
+import Host from './Host.js'
+import Place from './Place.js'
+import Room from './Room.js'

 const deco = new Decorators<typeof LocalizedText>()

@@ -25,4 +28,9 @@ export default class LocalizedText extends ApplicationModel {
   public deletedAt: DreamColumn<LocalizedText, 'deletedAt'>
   public createdAt: DreamColumn<LocalizedText, 'createdAt'>
   public updatedAt: DreamColumn<LocalizedText, 'updatedAt'>
+
+  @deco.BelongsTo(['Host', 'Place', 'Room'], { polymorphic: true, on: 'localizableId' })
+  // make sure this imports from `import Room from '@models/Room.js'`
+  // not from `import { Room } from 'socket.io-adapter'`
+  public localizable: Host | Place | Room
 }
diff --git a/api/src/app/models/Place.ts b/api/src/app/models/Place.ts
index 399d7a9..114e2cc 100644
--- a/api/src/app/models/Place.ts
+++ b/api/src/app/models/Place.ts
@@ -3,6 +3,7 @@ import { Decorators } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import Host from './Host.js'
 import HostPlace from './HostPlace.js'
+import LocalizedText from './LocalizedText.js'
 import Room from './Room.js'

 const deco = new Decorators<typeof Place>()
@@ -37,4 +38,12 @@ export default class Place extends ApplicationModel {
   // make sure this imports from `import Room from '@models/Room.js'`
   // not from `import { Room } from 'socket.io-adapter'`
   public rooms: Room[]
+
+  @deco.HasMany('LocalizedText', { polymorphic: true, on: 'localizableId', dependent: 'destroy' })
+  public localizedTexts: LocalizedText[]
+
+  @deco.AfterCreate()
+  public async createDefaultLocalizedText(this: Place) {
+    await this.createAssociation('localizedTexts', { locale: 'en-US', title: `My ${this.style}` })
+  }
 }
diff --git a/api/src/app/models/Room.ts b/api/src/app/models/Room.ts
index 7b34e52..289e533 100644
--- a/api/src/app/models/Room.ts
+++ b/api/src/app/models/Room.ts
@@ -2,6 +2,7 @@ import ApplicationModel from '@models/ApplicationModel.js'
 import Place from '@models/Place.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn } from '@rvoh/dream/types'
+import LocalizedText from './LocalizedText.js'

 const deco = new Decorators<typeof Room>()

@@ -20,4 +21,12 @@ export default class Room extends ApplicationModel {
   @deco.BelongsTo('Place', { on: 'placeId' })
   public place: Place
   public placeId: DreamColumn<Room, 'placeId'>
+
+  @deco.HasMany('LocalizedText', { polymorphic: true, on: 'localizableId', dependent: 'destroy' })
+  public localizedTexts: LocalizedText[]
+
+  @deco.AfterCreate()
+  public async createDefaultLocalizedText(this: Room) {
+    await this.createAssociation('localizedTexts', { locale: 'en-US', title: this.type })
+  }
 }
diff --git a/api/src/db/migrations/1764187753122-create-localized-text.ts b/api/src/db/migrations/1764187753122-create-localized-text.ts
index 13f64b4..d29f3a7 100644
--- a/api/src/db/migrations/1764187753122-create-localized-text.ts
+++ b/api/src/db/migrations/1764187753122-create-localized-text.ts
@@ -2,39 +2,29 @@ import { Kysely, sql } from 'kysely'

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 export async function up(db: Kysely<any>): Promise<void> {
-  await db.schema
-    .createType('localized_types_enum')
-    .asEnum([
-      'Host',
-      'Place',
-      'Room'
-    ])
-    .execute()
+  await db.schema.createType('localized_types_enum').asEnum(['Host', 'Place', 'Room']).execute()

-  await db.schema
-    .createType('locales_enum')
-    .asEnum([
-      'en-US',
-      'es-ES'
-    ])
-    .execute()
+  await db.schema.createType('locales_enum').asEnum(['en-US', 'es-ES']).execute()

   await db.schema
     .createTable('localized_texts')
-    .addColumn('id', 'uuid', col =>
-      col
-        .primaryKey()
-        .defaultTo(sql`uuid_generate_v4()`),
-    )
+    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
     .addColumn('localizable_type', sql`localized_types_enum`, col => col.notNull())
     .addColumn('localizable_id', 'uuid', col => col.notNull())
     .addColumn('locale', sql`locales_enum`, col => col.notNull())
-    .addColumn('title', 'varchar(255)', col => col.notNull())
-    .addColumn('markdown', 'text', col => col.notNull())
+    .addColumn('title', 'varchar(255)')
+    .addColumn('markdown', 'text')
     .addColumn('deleted_at', 'timestamp')
     .addColumn('created_at', 'timestamp', col => col.notNull())
     .addColumn('updated_at', 'timestamp', col => col.notNull())
     .execute()
+
+  await db.schema
+    .createIndex('localized_texts_localizable_for_locale')
+    .on('localized_texts')
+    .columns(['localizable_type', 'localizable_id', 'locale'])
+    .unique()
+    .execute()
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
@@ -43,4 +33,4 @@ export async function down(db: Kysely<any>): Promise<void> {

   await db.schema.dropType('localized_types_enum').execute()
   await db.schema.dropType('locales_enum').execute()
-}
\ No newline at end of file
+}
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index 8da1ee6..edc0b39 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -6,6 +6,114 @@
     "description": "The autogenerated openapi spec for your app"
   },
   "paths": {
+    "/v1/host/localized-texts/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "patch": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Update a LocalizedText",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "locale": {
+                    "type": "string",
+                    "enum": [
+                      "en-US",
+                      "es-ES"
+                    ]
+                  },
+                  "markdown": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  },
+                  "title": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Destroy a LocalizedText",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
     "/v1/host/places": {
       "parameters": [
         {
diff --git a/api/src/openapi/openapi.json b/api/src/openapi/openapi.json
index 4c2b563..ca0fe3d 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -6,6 +6,114 @@
     "description": "The autogenerated openapi spec for your app"
   },
   "paths": {
+    "/v1/host/localized-texts/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "patch": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Update a LocalizedText",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "locale": {
+                    "type": "string",
+                    "enum": [
+                      "en-US",
+                      "es-ES"
+                    ]
+                  },
+                  "markdown": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  },
+                  "title": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Destroy a LocalizedText",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
     "/v1/host/places": {
       "parameters": [
         {
diff --git a/api/src/openapi/spec.openapi.json b/api/src/openapi/spec.openapi.json
index 4c2b563..ca0fe3d 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -6,6 +6,114 @@
     "description": "The autogenerated openapi spec for your app"
   },
   "paths": {
+    "/v1/host/localized-texts/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "patch": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Update a LocalizedText",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "locale": {
+                    "type": "string",
+                    "enum": [
+                      "en-US",
+                      "es-ES"
+                    ]
+                  },
+                  "markdown": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  },
+                  "title": {
+                    "type": [
+                      "string",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "localized-texts"
+        ],
+        "description": "Destroy a LocalizedText",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
     "/v1/host/places": {
       "parameters": [
         {
diff --git a/api/src/types/db.ts b/api/src/types/db.ts
index 4ec7262..03b23ae 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -105,6 +105,21 @@ export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
   ? ColumnType<S, I | undefined, U>
   : ColumnType<T, T | undefined, T>;

+export type LocalesEnum = "en-US" | "es-ES";
+export const LocalesEnumValues = [
+  "en-US",
+  "es-ES"
+] as const
+
+
+export type LocalizedTypesEnum = "Host" | "Place" | "Room";
+export const LocalizedTypesEnumValues = [
+  "Host",
+  "Place",
+  "Room"
+] as const
+
+
 export type PlaceStylesEnum = "cabin" | "cave" | "cottage" | "dump" | "lean_to" | "tent" | "treehouse";
 export const PlaceStylesEnumValues = [
   "cabin",
@@ -151,6 +166,18 @@ export interface Hosts {
   userId: string;
 }

+export interface LocalizedTexts {
+  createdAt: Timestamp;
+  deletedAt: Timestamp | null;
+  id: Generated<string>;
+  locale: LocalesEnum;
+  localizableId: string;
+  localizableType: LocalizedTypesEnum;
+  markdown: string | null;
+  title: string | null;
+  updatedAt: Timestamp;
+}
+
 export interface Places {
   createdAt: Timestamp;
   deletedAt: Timestamp | null;
@@ -185,6 +212,7 @@ export interface DB {
   guests: Guests;
   host_places: HostPlaces;
   hosts: Hosts;
+  localized_texts: LocalizedTexts;
   places: Places;
   rooms: Rooms;
   users: Users;
@@ -195,6 +223,7 @@ export class DBClass {
   guests: Guests
   host_places: HostPlaces
   hosts: Hosts
+  localized_texts: LocalizedTexts
   places: Places
   rooms: Rooms
   users: Users
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index d52af7a..cdaea11 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -4,6 +4,8 @@ export const globalTypeConfig = {
       'GuestSummarySerializer',
       'HostSerializer',
       'HostSummarySerializer',
+      'LocalizedTextSerializer',
+      'LocalizedTextSummarySerializer',
       'PlaceSerializer',
       'PlaceSummarySerializer',
       'Room/BathroomSerializer',
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index b4fc9d7..3b6c1a0 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -65,6 +65,10 @@ import {
   BathOrShowerStylesEnumValues,
   BedTypesEnum,
   BedTypesEnumValues,
+  LocalesEnum,
+  LocalesEnumValues,
+  LocalizedTypesEnum,
+  LocalizedTypesEnumValues,
   PlaceStylesEnum,
   PlaceStylesEnumValues,
   RoomTypesEnum,
@@ -271,6 +275,15 @@ export const schema = {
         requiredAndClauses: null,
         passthroughAndClauses: null,
       },
+      localizedTexts: {
+        type: 'HasMany',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
       places: {
         type: 'HasMany',
         foreignKey: null,
@@ -291,6 +304,109 @@ export const schema = {
       },
     },
   },
+  localized_texts: {
+    serializerKeys: ['default', 'summary'],
+    scopes: {
+      default: [],
+      named: [],
+    },
+    nonJsonColumnNames: ['createdAt', 'deletedAt', 'id', 'locale', 'localizableId', 'localizableType', 'markdown', 'title', 'updatedAt'],
+    columns: {
+      createdAt: {
+        coercedType: {} as DateTime,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'timestamp without time zone',
+        allowNull: false,
+        isArray: false,
+      },
+      deletedAt: {
+        coercedType: {} as DateTime | null,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'timestamp without time zone',
+        allowNull: true,
+        isArray: false,
+      },
+      id: {
+        coercedType: {} as string,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'uuid',
+        allowNull: false,
+        isArray: false,
+      },
+      locale: {
+        coercedType: {} as LocalesEnum,
+        enumType: {} as LocalesEnum,
+        enumArrayType: [] as LocalesEnum[],
+        enumValues: LocalesEnumValues,
+        dbType: 'locales_enum',
+        allowNull: false,
+        isArray: false,
+      },
+      localizableId: {
+        coercedType: {} as string,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'uuid',
+        allowNull: false,
+        isArray: false,
+      },
+      localizableType: {
+        coercedType: {} as LocalizedTypesEnum,
+        enumType: {} as LocalizedTypesEnum,
+        enumArrayType: [] as LocalizedTypesEnum[],
+        enumValues: LocalizedTypesEnumValues,
+        dbType: 'localized_types_enum',
+        allowNull: false,
+        isArray: false,
+      },
+      markdown: {
+        coercedType: {} as string | null,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'text',
+        allowNull: true,
+        isArray: false,
+      },
+      title: {
+        coercedType: {} as string | null,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'character varying',
+        allowNull: true,
+        isArray: false,
+      },
+      updatedAt: {
+        coercedType: {} as DateTime,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'timestamp without time zone',
+        allowNull: false,
+        isArray: false,
+      },
+    },
+    virtualColumns: [],
+    associations: {
+      localizable: {
+        type: 'BelongsTo',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['hosts', 'places', 'rooms'],
+        optional: false,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+    },
+  },
   places: {
     serializerKeys: ['default', 'summary'],
     scopes: {
@@ -383,6 +499,15 @@ export const schema = {
         requiredAndClauses: null,
         passthroughAndClauses: null,
       },
+      localizedTexts: {
+        type: 'HasMany',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
       rooms: {
         type: 'HasMany',
         foreignKey: 'placeId',
@@ -495,6 +620,15 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
+      localizedTexts: {
+        type: 'HasMany',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
       place: {
         type: 'BelongsTo',
         foreignKey: 'placeId',
@@ -583,6 +717,7 @@ export const connectionTypeConfig = {
       'Guest': 'guests',
       'Host': 'hosts',
       'HostPlace': 'host_places',
+      'LocalizedText': 'localized_texts',
       'Place': 'places',
       'Room/Bathroom': 'rooms',
       'Room/Bedroom': 'rooms',
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index 4f0c02f..b577429 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -1,4 +1,75 @@
 export interface paths {
+    "/v1/host/localized-texts/{id}": {
+        parameters: {
+            query?: never;
+            header?: never;
+            path: {
+                id: string;
+            };
+            cookie?: never;
+        };
+        get?: never;
+        put?: never;
+        post?: never;
+        /** @description Destroy a LocalizedText */
+        delete: {
+            parameters: {
+                query?: never;
+                header?: never;
+                path: {
+                    id: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: never;
+            responses: {
+                /** @description Success, no content */
+                204: components["responses"]["NoContent"];
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        options?: never;
+        head?: never;
+        /** @description Update a LocalizedText */
+        patch: {
+            parameters: {
+                query?: never;
+                header?: never;
+                path: {
+                    id: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: {
+                content: {
+                    "application/json": {
+                        /** @enum {string} */
+                        locale?: "en-US" | "es-ES";
+                        markdown?: string | null;
+                        title?: string | null;
+                    };
+                };
+            };
+            responses: {
+                /** @description Success, no content */
+                204: components["responses"]["NoContent"];
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        trace?: never;
+    };
     "/v1/host/places": {
         parameters: {
             query?: {
````
