---
title: Generate Room resource
---

# Generate Room resource

## Commit Message

````
Generate Room resource

```console
pnpm psy g:resource --sti-base-serializer --owning-model=Place v1/host/places/\{\}/rooms Room type:enum:room_types:Bathroom,Bedroom,Kitchen,Den,LivingRoom Place:belongs_to position:integer:optional deleted_at:datetime:optional
````

The `places/{}` (escaped to `places/\{\}` for the console) makes
rooms a nested resource within the places resource, which you can
see with `pnpm psy routes`:

```console
pnpm psy db:migrate
pnpm psy routes
```

````

## Changes

```diff
diff --git a/api/spec/factories/RoomFactory.ts b/api/spec/factories/RoomFactory.ts
new file mode 100644
index 0000000..c75d9f4
--- /dev/null
+++ b/api/spec/factories/RoomFactory.ts
@@ -0,0 +1,10 @@
+import { UpdateableProperties } from '@rvoh/dream/types'
+import Room from '@models/Room.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+
+export default async function createRoom(attrs: UpdateableProperties<Room> = {}) {
+  return await Room.create({
+    place: attrs.place ? null : await createPlace(),
+    ...attrs,
+  })
+}
diff --git a/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts b/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
new file mode 100644
index 0000000..6c5f66d
--- /dev/null
+++ b/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
@@ -0,0 +1,175 @@
+import Room from '@models/Room.js'
+import User from '@models/User.js'
+import Place from '@models/Place.js'
+import createRoom from '@spec/factories/RoomFactory.js'
+import createUser from '@spec/factories/UserFactory.js'
+import createPlace from '@spec/factories/PlaceFactory.js'
+import { RequestBody, session, SpecRequestType } from '@spec/unit/helpers/authentication.js'
+
+describe('V1/Host/Places/RoomsController', () => {
+  let request: SpecRequestType
+  let user: User
+  let place: Place
+
+  beforeEach(async () => {
+    user = await createUser()
+    place = await createPlace({ user })
+    request = await session(user)
+  })
+
+  describe('GET index', () => {
+    const indexRooms = async <StatusCode extends 200 | 400 | 404>(expectedStatus: StatusCode) => {
+      return request.get('/v1/host/places/{placeId}/rooms', expectedStatus, {
+        placeId: place.id,
+      })
+    }
+
+    it('returns the index of Rooms', async () => {
+      const room = await createRoom({ place })
+
+      const { body } = await indexRooms(200)
+
+      expect(body.results).toEqual([
+        expect.objectContaining({
+          id: room.id,
+        }),
+      ])
+    })
+
+    context('Rooms created by another Place', () => {
+      it('are omitted', async () => {
+        await createRoom()
+
+        const { body } = await indexRooms(200)
+
+        expect(body.results).toEqual([])
+      })
+    })
+  })
+
+  describe('GET show', () => {
+    const showRoom = async <StatusCode extends 200 | 400 | 404>(room: Room, expectedStatus: StatusCode) => {
+      return request.get('/v1/host/places/{placeId}/rooms/{id}', expectedStatus, {
+        placeId: place.id,
+        id: room.id,
+      })
+    }
+
+    it('returns the specified Room', async () => {
+      const room = await createRoom({ place })
+
+      const { body } = await showRoom(room, 200)
+
+      expect(body).toEqual(
+        expect.objectContaining({
+          id: room.id,
+          type: room.type,
+          position: room.position,
+        }),
+      )
+    })
+
+    context('Room created by another Place', () => {
+      it('is not found', async () => {
+        const otherPlaceRoom = await createRoom()
+
+        await showRoom(otherPlaceRoom, 404)
+      })
+    })
+  })
+
+  describe('POST create', () => {
+    const createRoom = async <StatusCode extends 201 | 400 | 404>(
+      data: RequestBody<'post', '/v1/host/places/{placeId}/rooms'>,
+      expectedStatus: StatusCode
+    ) => {
+      return request.post('/v1/host/places/{placeId}/rooms', expectedStatus, {
+        placeId: place.id,
+        data
+      })
+    }
+
+    it('creates a Room for this Place', async () => {
+      const { body } = await createRoom({
+        position: 1,
+      }, 201)
+
+      const room = await place.associationQuery('rooms').firstOrFail()
+      expect(room.position).toEqual(1)
+
+      expect(body).toEqual(
+        expect.objectContaining({
+          id: room.id,
+          type: room.type,
+          position: room.position,
+        }),
+      )
+    })
+  })
+
+  describe('PATCH update', () => {
+    const updateRoom = async <StatusCode extends 204 | 400 | 404>(
+      room: Room,
+      data: RequestBody<'patch', '/v1/host/places/{placeId}/rooms/{id}'>,
+      expectedStatus: StatusCode
+    ) => {
+      return request.patch('/v1/host/places/{placeId}/rooms/{id}', expectedStatus, {
+        placeId: place.id,
+        id: room.id,
+        data,
+      })
+    }
+
+    it('updates the Room', async () => {
+      const room = await createRoom({ place })
+
+      await updateRoom(room, {
+        position: 2,
+      }, 204)
+
+      await room.reload()
+      expect(room.position).toEqual(2)
+    })
+
+    context('a Room created by another Place', () => {
+      it('is not updated', async () => {
+        const room = await createRoom()
+        const originalPosition = room.position
+
+        await updateRoom(room, {
+          position: 2,
+        }, 404)
+
+        await room.reload()
+        expect(room.position).toEqual(originalPosition)
+      })
+    })
+  })
+
+  describe('DELETE destroy', () => {
+    const destroyRoom = async <StatusCode extends 204 | 400 | 404>(room: Room, expectedStatus: StatusCode) => {
+      return request.delete('/v1/host/places/{placeId}/rooms/{id}', expectedStatus, {
+        placeId: place.id,
+        id: room.id,
+      })
+    }
+
+    it('deletes the Room', async () => {
+      const room = await createRoom({ place })
+
+      await destroyRoom(room, 204)
+
+      expect(await Room.find(room.id)).toBeNull()
+    })
+
+    context('a Room created by another Place', () => {
+      it('is not deleted', async () => {
+        const room = await createRoom()
+
+        await destroyRoom(room, 404)
+
+        expect(await Room.find(room.id)).toMatchDreamModel(room)
+      })
+    })
+  })
+})
diff --git a/api/spec/unit/models/Room.spec.ts b/api/spec/unit/models/Room.spec.ts
new file mode 100644
index 0000000..1e8d460
--- /dev/null
+++ b/api/spec/unit/models/Room.spec.ts
@@ -0,0 +1,3 @@
+describe('Room', () => {
+  it.todo('add a test here to get started building Room')
+})
diff --git a/api/src/app/controllers/V1/Host/Places/BaseController.ts b/api/src/app/controllers/V1/Host/Places/BaseController.ts
new file mode 100644
index 0000000..475dacc
--- /dev/null
+++ b/api/src/app/controllers/V1/Host/Places/BaseController.ts
@@ -0,0 +1,5 @@
+import V1HostBaseController from '../BaseController.js'
+
+export default class V1HostPlacesBaseController extends V1HostBaseController {
+
+}
diff --git a/api/src/app/controllers/V1/Host/Places/RoomsController.ts b/api/src/app/controllers/V1/Host/Places/RoomsController.ts
new file mode 100644
index 0000000..b64c592
--- /dev/null
+++ b/api/src/app/controllers/V1/Host/Places/RoomsController.ts
@@ -0,0 +1,71 @@
+import { OpenAPI } from '@rvoh/psychic'
+import V1HostPlacesBaseController from './BaseController.js'
+import Room from '@models/Room.js'
+
+const openApiTags = ['rooms']
+
+export default class V1HostPlacesRoomsController extends V1HostPlacesBaseController {
+  @OpenAPI(Room, {
+    status: 200,
+    tags: openApiTags,
+    description: 'Paginated index of Rooms',
+    scrollPaginate: true,
+    serializerKey: 'summary',
+  })
+  public async index() {
+    // const rooms = await this.currentPlace.associationQuery('rooms')
+    //   .preloadFor('summary')
+    //   .order({ createdAt: 'desc' })
+    //   .scrollPaginate({ cursor: this.castParam('cursor', 'string', { allowNull: true }) })
+    // this.ok(rooms)
+  }
+
+  @OpenAPI(Room, {
+    status: 200,
+    tags: openApiTags,
+    description: 'Fetch a Room',
+  })
+  public async show() {
+    // const room = await this.room()
+    // this.ok(room)
+  }
+
+  @OpenAPI(Room, {
+    status: 201,
+    tags: openApiTags,
+    description: 'Create a Room',
+  })
+  public async create() {
+    // let room = await this.currentPlace.createAssociation('rooms', this.paramsFor(Room))
+    // if (room.isPersisted) room = await room.loadFor('default').execute()
+    // this.created(room)
+  }
+
+  @OpenAPI(Room, {
+    status: 204,
+    tags: openApiTags,
+    description: 'Update a Room',
+  })
+  public async update() {
+    // const room = await this.room()
+    // await room.update(this.paramsFor(Room))
+    // this.noContent()
+  }
+
+  @OpenAPI({
+    status: 204,
+    tags: openApiTags,
+    description: 'Destroy a Room',
+  })
+  public async destroy() {
+    // const room = await this.room()
+    // await room.destroy()
+    // this.noContent()
+  }
+
+  private async room() {
+    // return await this.currentPlace.associationQuery('rooms')
+    //   .preloadFor('default')
+    //   .findOrFail(this.castParam('id', 'string'))
+  }
+}
diff --git a/api/src/app/models/Room.ts b/api/src/app/models/Room.ts
new file mode 100644
index 0000000..4ea9146
--- /dev/null
+++ b/api/src/app/models/Room.ts
@@ -0,0 +1,30 @@
+import { Decorators } from '@rvoh/dream'
+import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
+import ApplicationModel from '@models/ApplicationModel.js'
+import Place from '@models/Place.js'
+
+const deco = new Decorators<typeof Room>()
+
+export default class Room extends ApplicationModel {
+  public override get table() {
+    return 'rooms' as const
+  }
+
+  public get serializers(): DreamSerializers<Room> {
+    return {
+      default: 'RoomSerializer',
+      summary: 'RoomSummarySerializer',
+    }
+  }
+
+  public id: DreamColumn<Room, 'id'>
+  public type: DreamColumn<Room, 'type'>
+  public position: DreamColumn<Room, 'position'>
+  public deletedAt: DreamColumn<Room, 'deletedAt'>
+  public createdAt: DreamColumn<Room, 'createdAt'>
+  public updatedAt: DreamColumn<Room, 'updatedAt'>
+
+  @deco.BelongsTo('Place', { on: 'placeId' })
+  public place: Place
+  public placeId: DreamColumn<Room, 'placeId'>
+}
diff --git a/api/src/app/serializers/RoomSerializer.ts b/api/src/app/serializers/RoomSerializer.ts
new file mode 100644
index 0000000..79390f9
--- /dev/null
+++ b/api/src/app/serializers/RoomSerializer.ts
@@ -0,0 +1,12 @@
+import { DreamSerializer } from '@rvoh/dream'
+import Room from '@models/Room.js'
+
+export const RoomSummarySerializer = <T extends Room>(StiChildClass: typeof Room, room: T) =>
+  DreamSerializer(StiChildClass ?? Room, room)
+    .attribute('id')
+
+export const RoomSerializer = <T extends Room>(StiChildClass: typeof Room, room: T) =>
+  RoomSummarySerializer(StiChildClass, room)
+    .attribute('type', { openapi: { type: 'string', enum: [(StiChildClass ?? Room).sanitizedName] } })
+    .attribute('position')
+    .attribute('deletedAt')
diff --git a/api/src/conf/routes.ts b/api/src/conf/routes.ts
index 198aa15..036f15f 100644
--- a/api/src/conf/routes.ts
+++ b/api/src/conf/routes.ts
@@ -4,7 +4,11 @@ import { PsychicRouter } from '@rvoh/psychic'
 export default function routes(r: PsychicRouter) {
   r.namespace('v1', r => {
     r.namespace('host', r => {
-      r.resources('places')
+      r.resources('places', r => {
+        r.resources('rooms')
+
+      })
+
     })
   })

diff --git a/api/src/db/migrations/1764184174971-create-room.ts b/api/src/db/migrations/1764184174971-create-room.ts
new file mode 100644
index 0000000..ab4029e
--- /dev/null
+++ b/api/src/db/migrations/1764184174971-create-room.ts
@@ -0,0 +1,51 @@
+import { Kysely, sql } from 'kysely'
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function up(db: Kysely<any>): Promise<void> {
+  await db.schema
+    .createType('room_types_enum')
+    .asEnum([
+      'Bathroom',
+      'Bedroom',
+      'Kitchen',
+      'Den',
+      'LivingRoom'
+    ])
+    .execute()
+
+  await db.schema
+    .createTable('rooms')
+    .addColumn('id', 'uuid', col =>
+      col
+        .primaryKey()
+        .defaultTo(sql`uuid_generate_v4()`),
+    )
+    .addColumn('type', sql`room_types_enum`, col => col.notNull())
+    .addColumn('place_id', 'uuid', col => col.references('places.id').onDelete('restrict').notNull())
+    .addColumn('position', 'integer')
+    .addColumn('deleted_at', 'timestamp')
+    .addColumn('created_at', 'timestamp', col => col.notNull())
+    .addColumn('updated_at', 'timestamp', col => col.notNull())
+    .execute()
+
+  await db.schema
+    .createIndex('rooms_type')
+    .on('rooms')
+    .column('type')
+    .execute()
+
+  await db.schema
+    .createIndex('rooms_place_id')
+    .on('rooms')
+    .column('place_id')
+    .execute()
+}
+
+// eslint-disable-next-line @typescript-eslint/no-explicit-any
+export async function down(db: Kysely<any>): Promise<void> {
+  await db.schema.dropIndex('rooms_type').execute()
+  await db.schema.dropIndex('rooms_place_id').execute()
+  await db.schema.dropTable('rooms').execute()
+
+  await db.schema.dropType('room_types_enum').execute()
+}
\ No newline at end of file
````
