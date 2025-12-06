---
title: Generate Room/Den and Room/LivingRoom STI models
---

# Generate Room/Den and Room/LivingRoom STI models

## Commit Message

````
Generate Room/Den and Room/LivingRoom STI models

```console
pnpm psy g:sti-child Room/Den extends Room
pnpm psy g:sti-child Room/LivingRoom extends Room
````

````

## Changes

```diff
diff --git a/api/spec/factories/Room/DenFactory.ts b/api/spec/factories/Room/DenFactory.ts
new file mode 100644
index 0000000..4840bb0
--- /dev/null
+++ b/api/spec/factories/Room/DenFactory.ts
@@ -0,0 +1,8 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import RoomDen from '@models/Room/Den.js'
+
+export default async function createRoomDen(attrs: UpdateableProperties<RoomDen> = {}) {
+  return await RoomDen.create({
+    ...attrs,
+  })
+}
diff --git a/api/spec/factories/Room/LivingRoomFactory.ts b/api/spec/factories/Room/LivingRoomFactory.ts
new file mode 100644
index 0000000..501cde5
--- /dev/null
+++ b/api/spec/factories/Room/LivingRoomFactory.ts
@@ -0,0 +1,8 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import RoomLivingRoom from '@models/Room/LivingRoom.js'
+
+export default async function createRoomLivingRoom(attrs: UpdateableProperties<RoomLivingRoom> = {}) {
+  return await RoomLivingRoom.create({
+    ...attrs,
+  })
+}
diff --git a/api/spec/unit/models/Room/Den.spec.ts b/api/spec/unit/models/Room/Den.spec.ts
new file mode 100644
index 0000000..f1e12ce
--- /dev/null
+++ b/api/spec/unit/models/Room/Den.spec.ts
@@ -0,0 +1,3 @@
+describe('Room/Den', () => {
+  it.todo('add a test here to get started building Room/Den')
+})
diff --git a/api/spec/unit/models/Room/LivingRoom.spec.ts b/api/spec/unit/models/Room/LivingRoom.spec.ts
new file mode 100644
index 0000000..6e4aa50
--- /dev/null
+++ b/api/spec/unit/models/Room/LivingRoom.spec.ts
@@ -0,0 +1,3 @@
+describe('Room/LivingRoom', () => {
+  it.todo('add a test here to get started building Room/LivingRoom')
+})
diff --git a/api/src/app/models/Room/Den.ts b/api/src/app/models/Room/Den.ts
new file mode 100644
index 0000000..7f67007
--- /dev/null
+++ b/api/src/app/models/Room/Den.ts
@@ -0,0 +1,16 @@
+import { Decorators, STI } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import Room from '@models/Room.js'
+
+const deco = new Decorators<typeof RoomDen>()
+
+@STI(Room)
+export default class RoomDen extends Room {
+  public override get serializers(): DreamSerializers<RoomDen> {
+    return {
+      default: 'Room/DenSerializer',
+      summary: 'Room/DenSummarySerializer',
+    }
+  }
+
+}
diff --git a/api/src/app/models/Room/LivingRoom.ts b/api/src/app/models/Room/LivingRoom.ts
new file mode 100644
index 0000000..feaca2f
--- /dev/null
+++ b/api/src/app/models/Room/LivingRoom.ts
@@ -0,0 +1,16 @@
+import { Decorators, STI } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import Room from '@models/Room.js'
+
+const deco = new Decorators<typeof RoomLivingRoom>()
+
+@STI(Room)
+export default class RoomLivingRoom extends Room {
+  public override get serializers(): DreamSerializers<RoomLivingRoom> {
+    return {
+      default: 'Room/LivingRoomSerializer',
+      summary: 'Room/LivingRoomSummarySerializer',
+    }
+  }
+
+}
diff --git a/api/src/app/serializers/Room/DenSerializer.ts b/api/src/app/serializers/Room/DenSerializer.ts
new file mode 100644
index 0000000..9030e23
--- /dev/null
+++ b/api/src/app/serializers/Room/DenSerializer.ts
@@ -0,0 +1,8 @@
+import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
+import RoomDen from '@models/Room/Den.js'
+
+export const RoomDenSummarySerializer = (roomDen: RoomDen) =>
+  RoomSummarySerializer(RoomDen, roomDen)
+
+export const RoomDenSerializer = (roomDen: RoomDen) =>
+  RoomSerializer(RoomDen, roomDen)
diff --git a/api/src/app/serializers/Room/LivingRoomSerializer.ts b/api/src/app/serializers/Room/LivingRoomSerializer.ts
new file mode 100644
index 0000000..e44755e
--- /dev/null
+++ b/api/src/app/serializers/Room/LivingRoomSerializer.ts
@@ -0,0 +1,8 @@
+import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
+import RoomLivingRoom from '@models/Room/LivingRoom.js'
+
+export const RoomLivingRoomSummarySerializer = (roomLivingRoom: RoomLivingRoom) =>
+  RoomSummarySerializer(RoomLivingRoom, roomLivingRoom)
+
+export const RoomLivingRoomSerializer = (roomLivingRoom: RoomLivingRoom) =>
+  RoomSerializer(RoomLivingRoom, roomLivingRoom)
````
