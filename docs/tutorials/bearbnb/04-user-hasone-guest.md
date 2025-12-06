---
title: User HasOne Guest
---

# User HasOne Guest

## Commit Message

````
User HasOne Guest
Every User automatically creates a Guest
Each User can have at most one Guest (unique index on user_id foreign key)
Sync association types

Run migration:
```console
pnpm psy db:migrate
````

Run model specs:

```console
pnpm uspec spec/unit/models/user.spec.ts

pnpm uspec spec/unit/models
```

If migrations had already been run, after adding
a new association, one could run `sync` instead
(`db:migrate` runs `sync` implicitly):

```console
pnpm psy sync
```

````

## Changes

```diff
diff --git a/api/spec/unit/models/User.spec.ts b/api/spec/unit/models/User.spec.ts
index 06dac32..3bdfe80 100644
--- a/api/spec/unit/models/User.spec.ts
+++ b/api/spec/unit/models/User.spec.ts
@@ -1,3 +1,14 @@
+import Guest from '@models/Guest.js'
+import createUser from '@spec/factories/UserFactory.js'
+
 describe('User', () => {
-  it.todo('add a test here to get started building User')
+  context('upon creation', () => {
+    it('creates a guest for this user and brings it into scope on the newly created user', async () => {
+      const user = await createUser()
+
+      expect(user.guest instanceof Guest).toBe(true)
+      const guest = await user.associationQuery('guest').first()
+      expect(guest instanceof Guest).toBe(true)
+    })
+  })
 })
diff --git a/api/src/app/models/User.ts b/api/src/app/models/User.ts
index 0c415a7..09fd61c 100644
--- a/api/src/app/models/User.ts
+++ b/api/src/app/models/User.ts
@@ -1,6 +1,7 @@
+import ApplicationModel from '@models/ApplicationModel.js'
 import { Decorators } from '@rvoh/dream'
 import { DreamColumn } from '@rvoh/dream/types'
-import ApplicationModel from '@models/ApplicationModel.js'
+import Guest from './Guest.js'

 const deco = new Decorators<typeof User>()

@@ -13,4 +14,12 @@ export default class User extends ApplicationModel {
   public email: DreamColumn<User, 'email'>
   public createdAt: DreamColumn<User, 'createdAt'>
   public updatedAt: DreamColumn<User, 'updatedAt'>
+
+  @deco.AfterCreate()
+  public async createGuest(this: User) {
+    this.guest = await this.createAssociation('guest')
+  }
+
+  @deco.HasOne('Guest')
+  public guest: Guest
 }
diff --git a/api/src/db/migrations/1764175590862-create-guest.ts b/api/src/db/migrations/1764175590862-create-guest.ts
index acc776a..69a7d51 100644
--- a/api/src/db/migrations/1764175590862-create-guest.ts
+++ b/api/src/db/migrations/1764175590862-create-guest.ts
@@ -4,25 +4,17 @@ import { Kysely, sql } from 'kysely'
 export async function up(db: Kysely<any>): Promise<void> {
   await db.schema
     .createTable('guests')
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
-    .createIndex('guests_user_id')
-    .on('guests')
-    .column('user_id')
-    .execute()
+  await db.schema.createIndex('guests_user_id').on('guests').column('user_id').execute()
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 export async function down(db: Kysely<any>): Promise<void> {
   await db.schema.dropIndex('guests_user_id').execute()
   await db.schema.dropTable('guests').execute()
-}
\ No newline at end of file
+}
diff --git a/api/src/types/db.ts b/api/src/types/db.ts
index 89152ae..75755cd 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -69,6 +69,13 @@ export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
   : ColumnType<T, T | undefined, T>;
 export type Timestamp = ColumnType<DateTime | CalendarDate>

+export interface Guests {
+  createdAt: Timestamp;
+  id: Generated<string>;
+  updatedAt: Timestamp;
+  userId: string;
+}
+
 export interface Users {
   createdAt: Timestamp;
   email: string;
@@ -77,10 +84,12 @@ export interface Users {
 }

 export interface DB {
+  guests: Guests;
   users: Users;
 }


 export class DBClass {
+  guests: Guests
   users: Users
 }
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index 4ad387e..51ef8d7 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -1,3 +1,3 @@
 export const globalTypeConfig = {
-  serializers: [],
+  serializers: ['GuestSerializer', 'GuestSummarySerializer'],
 } as const
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index 0dee4b2..95c1d07 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -61,6 +61,64 @@ import { type CalendarDate, type DateTime } from '@rvoh/dream'


 export const schema = {
+  guests: {
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
@@ -108,7 +166,15 @@ export const schema = {
     },
     virtualColumns: [],
     associations: {
-
+      guest: {
+        type: 'HasOne',
+        foreignKey: 'userId',
+        foreignKeyTypeColumn: null,
+        tables: ['guests'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
     },
   },
 } as const
@@ -118,6 +184,7 @@ export const connectionTypeConfig = {
   allDefaultScopeNames: [],
   globalNames: {
     models: {
+      'Guest': 'guests',
       'User': 'users'
     },
   },
````
