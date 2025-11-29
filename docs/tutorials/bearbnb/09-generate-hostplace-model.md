---
title: Generate HostPlace model
---

# Generate HostPlace model

## Commit Message

```
Generate HostPlace model

```console
yarn psy g:model --no-serializer HostPlace Host:belongs_to Place:belongs_to deleted_at:datetime:optional
```
```

## Changes

```diff
diff --git a/api/spec/factories/HostPlaceFactory.ts b/api/spec/factories/HostPlaceFactory.ts
new file mode 100644
index 0000000..aeb0b16
--- /dev/null
+++ b/api/spec/factories/HostPlaceFactory.ts
@@ -0,0 +1,12 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import HostPlace from '@models/HostPlace.js'
+import createHost from '@spec/factories/HostFactory.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+
+export default async function createHostPlace(attrs: UpdateableProperties<HostPlace> = {}) {
+  return await HostPlace.create({
+    host: attrs.host ? null : await createHost(),
+    place: attrs.place ? null : await createPlace(),
+    ...attrs,
+  })
+}
diff --git a/api/spec/unit/models/HostPlace.spec.ts b/api/spec/unit/models/HostPlace.spec.ts
new file mode 100644
index 0000000..0c03533
--- /dev/null
+++ b/api/spec/unit/models/HostPlace.spec.ts
@@ -0,0 +1,3 @@
+describe('HostPlace', () => {
+  it.todo('add a test here to get started building HostPlace')
+})
diff --git a/api/src/app/models/HostPlace.ts b/api/src/app/models/HostPlace.ts
new file mode 100644
index 0000000..baf74e2
--- /dev/null
+++ b/api/src/app/models/HostPlace.ts
@@ -0,0 +1,26 @@
+import { Decorators } from '@rvoh/dream'
+import { DreamColumn } from '@rvoh/dream/types'
+import ApplicationModel from '@models/ApplicationModel.js'
+import Host from '@models/Host.js'
+import Place from '@models/Place.js'
+
+const deco = new Decorators<typeof HostPlace>()
+
+export default class HostPlace extends ApplicationModel {
+  public override get table() {
+    return 'host_places' as const
+  }
+
+  public id: DreamColumn<HostPlace, 'id'>
+  public deletedAt: DreamColumn<HostPlace, 'deletedAt'>
+  public createdAt: DreamColumn<HostPlace, 'createdAt'>
+  public updatedAt: DreamColumn<HostPlace, 'updatedAt'>
+
+  @deco.BelongsTo('Host', { on: 'hostId' })
+  public host: Host
+  public hostId: DreamColumn<HostPlace, 'hostId'>
+
+  @deco.BelongsTo('Place', { on: 'placeId' })
+  public place: Place
+  public placeId: DreamColumn<HostPlace, 'placeId'>
+}
diff --git a/api/src/db/migrations/1764176778158-create-host-place.ts b/api/src/db/migrations/1764176778158-create-host-place.ts
new file mode 100644
index 0000000..7d47d55
--- /dev/null
+++ b/api/src/db/migrations/1764176778158-create-host-place.ts
@@ -0,0 +1,37 @@
+import { Kysely, sql } from 'kysely'
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function up(db: Kysely<any>): Promise<void> {
+  await db.schema
+    .createTable('host_places')
+    .addColumn('id', 'uuid', col =>
+      col
+        .primaryKey()
+        .defaultTo(sql`uuid_generate_v4()`),
+    )
+    .addColumn('host_id', 'uuid', col => col.references('hosts.id').onDelete('restrict').notNull())
+    .addColumn('place_id', 'uuid', col => col.references('places.id').onDelete('restrict').notNull())
+    .addColumn('deleted_at', 'timestamp')
+    .addColumn('created_at', 'timestamp', col => col.notNull())
+    .addColumn('updated_at', 'timestamp', col => col.notNull())
+    .execute()
+
+  await db.schema
+    .createIndex('host_places_host_id')
+    .on('host_places')
+    .column('host_id')
+    .execute()
+
+  await db.schema
+    .createIndex('host_places_place_id')
+    .on('host_places')
+    .column('place_id')
+    .execute()
+}
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function down(db: Kysely<any>): Promise<void> {
+  await db.schema.dropIndex('host_places_host_id').execute()
+  await db.schema.dropIndex('host_places_place_id').execute()
+  await db.schema.dropTable('host_places').execute()
+}
\ No newline at end of file
```
