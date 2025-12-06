---
title: Rename generated RoomBedroom to Bedroom.
---

# Rename generated RoomBedroom to Bedroom.

## Commit Message

````
Rename generated RoomBedroom to Bedroom.

No check constraint to update in the migration because, for
array types, the generator always sets a default for array
types (`{}` is the Postgres representation of an empty array),
so even non-Bedroom Rooms will have non-null, empty-array `bed_types`

```console
pnpm psy db:migrate
````

````

## Changes

```diff
diff --git a/api/spec/factories/Room/BedroomFactory.ts b/api/spec/factories/Room/BedroomFactory.ts
index 0f25e2e..67bb8ec 100644
--- a/api/spec/factories/Room/BedroomFactory.ts
+++ b/api/spec/factories/Room/BedroomFactory.ts
@@ -1,8 +1,8 @@
+import Bedroom from '@models/Room/Bedroom.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
-import RoomBedroom from '@models/Room/Bedroom.js'

-export default async function createRoomBedroom(attrs: UpdateableProperties<RoomBedroom> = {}) {
-  return await RoomBedroom.create({
+export default async function createRoomBedroom(attrs: UpdateableProperties<Bedroom> = {}) {
+  return await Bedroom.create({
     bedTypes: ['twin'],
     ...attrs,
   })
diff --git a/api/src/app/models/Room/Bedroom.ts b/api/src/app/models/Room/Bedroom.ts
index b01cab6..451c883 100644
--- a/api/src/app/models/Room/Bedroom.ts
+++ b/api/src/app/models/Room/Bedroom.ts
@@ -1,17 +1,17 @@
+import Room from '@models/Room.js'
 import { Decorators, STI } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
-import Room from '@models/Room.js'

-const deco = new Decorators<typeof RoomBedroom>()
+const deco = new Decorators<typeof Bedroom>()

 @STI(Room)
-export default class RoomBedroom extends Room {
-  public override get serializers(): DreamSerializers<RoomBedroom> {
+export default class Bedroom extends Room {
+  public override get serializers(): DreamSerializers<Bedroom> {
     return {
       default: 'Room/BedroomSerializer',
       summary: 'Room/BedroomSummarySerializer',
     }
   }

-  public bedTypes: DreamColumn<RoomBedroom, 'bedTypes'>
+  public bedTypes: DreamColumn<Bedroom, 'bedTypes'>
 }
diff --git a/api/src/app/serializers/Room/BedroomSerializer.ts b/api/src/app/serializers/Room/BedroomSerializer.ts
index e705036..09b4589 100644
--- a/api/src/app/serializers/Room/BedroomSerializer.ts
+++ b/api/src/app/serializers/Room/BedroomSerializer.ts
@@ -1,9 +1,8 @@
+import Bedroom from '@models/Room/Bedroom.js'
 import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
-import RoomBedroom from '@models/Room/Bedroom.js'

-export const RoomBedroomSummarySerializer = (roomBedroom: RoomBedroom) =>
-  RoomSummarySerializer(RoomBedroom, roomBedroom)
+export const RoomBedroomSummarySerializer = (roomBedroom: Bedroom) =>
+  RoomSummarySerializer(Bedroom, roomBedroom)

-export const RoomBedroomSerializer = (roomBedroom: RoomBedroom) =>
-  RoomSerializer(RoomBedroom, roomBedroom)
-    .attribute('bedTypes')
+export const RoomBedroomSerializer = (roomBedroom: Bedroom) =>
+  RoomSerializer(Bedroom, roomBedroom).attribute('bedTypes')
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index 6e87275..856dcf2 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -343,7 +343,14 @@
                     "results": {
                       "type": "array",
                       "items": {
-                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                        "anyOf": [
+                          {
+                            "$ref": "#/components/schemas/RoomBathroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomBedroomSummary"
+                          }
+                        ]
                       }
                     }
                   }
@@ -399,6 +406,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -415,7 +436,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -474,7 +502,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -527,6 +562,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -755,6 +804,56 @@
           }
         }
       },
+      "RoomBedroom": {
+        "type": "object",
+        "required": [
+          "bedTypes",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bedTypes": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "description": "The following values will be allowed:\n  bunk,\n  cot,\n  king,\n  queen,\n  sofabed,\n  twin"
+            }
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
+            "description": "The following values will be allowed:\n  Bedroom"
+          }
+        }
+      },
+      "RoomBedroomSummary": {
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
index efd1fb2..21db2c7 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -343,7 +343,14 @@
                     "results": {
                       "type": "array",
                       "items": {
-                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                        "anyOf": [
+                          {
+                            "$ref": "#/components/schemas/RoomBathroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomBedroomSummary"
+                          }
+                        ]
                       }
                     }
                   }
@@ -399,6 +406,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -415,7 +436,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -474,7 +502,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -527,6 +562,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -771,6 +820,65 @@
           }
         }
       },
+      "RoomBedroom": {
+        "type": "object",
+        "required": [
+          "bedTypes",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bedTypes": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "enum": [
+                "bunk",
+                "cot",
+                "king",
+                "queen",
+                "sofabed",
+                "twin"
+              ]
+            }
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
+              "Bedroom"
+            ]
+          }
+        }
+      },
+      "RoomBedroomSummary": {
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
index efd1fb2..21db2c7 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -343,7 +343,14 @@
                     "results": {
                       "type": "array",
                       "items": {
-                        "$ref": "#/components/schemas/RoomBathroomSummary"
+                        "anyOf": [
+                          {
+                            "$ref": "#/components/schemas/RoomBathroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomBedroomSummary"
+                          }
+                        ]
                       }
                     }
                   }
@@ -399,6 +406,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -415,7 +436,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -474,7 +502,14 @@
             "content": {
               "application/json": {
                 "schema": {
-                  "$ref": "#/components/schemas/RoomBathroom"
+                  "anyOf": [
+                    {
+                      "$ref": "#/components/schemas/RoomBathroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomBedroom"
+                    }
+                  ]
                 }
               }
             },
@@ -527,6 +562,20 @@
                       null
                     ]
                   },
+                  "bedTypes": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "bunk",
+                        "cot",
+                        "king",
+                        "queen",
+                        "sofabed",
+                        "twin"
+                      ]
+                    }
+                  },
                   "position": {
                     "type": [
                       "integer",
@@ -771,6 +820,65 @@
           }
         }
       },
+      "RoomBedroom": {
+        "type": "object",
+        "required": [
+          "bedTypes",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "bedTypes": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "enum": [
+                "bunk",
+                "cot",
+                "king",
+                "queen",
+                "sofabed",
+                "twin"
+              ]
+            }
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
+              "Bedroom"
+            ]
+          }
+        }
+      },
+      "RoomBedroomSummary": {
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
index 12da87b..3fd51e7 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -64,6 +64,14 @@ import { type CalendarDate, type DateTime } from '@rvoh/dream'

 import type { ColumnType } from "kysely";

+export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
+  ? U[]
+  : ArrayTypeImpl<T>;
+
+export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
+  ? ColumnType<S[], I[], U[]>
+  : T[];
+
 export type BathOrShowerStylesEnum = "bath" | "bath_and_shower" | "none" | "shower";
 export const BathOrShowerStylesEnumValues = [
   "bath",
@@ -73,6 +81,17 @@ export const BathOrShowerStylesEnumValues = [
 ] as const


+export type BedTypesEnum = "bunk" | "cot" | "king" | "queen" | "sofabed" | "twin";
+export const BedTypesEnumValues = [
+  "bunk",
+  "cot",
+  "king",
+  "queen",
+  "sofabed",
+  "twin"
+] as const
+
+
 export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
   ? ColumnType<S, I | undefined, U>
   : ColumnType<T, T | undefined, T>;
@@ -135,6 +154,7 @@ export interface Places {

 export interface Rooms {
   bathOrShowerStyle: BathOrShowerStylesEnum | null;
+  bedTypes: Generated<ArrayType<BedTypesEnum>>;
   createdAt: Timestamp;
   deletedAt: Timestamp | null;
   id: Generated<string>;
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index ca2eb31..bc30c46 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -8,6 +8,8 @@ export const globalTypeConfig = {
       'PlaceSummarySerializer',
       'Room/BathroomSerializer',
       'Room/BathroomSummarySerializer',
+      'Room/BedroomSerializer',
+      'Room/BedroomSummarySerializer',
       'RoomSerializer',
       'RoomSummarySerializer'
     ],
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index ed90981..9cde824 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -61,6 +61,8 @@ import { type CalendarDate, type DateTime } from '@rvoh/dream'
 import {
   BathOrShowerStylesEnum,
   BathOrShowerStylesEnumValues,
+  BedTypesEnum,
+  BedTypesEnumValues,
   PlaceStylesEnum,
   PlaceStylesEnumValues,
   RoomTypesEnum,
@@ -387,7 +389,7 @@ export const schema = {
       default: ['dream:STI'],
       named: [],
     },
-    nonJsonColumnNames: ['bathOrShowerStyle', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
+    nonJsonColumnNames: ['bathOrShowerStyle', 'bedTypes', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
     columns: {
       bathOrShowerStyle: {
         coercedType: {} as BathOrShowerStylesEnum | null,
@@ -398,6 +400,15 @@ export const schema = {
         allowNull: true,
         isArray: false,
       },
+      bedTypes: {
+        coercedType: {} as BedTypesEnum[],
+        enumType: {} as BedTypesEnum,
+        enumArrayType: [] as BedTypesEnum[],
+        enumValues: BedTypesEnumValues,
+        dbType: 'bed_types_enum[]',
+        allowNull: false,
+        isArray: true,
+      },
       createdAt: {
         coercedType: {} as DateTime,
         enumType: null,
@@ -554,6 +565,7 @@ export const connectionTypeConfig = {
       'HostPlace': 'host_places',
       'Place': 'places',
       'Room/Bathroom': 'rooms',
+      'Room/Bedroom': 'rooms',
       'Room': 'rooms',
       'User': 'users'
     },
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index 5b355af..7a1fc89 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -225,7 +225,7 @@ export interface paths {
                     content: {
                         "application/json": {
                             cursor: string | null;
-                            results: components["schemas"]["RoomBathroomSummary"][];
+                            results: (components["schemas"]["RoomBathroomSummary"] | components["schemas"]["RoomBedroomSummary"])[];
                         };
                     };
                 };
@@ -257,6 +257,7 @@ export interface paths {
                     "application/json": {
                         /** @enum {string|null} */
                         bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
+                        bedTypes?: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
                         position?: number | null;
                     };
                 };
@@ -268,7 +269,7 @@ export interface paths {
                         [name: string]: unknown;
                     };
                     content: {
-                        "application/json": components["schemas"]["RoomBathroom"];
+                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"];
                     };
                 };
                 400: components["responses"]["BadRequest"];
@@ -315,7 +316,7 @@ export interface paths {
                         [name: string]: unknown;
                     };
                     content: {
-                        "application/json": components["schemas"]["RoomBathroom"];
+                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"];
                     };
                 };
                 400: components["responses"]["BadRequest"];
@@ -371,6 +372,7 @@ export interface paths {
                     "application/json": {
                         /** @enum {string|null} */
                         bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
+                        bedTypes?: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
                         position?: number | null;
                     };
                 };
@@ -432,6 +434,18 @@ export interface components {
         RoomBathroomSummary: {
             id: string;
         };
+        RoomBedroom: {
+            bedTypes: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
+            /** Format: date-time */
+            deletedAt: string | null;
+            id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Bedroom";
+        };
+        RoomBedroomSummary: {
+            id: string;
+        };
         ValidationErrors: {
             /** @enum {string} */
             type: "validation";
````
