---
title: Generate Room/Bathroom STI model
---

# Generate Room/Bathroom STI model

## Commit Message

```
Generate Room/Bathroom STI model

```console
yarn psy g:sti-child --help
yarn psy g:sti-child Room/Bathroom extends Room bath_or_shower_style:enum:bath_or_shower_styles:bath,shower,bath_and_shower,none
```
```

## Changes

```diff
diff --git a/api/spec/factories/Room/BathroomFactory.ts b/api/spec/factories/Room/BathroomFactory.ts
new file mode 100644
index 0000000..a7bf14e
--- /dev/null
+++ b/api/spec/factories/Room/BathroomFactory.ts
@@ -0,0 +1,9 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import RoomBathroom from '@models/Room/Bathroom.js'
+
+export default async function createRoomBathroom(attrs: UpdateableProperties<RoomBathroom> = {}) {
+  return await RoomBathroom.create({
+    bathOrShowerStyle: 'bath',
+    ...attrs,
+  })
+}
diff --git a/api/spec/unit/models/Room/Bathroom.spec.ts b/api/spec/unit/models/Room/Bathroom.spec.ts
new file mode 100644
index 0000000..25a6823
--- /dev/null
+++ b/api/spec/unit/models/Room/Bathroom.spec.ts
@@ -0,0 +1,3 @@
+describe('Room/Bathroom', () => {
+  it.todo('add a test here to get started building Room/Bathroom')
+})
diff --git a/api/src/app/models/Room/Bathroom.ts b/api/src/app/models/Room/Bathroom.ts
new file mode 100644
index 0000000..be5bd2d
--- /dev/null
+++ b/api/src/app/models/Room/Bathroom.ts
@@ -0,0 +1,17 @@
+import { Decorators, STI } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import Room from '@models/Room.js'
+
+const deco = new Decorators<typeof RoomBathroom>()
+
+@STI(Room)
+export default class RoomBathroom extends Room {
+  public override get serializers(): DreamSerializers<RoomBathroom> {
+    return {
+      default: 'Room/BathroomSerializer',
+      summary: 'Room/BathroomSummarySerializer',
+    }
+  }
+
+  public bathOrShowerStyle: DreamColumn<RoomBathroom, 'bathOrShowerStyle'>
+}
diff --git a/api/src/app/serializers/Room/BathroomSerializer.ts b/api/src/app/serializers/Room/BathroomSerializer.ts
new file mode 100644
index 0000000..1e713c1
--- /dev/null
+++ b/api/src/app/serializers/Room/BathroomSerializer.ts
@@ -0,0 +1,9 @@
+import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
+import RoomBathroom from '@models/Room/Bathroom.js'
+
+export const RoomBathroomSummarySerializer = (roomBathroom: RoomBathroom) =>
+  RoomSummarySerializer(RoomBathroom, roomBathroom)
+
+export const RoomBathroomSerializer = (roomBathroom: RoomBathroom) =>
+  RoomSerializer(RoomBathroom, roomBathroom)
+    .attribute('bathOrShowerStyle')
diff --git a/api/src/db/migrations/1764184213461-create-room-bathroom.ts b/api/src/db/migrations/1764184213461-create-room-bathroom.ts
new file mode 100644
index 0000000..8896e86
--- /dev/null
+++ b/api/src/db/migrations/1764184213461-create-room-bathroom.ts
@@ -0,0 +1,37 @@
+import { Kysely, sql } from 'kysely'
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function up(db: Kysely<any>): Promise<void> {
+  await db.schema
+    .createType('bath_or_shower_styles_enum')
+    .asEnum([
+      'bath',
+      'shower',
+      'bath_and_shower',
+      'none'
+    ])
+    .execute()
+
+  await db.schema
+    .alterTable('rooms')
+    .addColumn('bath_or_shower_style', sql`bath_or_shower_styles_enum`)
+    .execute()
+
+  await db.schema
+    .alterTable('rooms')
+    .addCheckConstraint(
+      'rooms_not_null_bath_or_shower_style',
+      sql`type != 'RoomBathroom' OR bath_or_shower_style IS NOT NULL`,
+    )
+    .execute()
+}
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function down(db: Kysely<any>): Promise<void> {
+  await db.schema
+    .alterTable('rooms')
+    .dropColumn('bath_or_shower_style')
+    .execute()
+
+  await db.schema.dropType('bath_or_shower_styles_enum').execute()
+}
\ No newline at end of file
```
