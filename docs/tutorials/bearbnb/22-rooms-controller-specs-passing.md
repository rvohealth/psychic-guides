---
title: Rooms controller specs passing
---

# Rooms controller specs passing

## Commit Message

````
Rooms controller specs passing

Note the changes in api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts:
1. The room is no longer the base STI model because, in STI, we can't instantiate
   the base model, only child models, so we choose an arbitrary Room child to stand
   in for any Room.
     • to this end, the `roomFactory` was deleted, and all of the child
       room factories updated with the initialization lines from `roomFactory`
     • similarly, removed the serializer from the base Room model, which necessitated
       removing override from the room STI child models
2. The request body to the create and update endpoints are changed to reflect the STI
   child we are creating / updating.

```console
pnpm psy sync

pnpm uspec spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
````

````

## Changes

```diff
diff --git a/api/spec/factories/Room/BathroomFactory.ts b/api/spec/factories/Room/BathroomFactory.ts
index 7ffc1b1..ea574b2 100644
--- a/api/spec/factories/Room/BathroomFactory.ts
+++ b/api/spec/factories/Room/BathroomFactory.ts
@@ -1,8 +1,10 @@
 import Bathroom from '@models/Room/Bathroom.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from '@spec/factories/PlaceFactory.js'

 export default async function createRoomBathroom(attrs: UpdateableProperties<Bathroom> = {}) {
   return await Bathroom.create({
+    place: attrs.place ? null : await createPlace(),
     bathOrShowerStyle: 'bath',
     ...attrs,
   })
diff --git a/api/spec/factories/Room/BedroomFactory.ts b/api/spec/factories/Room/BedroomFactory.ts
index 67bb8ec..349886c 100644
--- a/api/spec/factories/Room/BedroomFactory.ts
+++ b/api/spec/factories/Room/BedroomFactory.ts
@@ -1,8 +1,10 @@
 import Bedroom from '@models/Room/Bedroom.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from '@spec/factories/PlaceFactory.js'

 export default async function createRoomBedroom(attrs: UpdateableProperties<Bedroom> = {}) {
   return await Bedroom.create({
+    place: attrs.place ? null : await createPlace(),
     bedTypes: ['twin'],
     ...attrs,
   })
diff --git a/api/spec/factories/Room/DenFactory.ts b/api/spec/factories/Room/DenFactory.ts
index 36df1c4..bc39d86 100644
--- a/api/spec/factories/Room/DenFactory.ts
+++ b/api/spec/factories/Room/DenFactory.ts
@@ -1,8 +1,10 @@
 import Den from '@models/Room/Den.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from '@spec/factories/PlaceFactory.js'

 export default async function createRoomDen(attrs: UpdateableProperties<Den> = {}) {
   return await Den.create({
+    place: attrs.place ? null : await createPlace(),
     ...attrs,
   })
 }
diff --git a/api/spec/factories/Room/KitchenFactory.ts b/api/spec/factories/Room/KitchenFactory.ts
index 2e89aa9..66ef239 100644
--- a/api/spec/factories/Room/KitchenFactory.ts
+++ b/api/spec/factories/Room/KitchenFactory.ts
@@ -1,8 +1,10 @@
 import Kitchen from '@models/Room/Kitchen.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from '@spec/factories/PlaceFactory.js'

 export default async function createRoomKitchen(attrs: UpdateableProperties<Kitchen> = {}) {
   return await Kitchen.create({
+    place: attrs.place ? null : await createPlace(),
     appliances: ['stove'],
     ...attrs,
   })
diff --git a/api/spec/factories/Room/LivingRoomFactory.ts b/api/spec/factories/Room/LivingRoomFactory.ts
index 41b9807..d57edae 100644
--- a/api/spec/factories/Room/LivingRoomFactory.ts
+++ b/api/spec/factories/Room/LivingRoomFactory.ts
@@ -1,8 +1,10 @@
 import LivingRoom from '@models/Room/LivingRoom.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
+import createPlace from '@spec/factories/PlaceFactory.js'

 export default async function createRoomLivingRoom(attrs: UpdateableProperties<LivingRoom> = {}) {
   return await LivingRoom.create({
+    place: attrs.place ? null : await createPlace(),
     ...attrs,
   })
 }
diff --git a/api/spec/factories/RoomFactory.ts b/api/spec/factories/RoomFactory.ts
deleted file mode 100644
index c75d9f4..0000000
--- a/api/spec/factories/RoomFactory.ts
+++ /dev/null
@@ -1,10 +0,0 @@
-import { UpdateableProperties } from '@rvoh/dream/types'
-import Room from '@models/Room.js'
-import createPlace from '@spec/factories/PlaceFactory.js'
-
-export default async function createRoom(attrs: UpdateableProperties<Room> = {}) {
-  return await Room.create({
-    place: attrs.place ? null : await createPlace(),
-    ...attrs,
-  })
-}
diff --git a/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts b/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
index 6c5f66d..f1ded04 100644
--- a/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
+++ b/api/spec/unit/controllers/V1/Host/Places/RoomsController.spec.ts
@@ -1,9 +1,12 @@
+import Place from '@models/Place.js'
 import Room from '@models/Room.js'
+import Kitchen from '@models/Room/Kitchen.js'
 import User from '@models/User.js'
-import Place from '@models/Place.js'
-import createRoom from '@spec/factories/RoomFactory.js'
-import createUser from '@spec/factories/UserFactory.js'
+import createHost from '@spec/factories/HostFactory.js'
+import createHostPlace from '@spec/factories/HostPlaceFactory.js'
 import createPlace from '@spec/factories/PlaceFactory.js'
+import createRoomKitchen from '@spec/factories/Room/KitchenFactory.js'
+import createUser from '@spec/factories/UserFactory.js'
 import { RequestBody, session, SpecRequestType } from '@spec/unit/helpers/authentication.js'

 describe('V1/Host/Places/RoomsController', () => {
@@ -13,7 +16,9 @@ describe('V1/Host/Places/RoomsController', () => {

   beforeEach(async () => {
     user = await createUser()
-    place = await createPlace({ user })
+    const host = await createHost({ user })
+    place = await createPlace()
+    await createHostPlace({ host, place })
     request = await session(user)
   })

@@ -25,7 +30,7 @@ describe('V1/Host/Places/RoomsController', () => {
     }

     it('returns the index of Rooms', async () => {
-      const room = await createRoom({ place })
+      const room = await createRoomKitchen({ place })

       const { body } = await indexRooms(200)

@@ -38,7 +43,7 @@ describe('V1/Host/Places/RoomsController', () => {

     context('Rooms created by another Place', () => {
       it('are omitted', async () => {
-        await createRoom()
+        await createRoomKitchen()

         const { body } = await indexRooms(200)

@@ -56,7 +61,7 @@ describe('V1/Host/Places/RoomsController', () => {
     }

     it('returns the specified Room', async () => {
-      const room = await createRoom({ place })
+      const room = await createRoomKitchen({ place })

       const { body } = await showRoom(room, 200)

@@ -71,7 +76,7 @@ describe('V1/Host/Places/RoomsController', () => {

     context('Room created by another Place', () => {
       it('is not found', async () => {
-        const otherPlaceRoom = await createRoom()
+        const otherPlaceRoom = await createRoomKitchen()

         await showRoom(otherPlaceRoom, 404)
       })
@@ -81,27 +86,32 @@ describe('V1/Host/Places/RoomsController', () => {
   describe('POST create', () => {
     const createRoom = async <StatusCode extends 201 | 400 | 404>(
       data: RequestBody<'post', '/v1/host/places/{placeId}/rooms'>,
-      expectedStatus: StatusCode
+      expectedStatus: StatusCode,
     ) => {
       return request.post('/v1/host/places/{placeId}/rooms', expectedStatus, {
         placeId: place.id,
-        data
+        data,
       })
     }

     it('creates a Room for this Place', async () => {
-      const { body } = await createRoom({
-        position: 1,
-      }, 201)
+      const { body } = await createRoom(
+        {
+          type: 'Kitchen',
+          appliances: ['oven', 'stove'],
+        },
+        201,
+      )

       const room = await place.associationQuery('rooms').firstOrFail()
-      expect(room.position).toEqual(1)
+      expect(room.type).toEqual('Kitchen')
+      expect((room as Kitchen).appliances).toEqual(['oven', 'stove'])

       expect(body).toEqual(
         expect.objectContaining({
           id: room.id,
-          type: room.type,
-          position: room.position,
+          type: 'Kitchen',
+          appliances: ['oven', 'stove'],
         }),
       )
     })
@@ -111,7 +121,7 @@ describe('V1/Host/Places/RoomsController', () => {
     const updateRoom = async <StatusCode extends 204 | 400 | 404>(
       room: Room,
       data: RequestBody<'patch', '/v1/host/places/{placeId}/rooms/{id}'>,
-      expectedStatus: StatusCode
+      expectedStatus: StatusCode,
     ) => {
       return request.patch('/v1/host/places/{placeId}/rooms/{id}', expectedStatus, {
         placeId: place.id,
@@ -121,33 +131,44 @@ describe('V1/Host/Places/RoomsController', () => {
     }

     it('updates the Room', async () => {
-      const room = await createRoom({ place })
-
-      await updateRoom(room, {
-        position: 2,
-      }, 204)
+      const room = await createRoomKitchen({ place })
+
+      await updateRoom(
+        room,
+        {
+          appliances: ['dishwasher'],
+        },
+        204,
+      )

       await room.reload()
-      expect(room.position).toEqual(2)
+      expect(room.appliances).toEqual(['dishwasher'])
     })

     context('a Room created by another Place', () => {
       it('is not updated', async () => {
-        const room = await createRoom()
-        const originalPosition = room.position
+        const room = await createRoomKitchen()
+        const originalAppliances = room.appliances

-        await updateRoom(room, {
-          position: 2,
-        }, 404)
+        await updateRoom(
+          room,
+          {
+            appliances: ['dishwasher'],
+          },
+          404,
+        )

         await room.reload()
-        expect(room.position).toEqual(originalPosition)
+        expect(room.appliances).toEqual(originalAppliances)
       })
     })
   })

   describe('DELETE destroy', () => {
-    const destroyRoom = async <StatusCode extends 204 | 400 | 404>(room: Room, expectedStatus: StatusCode) => {
+    const destroyRoom = async <StatusCode extends 204 | 400 | 404>(
+      room: Room,
+      expectedStatus: StatusCode,
+    ) => {
       return request.delete('/v1/host/places/{placeId}/rooms/{id}', expectedStatus, {
         placeId: place.id,
         id: room.id,
@@ -155,7 +176,7 @@ describe('V1/Host/Places/RoomsController', () => {
     }

     it('deletes the Room', async () => {
-      const room = await createRoom({ place })
+      const room = await createRoomKitchen({ place })

       await destroyRoom(room, 204)

@@ -164,7 +185,7 @@ describe('V1/Host/Places/RoomsController', () => {

     context('a Room created by another Place', () => {
       it('is not deleted', async () => {
-        const room = await createRoom()
+        const room = await createRoomKitchen()

         await destroyRoom(room, 404)

diff --git a/api/src/app/controllers/V1/Host/Places/BaseController.ts b/api/src/app/controllers/V1/Host/Places/BaseController.ts
index 475dacc..9da129a 100644
--- a/api/src/app/controllers/V1/Host/Places/BaseController.ts
+++ b/api/src/app/controllers/V1/Host/Places/BaseController.ts
@@ -1,5 +1,14 @@
+import Place from '@models/Place.js'
+import { BeforeAction } from '@rvoh/psychic'
 import V1HostBaseController from '../BaseController.js'

 export default class V1HostPlacesBaseController extends V1HostBaseController {
+  protected currentPlace: Place

+  @BeforeAction()
+  protected async loadCurrentPlace() {
+    this.currentPlace = await this.currentHost
+      .associationQuery('places')
+      .findOrFail(this.castParam('placeId', 'string'))
+  }
 }
diff --git a/api/src/app/controllers/V1/Host/Places/RoomsController.ts b/api/src/app/controllers/V1/Host/Places/RoomsController.ts
index b64c592..c3d0339 100644
--- a/api/src/app/controllers/V1/Host/Places/RoomsController.ts
+++ b/api/src/app/controllers/V1/Host/Places/RoomsController.ts
@@ -1,6 +1,12 @@
+import Room from '@models/Room.js'
+import Bathroom from '@models/Room/Bathroom.js'
+import Bedroom from '@models/Room/Bedroom.js'
+import Den from '@models/Room/Den.js'
+import Kitchen from '@models/Room/Kitchen.js'
+import LivingRoom from '@models/Room/LivingRoom.js'
 import { OpenAPI } from '@rvoh/psychic'
+import { RoomTypesEnumValues } from '@src/types/db.js'
 import V1HostPlacesBaseController from './BaseController.js'
-import Room from '@models/Room.js'

 const openApiTags = ['rooms']

@@ -13,11 +19,12 @@ export default class V1HostPlacesRoomsController extends V1HostPlacesBaseControl
     serializerKey: 'summary',
   })
   public async index() {
-    // const rooms = await this.currentPlace.associationQuery('rooms')
-    //   .preloadFor('summary')
-    //   .order({ createdAt: 'desc' })
-    //   .scrollPaginate({ cursor: this.castParam('cursor', 'string', { allowNull: true }) })
-    // this.ok(rooms)
+    const rooms = await this.currentPlace
+      .associationQuery('rooms')
+      .preloadFor('summary')
+      .order({ createdAt: 'desc' })
+      .scrollPaginate({ cursor: this.castParam('cursor', 'string', { allowNull: true }) })
+    this.ok(rooms)
   }

   @OpenAPI(Room, {
@@ -26,19 +33,67 @@ export default class V1HostPlacesRoomsController extends V1HostPlacesBaseControl
     description: 'Fetch a Room',
   })
   public async show() {
-    // const room = await this.room()
-    // this.ok(room)
+    const room = await this.room()
+    this.ok(room)
   }

   @OpenAPI(Room, {
     status: 201,
     tags: openApiTags,
     description: 'Create a Room',
+    requestBody: {
+      /**
+       * `type` is normally a protected attribute, but when creating a room, we do want the user
+       * to be able to select room type, we just have to handle it explicitly since it won't be
+       * returned by `paramsFor` (and we don't want it to be since simply setting the type would
+       * not be operating on the correct model, even though the correct model would be hydrated
+       * when loading from the database)
+       */
+      including: ['type'],
+    },
   })
   public async create() {
-    // let room = await this.currentPlace.createAssociation('rooms', this.paramsFor(Room))
-    // if (room.isPersisted) room = await room.loadFor('default').execute()
-    // this.created(room)
+    let room: Room
+    const roomType = this.castParam('type', 'string', { enum: RoomTypesEnumValues })
+
+    // paramsFor is based on the table (even virtual attributes are associated with
+    // the table at the type level), so passing the STI children to paramsFor
+    // would not alter the results
+    const roomParams = this.paramsFor(Room)
+
+    switch (roomType) {
+      case 'Bathroom':
+        room = await Bathroom.create({ place: this.currentPlace, ...roomParams })
+        break
+
+      case 'Bedroom':
+        room = await Bedroom.create({ place: this.currentPlace, ...roomParams })
+        break
+
+      case 'Den':
+        room = await Den.create({ place: this.currentPlace, ...roomParams })
+        break
+
+      case 'Kitchen':
+        room = await Kitchen.create({ place: this.currentPlace, ...roomParams })
+        break
+
+      case 'LivingRoom':
+        room = await LivingRoom.create({ place: this.currentPlace, ...roomParams })
+        break
+
+      default: {
+        // protection so that if a new RoomTypesEnum is ever added, this will throw a type
+        // error at build time until a case is added to handle that new RoomTypesEnum
+        const _never: never = roomType
+
+        // even though this should never happen due to the type protection, throw an error to satisfy later types
+        throw new Error(`Unhandled RoomTypesEnum: ${_never as string}`)
+      }
+    }
+
+    if (room.isPersisted) room = await room.loadFor('default').execute()
+    this.created(room)
   }

   @OpenAPI(Room, {
@@ -47,9 +102,9 @@ export default class V1HostPlacesRoomsController extends V1HostPlacesBaseControl
     description: 'Update a Room',
   })
   public async update() {
-    // const room = await this.room()
-    // await room.update(this.paramsFor(Room))
-    // this.noContent()
+    const room = await this.room()
+    await room.update(this.paramsFor(Room))
+    this.noContent()
   }

   @OpenAPI({
@@ -58,14 +113,15 @@ export default class V1HostPlacesRoomsController extends V1HostPlacesBaseControl
     description: 'Destroy a Room',
   })
   public async destroy() {
-    // const room = await this.room()
-    // await room.destroy()
-    // this.noContent()
+    const room = await this.room()
+    await room.destroy()
+    this.noContent()
   }

   private async room() {
-    // return await this.currentPlace.associationQuery('rooms')
-    //   .preloadFor('default')
-    //   .findOrFail(this.castParam('id', 'string'))
+    return await this.currentPlace
+      .associationQuery('rooms')
+      .preloadFor('default')
+      .findOrFail(this.castParam('id', 'string'))
   }
 }
diff --git a/api/src/app/models/Place.ts b/api/src/app/models/Place.ts
index 64ddfc8..399d7a9 100644
--- a/api/src/app/models/Place.ts
+++ b/api/src/app/models/Place.ts
@@ -3,6 +3,7 @@ import { Decorators } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import Host from './Host.js'
 import HostPlace from './HostPlace.js'
+import Room from './Room.js'

 const deco = new Decorators<typeof Place>()

@@ -31,4 +32,9 @@ export default class Place extends ApplicationModel {

   @deco.HasMany('Host', { through: 'hostPlaces' })
   public hosts: Host[]
+
+  @deco.HasMany('Room')
+  // make sure this imports from `import Room from '@models/Room.js'`
+  // not from `import { Room } from 'socket.io-adapter'`
+  public rooms: Room[]
 }
diff --git a/api/src/app/models/Room.ts b/api/src/app/models/Room.ts
index 4ea9146..7b34e52 100644
--- a/api/src/app/models/Room.ts
+++ b/api/src/app/models/Room.ts
@@ -1,7 +1,7 @@
-import { Decorators } from '@rvoh/dream'
-import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
 import ApplicationModel from '@models/ApplicationModel.js'
 import Place from '@models/Place.js'
+import { Decorators } from '@rvoh/dream'
+import { DreamColumn } from '@rvoh/dream/types'

 const deco = new Decorators<typeof Room>()

@@ -10,13 +10,6 @@ export default class Room extends ApplicationModel {
     return 'rooms' as const
   }

-  public get serializers(): DreamSerializers<Room> {
-    return {
-      default: 'RoomSerializer',
-      summary: 'RoomSummarySerializer',
-    }
-  }
-
   public id: DreamColumn<Room, 'id'>
   public type: DreamColumn<Room, 'type'>
   public position: DreamColumn<Room, 'position'>
diff --git a/api/src/app/models/Room/Bathroom.ts b/api/src/app/models/Room/Bathroom.ts
index ede559a..9d57fc5 100644
--- a/api/src/app/models/Room/Bathroom.ts
+++ b/api/src/app/models/Room/Bathroom.ts
@@ -6,7 +6,7 @@ const deco = new Decorators<typeof Bathroom>()

 @STI(Room)
 export default class Bathroom extends Room {
-  public override get serializers(): DreamSerializers<Bathroom> {
+  public get serializers(): DreamSerializers<Bathroom> {
     return {
       default: 'Room/BathroomSerializer',
       summary: 'Room/BathroomSummarySerializer',
diff --git a/api/src/app/models/Room/Bedroom.ts b/api/src/app/models/Room/Bedroom.ts
index 451c883..203a911 100644
--- a/api/src/app/models/Room/Bedroom.ts
+++ b/api/src/app/models/Room/Bedroom.ts
@@ -6,7 +6,7 @@ const deco = new Decorators<typeof Bedroom>()

 @STI(Room)
 export default class Bedroom extends Room {
-  public override get serializers(): DreamSerializers<Bedroom> {
+  public get serializers(): DreamSerializers<Bedroom> {
     return {
       default: 'Room/BedroomSerializer',
       summary: 'Room/BedroomSummarySerializer',
diff --git a/api/src/app/models/Room/Den.ts b/api/src/app/models/Room/Den.ts
index 8b65ee8..f80981a 100644
--- a/api/src/app/models/Room/Den.ts
+++ b/api/src/app/models/Room/Den.ts
@@ -6,7 +6,7 @@ const deco = new Decorators<typeof Den>()

 @STI(Room)
 export default class Den extends Room {
-  public override get serializers(): DreamSerializers<Den> {
+  public get serializers(): DreamSerializers<Den> {
     return {
       default: 'Room/DenSerializer',
       summary: 'Room/DenSummarySerializer',
diff --git a/api/src/app/models/Room/Kitchen.ts b/api/src/app/models/Room/Kitchen.ts
index 0a7b3f1..bcf3068 100644
--- a/api/src/app/models/Room/Kitchen.ts
+++ b/api/src/app/models/Room/Kitchen.ts
@@ -6,7 +6,7 @@ const deco = new Decorators<typeof Kitchen>()

 @STI(Room)
 export default class Kitchen extends Room {
-  public override get serializers(): DreamSerializers<Kitchen> {
+  public get serializers(): DreamSerializers<Kitchen> {
     return {
       default: 'Room/KitchenSerializer',
       summary: 'Room/KitchenSummarySerializer',
diff --git a/api/src/app/models/Room/LivingRoom.ts b/api/src/app/models/Room/LivingRoom.ts
index f6aaa38..64c5cd7 100644
--- a/api/src/app/models/Room/LivingRoom.ts
+++ b/api/src/app/models/Room/LivingRoom.ts
@@ -6,7 +6,7 @@ const deco = new Decorators<typeof LivingRoom>()

 @STI(Room)
 export default class LivingRoom extends Room {
-  public override get serializers(): DreamSerializers<LivingRoom> {
+  public get serializers(): DreamSerializers<LivingRoom> {
     return {
       default: 'Room/LivingRoomSerializer',
       summary: 'Room/LivingRoomSummarySerializer',
diff --git a/api/src/app/serializers/RoomSerializer.ts b/api/src/app/serializers/RoomSerializer.ts
index 79390f9..e1aa6a5 100644
--- a/api/src/app/serializers/RoomSerializer.ts
+++ b/api/src/app/serializers/RoomSerializer.ts
@@ -1,12 +1,13 @@
-import { DreamSerializer } from '@rvoh/dream'
 import Room from '@models/Room.js'
+import { DreamSerializer } from '@rvoh/dream'

 export const RoomSummarySerializer = <T extends Room>(StiChildClass: typeof Room, room: T) =>
   DreamSerializer(StiChildClass ?? Room, room)
+    .attribute('type', { openapi: { type: 'string', enum: [(StiChildClass ?? Room).sanitizedName] } })
     .attribute('id')
+    .attribute('position')

+// prettier-ignore
 export const RoomSerializer = <T extends Room>(StiChildClass: typeof Room, room: T) =>
   RoomSummarySerializer(StiChildClass, room)
-    .attribute('type', { openapi: { type: 'string', enum: [(StiChildClass ?? Room).sanitizedName] } })
-    .attribute('position')
     .attribute('deletedAt')
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index ece4189..8da1ee6 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -446,6 +446,16 @@
                       "integer",
                       "null"
                     ]
+                  },
+                  "type": {
+                    "type": "string",
+                    "enum": [
+                      "Bathroom",
+                      "Bedroom",
+                      "Den",
+                      "Kitchen",
+                      "LivingRoom"
+                    ]
                   }
                 }
               }
@@ -847,11 +857,23 @@
       "RoomBathroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "description": "The following values will be allowed:\n  Bathroom"
           }
         }
       },
@@ -897,11 +919,23 @@
       "RoomBedroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "description": "The following values will be allowed:\n  Bedroom"
           }
         }
       },
@@ -939,11 +973,23 @@
       "RoomDenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "description": "The following values will be allowed:\n  Den"
           }
         }
       },
@@ -989,11 +1035,23 @@
       "RoomKitchenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "description": "The following values will be allowed:\n  Kitchen"
           }
         }
       },
@@ -1031,11 +1089,23 @@
       "RoomLivingRoomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "description": "The following values will be allowed:\n  LivingRoom"
           }
         }
       },
diff --git a/api/src/openapi/openapi.json b/api/src/openapi/openapi.json
index b12e018..4c2b563 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -446,6 +446,16 @@
                       "integer",
                       "null"
                     ]
+                  },
+                  "type": {
+                    "type": "string",
+                    "enum": [
+                      "Bathroom",
+                      "Bedroom",
+                      "Den",
+                      "Kitchen",
+                      "LivingRoom"
+                    ]
                   }
                 }
               }
@@ -863,11 +873,25 @@
       "RoomBathroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Bathroom"
+            ]
           }
         }
       },
@@ -922,11 +946,25 @@
       "RoomBedroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Bedroom"
+            ]
           }
         }
       },
@@ -966,11 +1004,25 @@
       "RoomDenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Den"
+            ]
           }
         }
       },
@@ -1023,11 +1075,25 @@
       "RoomKitchenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Kitchen"
+            ]
           }
         }
       },
@@ -1067,11 +1133,25 @@
       "RoomLivingRoomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "LivingRoom"
+            ]
           }
         }
       },
diff --git a/api/src/openapi/spec.openapi.json b/api/src/openapi/spec.openapi.json
index b12e018..4c2b563 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -446,6 +446,16 @@
                       "integer",
                       "null"
                     ]
+                  },
+                  "type": {
+                    "type": "string",
+                    "enum": [
+                      "Bathroom",
+                      "Bedroom",
+                      "Den",
+                      "Kitchen",
+                      "LivingRoom"
+                    ]
                   }
                 }
               }
@@ -863,11 +873,25 @@
       "RoomBathroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Bathroom"
+            ]
           }
         }
       },
@@ -922,11 +946,25 @@
       "RoomBedroomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Bedroom"
+            ]
           }
         }
       },
@@ -966,11 +1004,25 @@
       "RoomDenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Den"
+            ]
           }
         }
       },
@@ -1023,11 +1075,25 @@
       "RoomKitchenSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "Kitchen"
+            ]
           }
         }
       },
@@ -1067,11 +1133,25 @@
       "RoomLivingRoomSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "position",
+          "type"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "position": {
+            "type": [
+              "integer",
+              "null"
+            ]
+          },
+          "type": {
+            "type": "string",
+            "enum": [
+              "LivingRoom"
+            ]
           }
         }
       },
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index d6d38a0..b4fc9d7 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -383,6 +383,15 @@ export const schema = {
         requiredAndClauses: null,
         passthroughAndClauses: null,
       },
+      rooms: {
+        type: 'HasMany',
+        foreignKey: 'placeId',
+        foreignKeyTypeColumn: null,
+        tables: ['rooms'],
+        optional: null,
+        requiredAndClauses: null,
+        passthroughAndClauses: null,
+      },
     },
   },
   rooms: {
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index fc626a3..4f0c02f 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -260,6 +260,8 @@ export interface paths {
                         bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
                         bedTypes?: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
                         position?: number | null;
+                        /** @enum {string} */
+                        type?: "Bathroom" | "Bedroom" | "Den" | "Kitchen" | "LivingRoom";
                     };
                 };
             };
@@ -435,6 +437,9 @@ export interface components {
         };
         RoomBathroomSummary: {
             id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Bathroom";
         };
         RoomBedroom: {
             bedTypes: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
@@ -447,6 +452,9 @@ export interface components {
         };
         RoomBedroomSummary: {
             id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Bedroom";
         };
         RoomDen: {
             /** Format: date-time */
@@ -458,6 +466,9 @@ export interface components {
         };
         RoomDenSummary: {
             id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Den";
         };
         RoomKitchen: {
             appliances: ("dishwasher" | "microwave" | "oven" | "stove")[];
@@ -470,6 +481,9 @@ export interface components {
         };
         RoomKitchenSummary: {
             id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Kitchen";
         };
         RoomLivingRoom: {
             /** Format: date-time */
@@ -481,6 +495,9 @@ export interface components {
         };
         RoomLivingRoomSummary: {
             id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "LivingRoom";
         };
         ValidationErrors: {
             /** @enum {string} */
````
