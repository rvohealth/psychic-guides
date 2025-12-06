---
title: Host hasMany places through HostPlace
---

# Host hasMany places through HostPlace

## Commit Message

````
Host hasMany places through HostPlace
Place hasMany hosts through HostPlace

Association types synced
Model specs

To run migration:

```console
pnpm psy db:migrate
````

If you changed a migration that you already ran (_only_ before the feature has been merged into `main`...once a migration has been run on a server, it must not be changed or removed; instead, create a new migration with `pnpm psy g:migration ...`), either:

```console
pnpm psy db:rollback
pnpm psy db:migrate
```

or

```console
pnpm psy db:reset
```

After adding HasMany/HasOne/BelongsTo associations:

```console
pnpm psy sync
// pnpm psy db:migrate will also sync
```

To run model unit specs:

```console
pnpm uspec spec/unit/models
```

````

## Changes

```diff
diff --git a/api/spec/unit/models/Host.spec.ts b/api/spec/unit/models/Host.spec.ts
index 9255d5c..ef54e54 100644
--- a/api/spec/unit/models/Host.spec.ts
+++ b/api/spec/unit/models/Host.spec.ts
@@ -1,3 +1,13 @@
+import createHost from '@spec/factories/HostFactory.js'
+import createHostPlace from '@spec/factories/HostPlaceFactory.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+
 describe('Host', () => {
-  it.todo('add a test here to get started building Host')
+  it('has many Places (through hostPlaces)', async () => {
+    const host = await createHost()
+    const place = await createPlace()
+    await createHostPlace({ host, place })
+
+    expect(await host.associationQuery('places').all()).toMatchDreamModels([place])
+  })
 })
diff --git a/api/spec/unit/models/Place.spec.ts b/api/spec/unit/models/Place.spec.ts
index 10bcdd9..6315065 100644
--- a/api/spec/unit/models/Place.spec.ts
+++ b/api/spec/unit/models/Place.spec.ts
@@ -1,3 +1,13 @@
+import createHost from '@spec/factories/HostFactory.js'
+import createHostPlace from '@spec/factories/HostPlaceFactory.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+
 describe('Place', () => {
-  it.todo('add a test here to get started building Place')
+  it('has many Hosts (through hostPlaces)', async () => {
+    const host = await createHost()
+    const place = await createPlace()
+    await createHostPlace({ host, place })
+
+    expect(await place.associationQuery('hosts').all()).toMatchDreamModels([host])
+  })
 })
diff --git a/api/src/app/models/Host.ts b/api/src/app/models/Host.ts
index 8536e0d..b7d7420 100644
--- a/api/src/app/models/Host.ts
+++ b/api/src/app/models/Host.ts
@@ -1,7 +1,9 @@
-import { Decorators } from '@rvoh/dream'
-import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import ApplicationModel from '@models/ApplicationModel.js'
 import User from '@models/User.js'
+import { Decorators } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import HostPlace from './HostPlace.js'
+import Place from './Place.js'

 const deco = new Decorators<typeof Host>()

@@ -24,4 +26,10 @@ export default class Host extends ApplicationModel {
   @deco.BelongsTo('User', { on: 'userId' })
   public user: User
   public userId: DreamColumn<Host, 'userId'>
+
+  @deco.HasMany('HostPlace')
+  public hostPlaces: HostPlace[]
+
+  @deco.HasMany('Place', { through: 'hostPlaces' })
+  public places: Place[]
 }
diff --git a/api/src/app/models/Place.ts b/api/src/app/models/Place.ts
index ee1bcf4..64ddfc8 100644
--- a/api/src/app/models/Place.ts
+++ b/api/src/app/models/Place.ts
@@ -1,6 +1,8 @@
+import ApplicationModel from '@models/ApplicationModel.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
-import ApplicationModel from '@models/ApplicationModel.js'
+import Host from './Host.js'
+import HostPlace from './HostPlace.js'

 const deco = new Decorators<typeof Place>()

@@ -23,4 +25,10 @@ export default class Place extends ApplicationModel {
   public deletedAt: DreamColumn<Place, 'deletedAt'>
   public createdAt: DreamColumn<Place, 'createdAt'>
   public updatedAt: DreamColumn<Place, 'updatedAt'>
+
+  @deco.HasMany('HostPlace', { dependent: 'destroy' })
+  public hostPlaces: HostPlace[]
+
+  @deco.HasMany('Host', { through: 'hostPlaces' })
+  public hosts: Host[]
 }
diff --git a/api/src/types/db.ts b/api/src/types/db.ts
index 81b5fd3..0a88afd 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -88,6 +88,15 @@ export interface Guests {
   userId: string;
 }

+export interface HostPlaces {
+  createdAt: Timestamp;
+  deletedAt: Timestamp | null;
+  hostId: string;
+  id: Generated<string>;
+  placeId: string;
+  updatedAt: Timestamp;
+}
+
 export interface Hosts {
   createdAt: Timestamp;
   id: Generated<string>;
@@ -114,6 +123,7 @@ export interface Users {

 export interface DB {
   guests: Guests;
+  host_places: HostPlaces;
   hosts: Hosts;
   places: Places;
   users: Users;
@@ -122,6 +132,7 @@ export interface DB {

 export class DBClass {
   guests: Guests
+  host_places: HostPlaces
   hosts: Hosts
   places: Places
   users: Users
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index 2f77946..f25e8ae 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -122,6 +122,91 @@ export const schema = {
       },
     },
   },
+  host_places: {
+    serializerKeys: [],
+    scopes: {
+      default: [],
+      named: [],
+    },
+    nonJsonColumnNames: ['createdAt', 'deletedAt', 'hostId', 'id', 'placeId', 'updatedAt'],
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
+      hostId: {
+        coercedType: {} as string,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'uuid',
+        allowNull: false,
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
+      placeId: {
+        coercedType: {} as string,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'uuid',
+        allowNull: false,
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
+      host: {
+        type: 'BelongsTo',
+        foreignKey: 'hostId',
+        foreignKeyTypeColumn: null,
+        tables: ['hosts'],
+        optional: false,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+      place: {
+        type: 'BelongsTo',
+        foreignKey: 'placeId',
+        foreignKeyTypeColumn: null,
+        tables: ['places'],
+        optional: false,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+    },
+  },
   hosts: {
     serializerKeys: ['default', 'summary'],
     scopes: {
@@ -169,6 +254,24 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
+      hostPlaces: {
+        type: 'HasMany',
+        foreignKey: 'hostId',
+        foreignKeyTypeColumn: null,
+        tables: ['host_places'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+      places: {
+        type: 'HasMany',
+        foreignKey: null,
+        foreignKeyTypeColumn: null,
+        tables: ['places'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
       user: {
         type: 'BelongsTo',
         foreignKey: 'userId',
@@ -254,7 +357,24 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
-
+      hostPlaces: {
+        type: 'HasMany',
+        foreignKey: 'placeId',
+        foreignKeyTypeColumn: null,
+        tables: ['host_places'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+      hosts: {
+        type: 'HasMany',
+        foreignKey: null,
+        foreignKeyTypeColumn: null,
+        tables: ['hosts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
     },
   },
   users: {
@@ -333,6 +453,7 @@ export const connectionTypeConfig = {
     models: {
       'Guest': 'guests',
       'Host': 'hosts',
+      'HostPlace': 'host_places',
       'Place': 'places',
       'User': 'users'
     },
````
