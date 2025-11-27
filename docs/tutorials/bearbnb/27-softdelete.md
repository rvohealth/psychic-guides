---
title: SoftDelete
---

# SoftDelete

## Commit Message

```
SoftDelete

```console
yarn psy sync
yarn uspec spec/unit/models/Place.spec.ts
yarn uspec
```

SoftDelete works with `deletedAt`, which we included in the
original generator commands. If adding after the fact, generate
a migration with an optional `deletedAt` datetime:

```console
yarn psy g:migration add-deleted-at-to-rooms deleted_at:datetime:optional
```

To cascade deletion (regular or soft), add `dependent: destroy`
to the relevant association declarations.
```

## Changes

```diff
diff --git a/api/spec/unit/models/Place.spec.ts b/api/spec/unit/models/Place.spec.ts
index c4f54f5..2ed6c14 100644
--- a/api/spec/unit/models/Place.spec.ts
+++ b/api/spec/unit/models/Place.spec.ts
@@ -1,7 +1,12 @@
+import HostPlace from '@models/HostPlace.js'
+import LocalizedText from '@models/LocalizedText.js'
+import Place from '@models/Place.js'
+import Room from '@models/Room.js'
 import createHost from '@spec/factories/HostFactory.js'
 import createHostPlace from '@spec/factories/HostPlaceFactory.js'
 import createLocalizedText from '@spec/factories/LocalizedTextFactory.js'
 import createPlace from '@spec/factories/PlaceFactory.js'
+import createRoomKitchen from '@spec/factories/Room/KitchenFactory.js'
 
 describe('Place', () => {
   it('has many Hosts (through hostPlaces)', async () => {
@@ -38,4 +43,42 @@ describe('Place', () => {
 
     expect(place.currentLocalizedText).toMatchDreamModel(esLocalizedText)
   })
+
+  context('upon destruction', () => {
+    it('soft-deletes associated HostPlaces, Rooms, and LocalizedTexts', async () => {
+      const place = await createPlace()
+      const hostPlace = await createHostPlace({ place })
+      const room = await createRoomKitchen({ place })
+      const placeText = await place.associationQuery('localizedTexts').firstOrFail()
+      const roomText = await room.associationQuery('localizedTexts').firstOrFail()
+
+      expect(await Place.where({ id: place.id }).exists()).toBe(true)
+      expect(await HostPlace.where({ id: hostPlace.id }).exists()).toBe(true)
+      expect(await Room.where({ id: room.id }).exists()).toBe(true)
+      expect(await LocalizedText.where({ id: placeText.id }).exists()).toBe(true)
+      expect(await LocalizedText.where({ id: roomText.id }).exists()).toBe(true)
+
+      await place.destroy()
+
+      const placeQuery = Place.where({ id: place.id })
+      expect(await placeQuery.exists()).toBe(false)
+      expect(await placeQuery.removeAllDefaultScopes().exists()).toBe(true)
+
+      const hostPlaceQuery = HostPlace.where({ id: hostPlace.id })
+      expect(await hostPlaceQuery.exists()).toBe(false)
+      expect(await hostPlaceQuery.removeAllDefaultScopes().exists()).toBe(true)
+
+      const roomQuery = Room.where({ id: room.id })
+      expect(await roomQuery.exists()).toBe(false)
+      expect(await roomQuery.removeAllDefaultScopes().exists()).toBe(true)
+
+      const placeTextQuery = LocalizedText.where({ id: placeText.id })
+      expect(await placeTextQuery.exists()).toBe(false)
+      expect(await placeTextQuery.removeAllDefaultScopes().exists()).toBe(true)
+
+      const roomTextQuery = LocalizedText.where({ id: roomText.id })
+      expect(await roomTextQuery.exists()).toBe(false)
+      expect(await roomTextQuery.removeAllDefaultScopes().exists()).toBe(true)
+    })
+  })
 })
diff --git a/api/src/app/models/HostPlace.ts b/api/src/app/models/HostPlace.ts
index baf74e2..eab07df 100644
--- a/api/src/app/models/HostPlace.ts
+++ b/api/src/app/models/HostPlace.ts
@@ -1,11 +1,12 @@
-import { Decorators } from '@rvoh/dream'
-import { DreamColumn } from '@rvoh/dream/types'
 import ApplicationModel from '@models/ApplicationModel.js'
 import Host from '@models/Host.js'
 import Place from '@models/Place.js'
+import { Decorators, SoftDelete } from '@rvoh/dream'
+import { DreamColumn } from '@rvoh/dream/types'
 
 const deco = new Decorators<typeof HostPlace>()
 
+@SoftDelete()
 export default class HostPlace extends ApplicationModel {
   public override get table() {
     return 'host_places' as const
diff --git a/api/src/app/models/LocalizedText.ts b/api/src/app/models/LocalizedText.ts
index aecf7ca..5b689b4 100644
--- a/api/src/app/models/LocalizedText.ts
+++ b/api/src/app/models/LocalizedText.ts
@@ -1,5 +1,5 @@
 import ApplicationModel from '@models/ApplicationModel.js'
-import { Decorators } from '@rvoh/dream'
+import { Decorators, SoftDelete } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import Host from './Host.js'
 import Place from './Place.js'
@@ -7,6 +7,7 @@ import Room from './Room.js'
 
 const deco = new Decorators<typeof LocalizedText>()
 
+@SoftDelete()
 export default class LocalizedText extends ApplicationModel {
   public override get table() {
     return 'localized_texts' as const
diff --git a/api/src/app/models/Place.ts b/api/src/app/models/Place.ts
index 152f6b5..bb10df8 100644
--- a/api/src/app/models/Place.ts
+++ b/api/src/app/models/Place.ts
@@ -1,5 +1,5 @@
 import ApplicationModel from '@models/ApplicationModel.js'
-import { Decorators, DreamConst } from '@rvoh/dream'
+import { Decorators, DreamConst, SoftDelete } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import Host from './Host.js'
 import HostPlace from './HostPlace.js'
@@ -8,6 +8,7 @@ import Room from './Room.js'
 
 const deco = new Decorators<typeof Place>()
 
+@SoftDelete()
 export default class Place extends ApplicationModel {
   public override get table() {
     return 'places' as const
@@ -36,7 +37,7 @@ export default class Place extends ApplicationModel {
   @deco.HasMany('Host', { through: 'hostPlaces' })
   public hosts: Host[]
 
-  @deco.HasMany('Room', { order: 'createdAt' })
+  @deco.HasMany('Room', { order: 'createdAt', dependent: 'destroy' })
   // make sure this imports from `import Room from '@models/Room.js'`
   // not from `import { Room } from 'socket.io-adapter'`
   public rooms: Room[]
diff --git a/api/src/app/models/Room.ts b/api/src/app/models/Room.ts
index 3343514..eb177b3 100644
--- a/api/src/app/models/Room.ts
+++ b/api/src/app/models/Room.ts
@@ -1,11 +1,12 @@
 import ApplicationModel from '@models/ApplicationModel.js'
 import Place from '@models/Place.js'
-import { Decorators, DreamConst } from '@rvoh/dream'
+import { Decorators, DreamConst, SoftDelete } from '@rvoh/dream'
 import { DreamColumn } from '@rvoh/dream/types'
 import LocalizedText from './LocalizedText.js'
 
 const deco = new Decorators<typeof Room>()
 
+@SoftDelete()
 export default class Room extends ApplicationModel {
   public override get table() {
     return 'rooms' as const
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index ad88126..acdb672 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -137,7 +137,7 @@ export const schema = {
   host_places: {
     serializerKeys: [],
     scopes: {
-      default: [],
+      default: ['dream:SoftDelete'],
       named: [],
     },
     nonJsonColumnNames: ['createdAt', 'deletedAt', 'hostId', 'id', 'placeId', 'updatedAt'],
@@ -316,7 +316,7 @@ export const schema = {
   localized_texts: {
     serializerKeys: ['default', 'summary'],
     scopes: {
-      default: [],
+      default: ['dream:SoftDelete'],
       named: [],
     },
     nonJsonColumnNames: ['createdAt', 'deletedAt', 'id', 'locale', 'localizableId', 'localizableType', 'markdown', 'title', 'updatedAt'],
@@ -419,7 +419,7 @@ export const schema = {
   places: {
     serializerKeys: ['default', 'forGuests', 'summary', 'summaryForGuests'],
     scopes: {
-      default: [],
+      default: ['dream:SoftDelete'],
       named: [],
     },
     nonJsonColumnNames: ['createdAt', 'deletedAt', 'id', 'name', 'sleeps', 'style', 'updatedAt'],
@@ -540,7 +540,7 @@ export const schema = {
   rooms: {
     serializerKeys: ['default', 'forGuests', 'summary'],
     scopes: {
-      default: ['dream:STI'],
+      default: ['dream:STI', 'dream:SoftDelete'],
       named: [],
     },
     nonJsonColumnNames: ['appliances', 'bathOrShowerStyle', 'bedTypes', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
@@ -738,7 +738,7 @@ export const schema = {
 
 export const connectionTypeConfig = {
   passthroughColumns: ['locale'],
-  allDefaultScopeNames: ['dream:STI'],
+  allDefaultScopeNames: ['dream:STI', 'dream:SoftDelete'],
   globalNames: {
     models: {
       'Guest': 'guests',
```
