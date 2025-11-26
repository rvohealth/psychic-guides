---
title: Generate Host model
---

# Generate Host model

## Commit Message

```
Generate Host model

```console
yarn psy g:model Host User:belongs_to
```
```

## Changes

```diff
diff --git a/api/spec/factories/HostFactory.ts b/api/spec/factories/HostFactory.ts
new file mode 100644
index 0000000..d28f07b
--- /dev/null
+++ b/api/spec/factories/HostFactory.ts
@@ -0,0 +1,10 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import Host from '@models/Host.js'
+import createUser from '@spec/factories/UserFactory.js'
+
+export default async function createHost(attrs: UpdateableProperties<Host> = {}) {
+  return await Host.create({
+    user: attrs.user ? null : await createUser(),
+    ...attrs,
+  })
+}
diff --git a/api/spec/unit/models/Host.spec.ts b/api/spec/unit/models/Host.spec.ts
new file mode 100644
index 0000000..9255d5c
--- /dev/null
+++ b/api/spec/unit/models/Host.spec.ts
@@ -0,0 +1,3 @@
+describe('Host', () => {
+  it.todo('add a test here to get started building Host')
+})
diff --git a/api/src/app/models/Host.ts b/api/src/app/models/Host.ts
new file mode 100644
index 0000000..8536e0d
--- /dev/null
+++ b/api/src/app/models/Host.ts
@@ -0,0 +1,27 @@
+import { Decorators } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import ApplicationModel from '@models/ApplicationModel.js'
+import User from '@models/User.js'
+
+const deco = new Decorators<typeof Host>()
+
+export default class Host extends ApplicationModel {
+  public override get table() {
+    return 'hosts' as const
+  }
+
+  public get serializers(): DreamSerializers<Host> {
+    return {
+      default: 'HostSerializer',
+      summary: 'HostSummarySerializer',
+    }
+  }
+
+  public id: DreamColumn<Host, 'id'>
+  public createdAt: DreamColumn<Host, 'createdAt'>
+  public updatedAt: DreamColumn<Host, 'updatedAt'>
+
+  @deco.BelongsTo('User', { on: 'userId' })
+  public user: User
+  public userId: DreamColumn<Host, 'userId'>
+}
diff --git a/api/src/app/serializers/HostSerializer.ts b/api/src/app/serializers/HostSerializer.ts
new file mode 100644
index 0000000..9ccbada
--- /dev/null
+++ b/api/src/app/serializers/HostSerializer.ts
@@ -0,0 +1,9 @@
+import { DreamSerializer } from '@rvoh/dream'
+import Host from '@models/Host.js'
+
+export const HostSummarySerializer = (host: Host) =>
+  DreamSerializer(Host, host)
+    .attribute('id')
+
+export const HostSerializer = (host: Host) =>
+  HostSummarySerializer(host)
diff --git a/api/src/db/migrations/1764175837654-create-host.ts b/api/src/db/migrations/1764175837654-create-host.ts
new file mode 100644
index 0000000..9157b9b
--- /dev/null
+++ b/api/src/db/migrations/1764175837654-create-host.ts
@@ -0,0 +1,28 @@
+import { Kysely, sql } from 'kysely'
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function up(db: Kysely<any>): Promise<void> {
+  await db.schema
+    .createTable('hosts')
+    .addColumn('id', 'uuid', col =>
+      col
+        .primaryKey()
+        .defaultTo(sql`uuid_generate_v4()`),
+    )
+    .addColumn('user_id', 'uuid', col => col.references('users.id').onDelete('restrict').notNull())
+    .addColumn('created_at', 'timestamp', col => col.notNull())
+    .addColumn('updated_at', 'timestamp', col => col.notNull())
+    .execute()
+
+  await db.schema
+    .createIndex('hosts_user_id')
+    .on('hosts')
+    .column('user_id')
+    .execute()
+}
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function down(db: Kysely<any>): Promise<void> {
+  await db.schema.dropIndex('hosts_user_id').execute()
+  await db.schema.dropTable('hosts').execute()
+}
\ No newline at end of file
```
