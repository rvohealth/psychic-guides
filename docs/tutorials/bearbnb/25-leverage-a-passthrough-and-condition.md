---
title: Leverage a passthrough `and` condition
---

# Leverage a passthrough `and` condition

## Commit Message

````
Leverage a passthrough `and` condition
to create a HasOne currentLocalizedText
association for displaying localized
text to Guests

```console
pnpm psy sync
pnpm uspec spec/unit/models/Host.spec.ts
pnpm uspec spec/unit/models/Place.spec.ts
pnpm uspec spec/unit/models/Room.spec.ts
pnpm uspec
````

````

## Changes

```diff
diff --git a/api/spec/unit/models/Host.spec.ts b/api/spec/unit/models/Host.spec.ts
index cdcb8d6..79b1487 100644
--- a/api/spec/unit/models/Host.spec.ts
+++ b/api/spec/unit/models/Host.spec.ts
@@ -28,4 +28,13 @@ describe('Host', () => {
       expect(localizedText.locale).toEqual('en-US')
     })
   })
+
+  it('has one currentLocalizedText', async () => {
+    let host = await createHost()
+    const esLocalizedText = await createLocalizedText({ localizable: host, locale: 'es-ES' })
+
+    host = await host.passthrough({ locale: 'es-ES' }).load('currentLocalizedText').execute()
+
+    expect(host.currentLocalizedText).toMatchDreamModel(esLocalizedText)
+  })
 })
diff --git a/api/spec/unit/models/Place.spec.ts b/api/spec/unit/models/Place.spec.ts
index 7399652..c4f54f5 100644
--- a/api/spec/unit/models/Place.spec.ts
+++ b/api/spec/unit/models/Place.spec.ts
@@ -29,4 +29,13 @@ describe('Place', () => {
       expect(localizedText.title).toEqual('My cottage')
     })
   })
+
+  it('has one currentLocalizedText', async () => {
+    let place = await createPlace()
+    const esLocalizedText = await createLocalizedText({ localizable: place, locale: 'es-ES' })
+
+    place = await place.passthrough({ locale: 'es-ES' }).load('currentLocalizedText').execute()
+
+    expect(place.currentLocalizedText).toMatchDreamModel(esLocalizedText)
+  })
 })
diff --git a/api/spec/unit/models/Room.spec.ts b/api/spec/unit/models/Room.spec.ts
index 0c9281f..e6c7481 100644
--- a/api/spec/unit/models/Room.spec.ts
+++ b/api/spec/unit/models/Room.spec.ts
@@ -25,4 +25,16 @@ describe('Room', () => {
       expect(localizedText.title).toEqual('Den')
     })
   })
+
+  it('has one currentLocalizedText', async () => {
+    // using Den as a stand-in for any Room since STI base models cannot be
+    // saved to the database (enforced by intentionally omitting the base
+    // STI model controller name from the enum values allowed for `type`)Add commentMore actions
+    let room = await createRoomDen()
+    const esLocalizedText = await createLocalizedText({ localizable: room, locale: 'es-ES' })
+
+    room = await room.passthrough({ locale: 'es-ES' }).load('currentLocalizedText').execute()
+
+    expect(room.currentLocalizedText).toMatchDreamModel(esLocalizedText)
+  })
 })
diff --git a/api/src/app/models/Host.ts b/api/src/app/models/Host.ts
index f0bb141..1bc8c32 100644
--- a/api/src/app/models/Host.ts
+++ b/api/src/app/models/Host.ts
@@ -1,6 +1,6 @@
 import ApplicationModel from '@models/ApplicationModel.js'
 import User from '@models/User.js'
-import { Decorators } from '@rvoh/dream'
+import { Decorators, DreamConst } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import HostPlace from './HostPlace.js'
 import LocalizedText from './LocalizedText.js'
@@ -41,4 +41,11 @@ export default class Host extends ApplicationModel {
   public async createDefaultLocalizedText(this: Host) {
     await this.createAssociation('localizedTexts', { locale: 'en-US' })
   }
+
+  @deco.HasOne('LocalizedText', {
+    polymorphic: true,
+    on: 'localizableId',
+    and: { locale: DreamConst.passthrough },
+  })
+  public currentLocalizedText: LocalizedText
 }
diff --git a/api/src/app/models/Place.ts b/api/src/app/models/Place.ts
index 114e2cc..2631c38 100644
--- a/api/src/app/models/Place.ts
+++ b/api/src/app/models/Place.ts
@@ -1,5 +1,5 @@
 import ApplicationModel from '@models/ApplicationModel.js'
-import { Decorators } from '@rvoh/dream'
+import { Decorators, DreamConst } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import Host from './Host.js'
 import HostPlace from './HostPlace.js'
@@ -46,4 +46,11 @@ export default class Place extends ApplicationModel {
   public async createDefaultLocalizedText(this: Place) {
     await this.createAssociation('localizedTexts', { locale: 'en-US', title: `My ${this.style}` })
   }
+
+  @deco.HasOne('LocalizedText', {
+    polymorphic: true,
+    on: 'localizableId',
+    and: { locale: DreamConst.passthrough },
+  })
+  public currentLocalizedText: LocalizedText
 }
diff --git a/api/src/app/models/Room.ts b/api/src/app/models/Room.ts
index 289e533..3343514 100644
--- a/api/src/app/models/Room.ts
+++ b/api/src/app/models/Room.ts
@@ -1,6 +1,6 @@
 import ApplicationModel from '@models/ApplicationModel.js'
 import Place from '@models/Place.js'
-import { Decorators } from '@rvoh/dream'
+import { Decorators, DreamConst } from '@rvoh/dream'
 import { DreamColumn } from '@rvoh/dream/types'
 import LocalizedText from './LocalizedText.js'

@@ -29,4 +29,11 @@ export default class Room extends ApplicationModel {
   public async createDefaultLocalizedText(this: Room) {
     await this.createAssociation('localizedTexts', { locale: 'en-US', title: this.type })
   }
+
+  @deco.HasOne('LocalizedText', {
+    polymorphic: true,
+    on: 'localizableId',
+    and: { locale: DreamConst.passthrough },
+  })
+  public currentLocalizedText: LocalizedText
 }
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index 3b6c1a0..b7231fb 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -266,6 +266,15 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
+      currentLocalizedText: {
+        type: 'HasOne',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: ['locale'],
+      },
       hostPlaces: {
         type: 'HasMany',
         foreignKey: 'hostId',
@@ -481,6 +490,15 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
+      currentLocalizedText: {
+        type: 'HasOne',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: ['locale'],
+      },
       hostPlaces: {
         type: 'HasMany',
         foreignKey: 'placeId',
@@ -620,6 +638,15 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
+      currentLocalizedText: {
+        type: 'HasOne',
+        foreignKey: 'localizableId',
+        foreignKeyTypeColumn: 'localizableType',
+        tables: ['localized_texts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: ['locale'],
+      },
       localizedTexts: {
         type: 'HasMany',
         foreignKey: 'localizableId',
@@ -710,7 +737,7 @@ export const schema = {
 } as const

 export const connectionTypeConfig = {
-  passthroughColumns: [],
+  passthroughColumns: ['locale'],
   allDefaultScopeNames: ['dream:STI'],
   globalNames: {
     models: {
````
