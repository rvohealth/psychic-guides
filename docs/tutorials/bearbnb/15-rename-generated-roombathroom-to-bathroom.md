---
title: Rename generated RoomBathroom to Bathroom,
---

# Rename generated RoomBathroom to Bathroom,

## Commit Message

````
Rename generated RoomBathroom to Bathroom,
including in the check constraint in the migration

```console
pnpm psy db:migrate
````

````

## Changes

```diff
diff --git a/api/spec/factories/Room/BathroomFactory.ts b/api/spec/factories/Room/BathroomFactory.ts
index a7bf14e..7ffc1b1 100644
--- a/api/spec/factories/Room/BathroomFactory.ts
+++ b/api/spec/factories/Room/BathroomFactory.ts
@@ -1,8 +1,8 @@
+import Bathroom from '@models/Room/Bathroom.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
-import RoomBathroom from '@models/Room/Bathroom.js'

-export default async function createRoomBathroom(attrs: UpdateableProperties<RoomBathroom> = {}) {
-  return await RoomBathroom.create({
+export default async function createRoomBathroom(attrs: UpdateableProperties<Bathroom> = {}) {
+  return await Bathroom.create({
     bathOrShowerStyle: 'bath',
     ...attrs,
   })
diff --git a/api/src/app/models/Room/Bathroom.ts b/api/src/app/models/Room/Bathroom.ts
index be5bd2d..ede559a 100644
--- a/api/src/app/models/Room/Bathroom.ts
+++ b/api/src/app/models/Room/Bathroom.ts
@@ -1,17 +1,17 @@
+import Room from '@models/Room.js'
 import { Decorators, STI } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
-import Room from '@models/Room.js'

-const deco = new Decorators<typeof RoomBathroom>()
+const deco = new Decorators<typeof Bathroom>()

 @STI(Room)
-export default class RoomBathroom extends Room {
-  public override get serializers(): DreamSerializers<RoomBathroom> {
+export default class Bathroom extends Room {
+  public override get serializers(): DreamSerializers<Bathroom> {
     return {
       default: 'Room/BathroomSerializer',
       summary: 'Room/BathroomSummarySerializer',
     }
   }

-  public bathOrShowerStyle: DreamColumn<RoomBathroom, 'bathOrShowerStyle'>
+  public bathOrShowerStyle: DreamColumn<Bathroom, 'bathOrShowerStyle'>
 }
diff --git a/api/src/app/serializers/Room/BathroomSerializer.ts b/api/src/app/serializers/Room/BathroomSerializer.ts
index 1e713c1..0f6953e 100644
--- a/api/src/app/serializers/Room/BathroomSerializer.ts
+++ b/api/src/app/serializers/Room/BathroomSerializer.ts
@@ -1,9 +1,8 @@
+import Bathroom from '@models/Room/Bathroom.js'
 import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
-import RoomBathroom from '@models/Room/Bathroom.js'

-export const RoomBathroomSummarySerializer = (roomBathroom: RoomBathroom) =>
-  RoomSummarySerializer(RoomBathroom, roomBathroom)
+export const RoomBathroomSummarySerializer = (roomBathroom: Bathroom) =>
+  RoomSummarySerializer(Bathroom, roomBathroom)

-export const RoomBathroomSerializer = (roomBathroom: RoomBathroom) =>
-  RoomSerializer(RoomBathroom, roomBathroom)
-    .attribute('bathOrShowerStyle')
+export const RoomBathroomSerializer = (roomBathroom: Bathroom) =>
+  RoomSerializer(Bathroom, roomBathroom).attribute('bathOrShowerStyle')
diff --git a/api/src/db/migrations/1764184213461-create-room-bathroom.ts b/api/src/db/migrations/1764184213461-create-room-bathroom.ts
index 8896e86..94158e4 100644
--- a/api/src/db/migrations/1764184213461-create-room-bathroom.ts
+++ b/api/src/db/migrations/1764184213461-create-room-bathroom.ts
@@ -4,12 +4,7 @@ import { Kysely, sql } from 'kysely'
 export async function up(db: Kysely<any>): Promise<void> {
   await db.schema
     .createType('bath_or_shower_styles_enum')
-    .asEnum([
-      'bath',
-      'shower',
-      'bath_and_shower',
-      'none'
-    ])
+    .asEnum(['bath', 'shower', 'bath_and_shower', 'none'])
     .execute()

   await db.schema
@@ -21,17 +16,14 @@ export async function up(db: Kysely<any>): Promise<void> {
     .alterTable('rooms')
     .addCheckConstraint(
       'rooms_not_null_bath_or_shower_style',
-      sql`type != 'RoomBathroom' OR bath_or_shower_style IS NOT NULL`,
+      sql`type != 'Bathroom' OR bath_or_shower_style IS NOT NULL`,
     )
     .execute()
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 export async function down(db: Kysely<any>): Promise<void> {
-  await db.schema
-    .alterTable('rooms')
-    .dropColumn('bath_or_shower_style')
-    .execute()
+  await db.schema.alterTable('rooms').dropColumn('bath_or_shower_style').execute()

   await db.schema.dropType('bath_or_shower_styles_enum').execute()
-}
\ No newline at end of file
+}
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index 1e15a02..6e87275 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -293,6 +293,312 @@
           }
         }
       }
+    },
+    "/v1/host/places/{placeId}/rooms": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "query",
+          "required": false,
+          "name": "cursor",
+          "description": "Scroll pagination cursor",
+          "allowReserved": true,
+          "schema": {
+            "type": [
+              "string",
+              "null"
+            ]
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Paginated index of Rooms",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "cursor",
+                    "results"
+                  ],
+                  "properties": {
+                    "cursor": {
+                      "type": [
+                        "string",
+                        "null"
+                      ]
+                    },
+                    "results": {
+                      "type": "array",
+                      "items": {
+                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                      }
+                    }
+                  }
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "post": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Create a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Created"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
+    "/v1/host/places/{placeId}/rooms/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Fetch a Room",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "patch": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Update a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Destroy a Room",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
     }
   },
   "components": {
@@ -399,6 +705,56 @@
           }
         }
       },
+      "RoomBathroom": {
+        "type": "object",
+        "required": [
+          "bathOrShowerStyle",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bathOrShowerStyle": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "description": "The following values will be allowed:\n  bath,\n  bath_and_shower,\n  none,\n  shower"
+          },
+          "deletedAt": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "format": "date-time"
+          },
+          "id": {
+            "type": "string"
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
+          }
+        }
+      },
+      "RoomBathroomSummary": {
+        "type": "object",
+        "required": [
+          "id"
+        ],
+        "properties": {
+          "id": {
+            "type": "string"
+          }
+        }
+      },
       "ValidationErrors": {
         "type": "object",
         "required": [
diff --git a/api/src/openapi/openapi.json b/api/src/openapi/openapi.json
index a0344c9..efd1fb2 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -293,6 +293,312 @@
           }
         }
       }
+    },
+    "/v1/host/places/{placeId}/rooms": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "query",
+          "required": false,
+          "name": "cursor",
+          "description": "Scroll pagination cursor",
+          "allowReserved": true,
+          "schema": {
+            "type": [
+              "string",
+              "null"
+            ]
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Paginated index of Rooms",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "cursor",
+                    "results"
+                  ],
+                  "properties": {
+                    "cursor": {
+                      "type": [
+                        "string",
+                        "null"
+                      ]
+                    },
+                    "results": {
+                      "type": "array",
+                      "items": {
+                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                      }
+                    }
+                  }
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "post": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Create a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Created"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
+    "/v1/host/places/{placeId}/rooms/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Fetch a Room",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "patch": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Update a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Destroy a Room",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
     }
   },
   "components": {
@@ -407,6 +713,64 @@
           }
         }
       },
+      "RoomBathroom": {
+        "type": "object",
+        "required": [
+          "bathOrShowerStyle",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bathOrShowerStyle": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "enum": [
+              "bath",
+              "bath_and_shower",
+              "none",
+              "shower",
+              null
+            ]
+          },
+          "deletedAt": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "format": "date-time"
+          },
+          "id": {
+            "type": "string"
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
+          }
+        }
+      },
+      "RoomBathroomSummary": {
+        "type": "object",
+        "required": [
+          "id"
+        ],
+        "properties": {
+          "id": {
+            "type": "string"
+          }
+        }
+      },
       "ValidationErrors": {
         "type": "object",
         "required": [
diff --git a/api/src/openapi/spec.openapi.json b/api/src/openapi/spec.openapi.json
index a0344c9..efd1fb2 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -293,6 +293,312 @@
           }
         }
       }
+    },
+    "/v1/host/places/{placeId}/rooms": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "query",
+          "required": false,
+          "name": "cursor",
+          "description": "Scroll pagination cursor",
+          "allowReserved": true,
+          "schema": {
+            "type": [
+              "string",
+              "null"
+            ]
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Paginated index of Rooms",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "cursor",
+                    "results"
+                  ],
+                  "properties": {
+                    "cursor": {
+                      "type": [
+                        "string",
+                        "null"
+                      ]
+                    },
+                    "results": {
+                      "type": "array",
+                      "items": {
+                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                      }
+                    }
+                  }
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "post": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Create a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Created"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
+    },
+    "/v1/host/places/{placeId}/rooms/{id}": {
+      "parameters": [
+        {
+          "in": "path",
+          "name": "placeId",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        },
+        {
+          "in": "path",
+          "name": "id",
+          "required": true,
+          "schema": {
+            "type": "string"
+          }
+        }
+      ],
+      "get": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Fetch a Room",
+        "responses": {
+          "200": {
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/RoomBathroom"
+                }
+              }
+            },
+            "description": "Success"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "patch": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Update a Room",
+        "requestBody": {
+          "content": {
+            "application/json": {
+              "schema": {
+                "type": "object",
+                "properties": {
+                  "bathOrShowerStyle": {
+                    "type": [
+                      "string",
+                      "null"
+                    ],
+                    "enum": [
+                      "bath",
+                      "bath_and_shower",
+                      "none",
+                      "shower",
+                      null
+                    ]
+                  },
+                  "position": {
+                    "type": [
+                      "integer",
+                      "null"
+                    ]
+                  }
+                }
+              }
+            }
+          }
+        },
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      },
+      "delete": {
+        "tags": [
+          "rooms"
+        ],
+        "description": "Destroy a Room",
+        "responses": {
+          "204": {
+            "description": "Success, no content",
+            "$ref": "#/components/responses/NoContent"
+          },
+          "400": {
+            "$ref": "#/components/responses/BadRequest"
+          },
+          "401": {
+            "$ref": "#/components/responses/Unauthorized"
+          },
+          "403": {
+            "$ref": "#/components/responses/Forbidden"
+          },
+          "404": {
+            "$ref": "#/components/responses/NotFound"
+          },
+          "409": {
+            "$ref": "#/components/responses/Conflict"
+          },
+          "422": {
+            "$ref": "#/components/responses/ValidationErrors"
+          },
+          "500": {
+            "$ref": "#/components/responses/InternalServerError"
+          }
+        }
+      }
     }
   },
   "components": {
@@ -407,6 +713,64 @@
           }
         }
       },
+      "RoomBathroom": {
+        "type": "object",
+        "required": [
+          "bathOrShowerStyle",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bathOrShowerStyle": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "enum": [
+              "bath",
+              "bath_and_shower",
+              "none",
+              "shower",
+              null
+            ]
+          },
+          "deletedAt": {
+            "type": [
+              "string",
+              "null"
+            ],
+            "format": "date-time"
+          },
+          "id": {
+            "type": "string"
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
+          }
+        }
+      },
+      "RoomBathroomSummary": {
+        "type": "object",
+        "required": [
+          "id"
+        ],
+        "properties": {
+          "id": {
+            "type": "string"
+          }
+        }
+      },
       "ValidationErrors": {
         "type": "object",
         "required": [
diff --git a/api/src/types/db.ts b/api/src/types/db.ts
index 0a88afd..12da87b 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -64,6 +64,15 @@ import { type CalendarDate, type DateTime } from '@rvoh/dream'

 import type { ColumnType } from "kysely";

+export type BathOrShowerStylesEnum = "bath" | "bath_and_shower" | "none" | "shower";
+export const BathOrShowerStylesEnumValues = [
+  "bath",
+  "bath_and_shower",
+  "none",
+  "shower"
+] as const
+
+
 export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
   ? ColumnType<S, I | undefined, U>
   : ColumnType<T, T | undefined, T>;
@@ -79,6 +88,16 @@ export const PlaceStylesEnumValues = [
   "treehouse"
 ] as const

+
+export type RoomTypesEnum = "Bathroom" | "Bedroom" | "Den" | "Kitchen" | "LivingRoom";
+export const RoomTypesEnumValues = [
+  "Bathroom",
+  "Bedroom",
+  "Den",
+  "Kitchen",
+  "LivingRoom"
+] as const
+
 export type Timestamp = ColumnType<DateTime | CalendarDate>

 export interface Guests {
@@ -114,6 +133,17 @@ export interface Places {
   updatedAt: Timestamp;
 }

+export interface Rooms {
+  bathOrShowerStyle: BathOrShowerStylesEnum | null;
+  createdAt: Timestamp;
+  deletedAt: Timestamp | null;
+  id: Generated<string>;
+  placeId: string;
+  position: number | null;
+  type: RoomTypesEnum;
+  updatedAt: Timestamp;
+}
+
 export interface Users {
   createdAt: Timestamp;
   email: string;
@@ -126,6 +156,7 @@ export interface DB {
   host_places: HostPlaces;
   hosts: Hosts;
   places: Places;
+  rooms: Rooms;
   users: Users;
 }

@@ -135,5 +166,6 @@ export class DBClass {
   host_places: HostPlaces
   hosts: Hosts
   places: Places
+  rooms: Rooms
   users: Users
 }
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index ee68512..ca2eb31 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -5,6 +5,10 @@ export const globalTypeConfig = {
       'HostSerializer',
       'HostSummarySerializer',
       'PlaceSerializer',
-      'PlaceSummarySerializer'
+      'PlaceSummarySerializer',
+      'Room/BathroomSerializer',
+      'Room/BathroomSummarySerializer',
+      'RoomSerializer',
+      'RoomSummarySerializer'
     ],
 } as const
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index f25e8ae..ed90981 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -59,8 +59,12 @@ us humans, he says:

 import { type CalendarDate, type DateTime } from '@rvoh/dream'
 import {
+  BathOrShowerStylesEnum,
+  BathOrShowerStylesEnumValues,
   PlaceStylesEnum,
-  PlaceStylesEnumValues
+  PlaceStylesEnumValues,
+  RoomTypesEnum,
+  RoomTypesEnumValues
 } from './db.js'

 export const schema = {
@@ -377,6 +381,100 @@ export const schema = {
       },
     },
   },
+  rooms: {
+    serializerKeys: ['default', 'summary'],
+    scopes: {
+      default: ['dream:STI'],
+      named: [],
+    },
+    nonJsonColumnNames: ['bathOrShowerStyle', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
+    columns: {
+      bathOrShowerStyle: {
+        coercedType: {} as BathOrShowerStylesEnum | null,
+        enumType: {} as BathOrShowerStylesEnum,
+        enumArrayType: [] as BathOrShowerStylesEnum[],
+        enumValues: BathOrShowerStylesEnumValues,
+        dbType: 'bath_or_shower_styles_enum',
+        allowNull: true,
+        isArray: false,
+      },
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
+      position: {
+        coercedType: {} as number | null,
+        enumType: null,
+        enumArrayType: null,
+        enumValues: null,
+        dbType: 'integer',
+        allowNull: true,
+        isArray: false,
+      },
+      type: {
+        coercedType: {} as RoomTypesEnum,
+        enumType: {} as RoomTypesEnum,
+        enumArrayType: [] as RoomTypesEnum[],
+        enumValues: RoomTypesEnumValues,
+        dbType: 'room_types_enum',
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
   users: {
     serializerKeys: [],
     scopes: {
@@ -448,13 +546,15 @@ export const schema = {

 export const connectionTypeConfig = {
   passthroughColumns: [],
-  allDefaultScopeNames: [],
+  allDefaultScopeNames: ['dream:STI'],
   globalNames: {
     models: {
       'Guest': 'guests',
       'Host': 'hosts',
       'HostPlace': 'host_places',
       'Place': 'places',
+      'Room/Bathroom': 'rooms',
+      'Room': 'rooms',
       'User': 'users'
     },
   },
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index 4c6f75e..5b355af 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -190,6 +190,205 @@ export interface paths {
         };
         trace?: never;
     };
+    "/v1/host/places/{placeId}/rooms": {
+        parameters: {
+            query?: {
+                /** @description Scroll pagination cursor */
+                cursor?: string | null;
+            };
+            header?: never;
+            path: {
+                placeId: string;
+            };
+            cookie?: never;
+        };
+        /** @description Paginated index of Rooms */
+        get: {
+            parameters: {
+                query?: {
+                    /** @description Scroll pagination cursor */
+                    cursor?: string | null;
+                };
+                header?: never;
+                path: {
+                    placeId: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: never;
+            responses: {
+                /** @description Success */
+                200: {
+                    headers: {
+                        [name: string]: unknown;
+                    };
+                    content: {
+                        "application/json": {
+                            cursor: string | null;
+                            results: components["schemas"]["RoomBathroomSummary"][];
+                        };
+                    };
+                };
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        put?: never;
+        /** @description Create a Room */
+        post: {
+            parameters: {
+                query?: {
+                    /** @description Scroll pagination cursor */
+                    cursor?: string | null;
+                };
+                header?: never;
+                path: {
+                    placeId: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: {
+                content: {
+                    "application/json": {
+                        /** @enum {string|null} */
+                        bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
+                        position?: number | null;
+                    };
+                };
+            };
+            responses: {
+                /** @description Created */
+                201: {
+                    headers: {
+                        [name: string]: unknown;
+                    };
+                    content: {
+                        "application/json": components["schemas"]["RoomBathroom"];
+                    };
+                };
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        delete?: never;
+        options?: never;
+        head?: never;
+        patch?: never;
+        trace?: never;
+    };
+    "/v1/host/places/{placeId}/rooms/{id}": {
+        parameters: {
+            query?: never;
+            header?: never;
+            path: {
+                placeId: string;
+                id: string;
+            };
+            cookie?: never;
+        };
+        /** @description Fetch a Room */
+        get: {
+            parameters: {
+                query?: never;
+                header?: never;
+                path: {
+                    placeId: string;
+                    id: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: never;
+            responses: {
+                /** @description Success */
+                200: {
+                    headers: {
+                        [name: string]: unknown;
+                    };
+                    content: {
+                        "application/json": components["schemas"]["RoomBathroom"];
+                    };
+                };
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        put?: never;
+        post?: never;
+        /** @description Destroy a Room */
+        delete: {
+            parameters: {
+                query?: never;
+                header?: never;
+                path: {
+                    placeId: string;
+                    id: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: never;
+            responses: {
+                /** @description Success, no content */
+                204: components["responses"]["NoContent"];
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        options?: never;
+        head?: never;
+        /** @description Update a Room */
+        patch: {
+            parameters: {
+                query?: never;
+                header?: never;
+                path: {
+                    placeId: string;
+                    id: string;
+                };
+                cookie?: never;
+            };
+            requestBody?: {
+                content: {
+                    "application/json": {
+                        /** @enum {string|null} */
+                        bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
+                        position?: number | null;
+                    };
+                };
+            };
+            responses: {
+                /** @description Success, no content */
+                204: components["responses"]["NoContent"];
+                400: components["responses"]["BadRequest"];
+                401: components["responses"]["Unauthorized"];
+                403: components["responses"]["Forbidden"];
+                404: components["responses"]["NotFound"];
+                409: components["responses"]["Conflict"];
+                422: components["responses"]["ValidationErrors"];
+                500: components["responses"]["InternalServerError"];
+            };
+        };
+        trace?: never;
+    };
 }
 export type webhooks = Record<string, never>;
 export interface components {
@@ -220,6 +419,19 @@ export interface components {
             id: string;
             name: string;
         };
+        RoomBathroom: {
+            /** @enum {string|null} */
+            bathOrShowerStyle: "bath" | "bath_and_shower" | "none" | "shower" | null;
+            /** Format: date-time */
+            deletedAt: string | null;
+            id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Bathroom";
+        };
+        RoomBathroomSummary: {
+            id: string;
+        };
         ValidationErrors: {
             /** @enum {string} */
             type: "validation";
````
