---
title: User HasOne Host
---

# User HasOne Host

## Commit Message

```
User HasOne Host

Users do _not_ automatically get a Host (special onboarding process for
becoming a host).
Each User can have at most one Host (unique index on user_id foreign key).
Sync association types.

```console
yarn psy db:migrate
```

If migrations had already been run, after adding
a new association, one could run `sync` instead
(`db:migrate` runs `sync` implicitly):

```console
yarn psy sync
```
```

## Changes

```diff
diff --git a/api/src/app/models/User.ts b/api/src/app/models/User.ts
index 09fd61c..93297cb 100644
--- a/api/src/app/models/User.ts
+++ b/api/src/app/models/User.ts
@@ -2,6 +2,7 @@ import ApplicationModel from '@models/ApplicationModel.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn } from '@rvoh/dream/types'
 import Guest from './Guest.js'
+import Host from './Host.js'
 
 const deco = new Decorators<typeof User>()
 
@@ -22,4 +23,7 @@ export default class User extends ApplicationModel {
 
   @deco.HasOne('Guest')
   public guest: Guest
+
+  @deco.HasOne('Host')
+  public host: Host
 }
diff --git a/api/src/db/migrations/1764175837654-create-host.ts b/api/src/db/migrations/1764175837654-create-host.ts
index 9157b9b..8caf853 100644
--- a/api/src/db/migrations/1764175837654-create-host.ts
+++ b/api/src/db/migrations/1764175837654-create-host.ts
@@ -4,25 +4,17 @@ import { Kysely, sql } from 'kysely'
 export async function up(db: Kysely<any>): Promise<void> {
   await db.schema
     .createTable('hosts')
-    .addColumn('id', 'uuid', col =>
-      col
-        .primaryKey()
-        .defaultTo(sql`uuid_generate_v4()`),
-    )
-    .addColumn('user_id', 'uuid', col => col.references('users.id').onDelete('restrict').notNull())
+    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
+    .addColumn('user_id', 'uuid', col => col.references('users.id').onDelete('restrict').notNull().unique())
     .addColumn('created_at', 'timestamp', col => col.notNull())
     .addColumn('updated_at', 'timestamp', col => col.notNull())
     .execute()
 
-  await db.schema
-    .createIndex('hosts_user_id')
-    .on('hosts')
-    .column('user_id')
-    .execute()
+  await db.schema.createIndex('hosts_user_id').on('hosts').column('user_id').execute()
 }
 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 export async function down(db: Kysely<any>): Promise<void> {
   await db.schema.dropIndex('hosts_user_id').execute()
   await db.schema.dropTable('hosts').execute()
-}
\ No newline at end of file
+}
diff --git a/api/src/types/db.ts b/api/src/types/db.ts
index 75755cd..ffdeba9 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -76,6 +76,13 @@ export interface Guests {
   userId: string;
 }
 
+export interface Hosts {
+  createdAt: Timestamp;
+  id: Generated<string>;
+  updatedAt: Timestamp;
+  userId: string;
+}
+
 export interface Users {
   createdAt: Timestamp;
   email: string;
@@ -85,11 +92,13 @@ export interface Users {
 
 export interface DB {
   guests: Guests;
+  hosts: Hosts;
   users: Users;
 }
 
 
 export class DBClass {
   guests: Guests
+  hosts: Hosts
   users: Users
 }
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index 51ef8d7..82285f9 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -1,3 +1,8 @@
 export const globalTypeConfig = {
-  serializers: ['GuestSerializer', 'GuestSummarySerializer'],
+  serializers: [
+      'GuestSerializer',
+      'GuestSummarySerializer',
+      'HostSerializer',
+      'HostSummarySerializer'
+    ],
 } as const
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index 95c1d07..c3158a7 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -119,6 +119,64 @@ export const schema = {
       },
     },
   },
+  hosts: {
+    serializerKeys: ['default', 'summary'],
+    scopes: {
+      default: [],
+      named: [],
+    },
+    nonJsonColumnNames: ['createdAt', 'id', 'updatedAt', 'userId'],
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
+      id: {
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
+      userId: {
+        coercedType: {} as string,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'uuid',
+        allowNull: false,
+        isArray: false,
+      },
+    },
+    virtualColumns: [],
+    associations: {
+      user: {
+        type: 'BelongsTo',
+        foreignKey: 'userId',
+        foreignKeyTypeColumn: null,
+        tables: ['users'],
+        optional: false,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
+    },
+  },
   users: {
     serializerKeys: [],
     scopes: {
@@ -175,6 +233,15 @@ export const schema = {
         requiredAndClauses: null,
         passthroughAndClauses: null,
       },
+      host: {
+        type: 'HasOne',
+        foreignKey: 'userId',
+        foreignKeyTypeColumn: null,
+        tables: ['hosts'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
     },
   },
 } as const
@@ -185,6 +252,7 @@ export const connectionTypeConfig = {
   globalNames: {
     models: {
       'Guest': 'guests',
+      'Host': 'hosts',
       'User': 'users'
     },
   },
```
