---
title: Rename generated RoomKitchen to Kitchen.
---

# Rename generated RoomKitchen to Kitchen.

## Commit Message

````
Rename generated RoomKitchen to Kitchen.

No check constraint to update in the migration because, for
array types, the generator always sets a default for array
types (`{}` is the Postgres representation of an empty array),
so even non-Kitchen Rooms will have non-null, empty-array `appliances`

```console
pnpm psy db:migrate
````

````

## Changes

```diff
diff --git a/api/spec/factories/Room/KitchenFactory.ts b/api/spec/factories/Room/KitchenFactory.ts
index 8aa2e13..2e89aa9 100644
--- a/api/spec/factories/Room/KitchenFactory.ts
+++ b/api/spec/factories/Room/KitchenFactory.ts
@@ -1,8 +1,8 @@
+import Kitchen from '@models/Room/Kitchen.js'
 import { UpdateableProperties } from '@rvoh/dream/types'
-import RoomKitchen from '@models/Room/Kitchen.js'

-export default async function createRoomKitchen(attrs: UpdateableProperties<RoomKitchen> = {}) {
-  return await RoomKitchen.create({
+export default async function createRoomKitchen(attrs: UpdateableProperties<Kitchen> = {}) {
+  return await Kitchen.create({
     appliances: ['stove'],
     ...attrs,
   })
diff --git a/api/src/app/models/Room/Kitchen.ts b/api/src/app/models/Room/Kitchen.ts
index c213b1d..0a7b3f1 100644
--- a/api/src/app/models/Room/Kitchen.ts
+++ b/api/src/app/models/Room/Kitchen.ts
@@ -1,17 +1,17 @@
+import Room from '@models/Room.js'
 import { Decorators, STI } from '@rvoh/dream'
 import { DreamColumn, DreamSerializers } from '@rvoh/dream/types'
-import Room from '@models/Room.js'

-const deco = new Decorators<typeof RoomKitchen>()
+const deco = new Decorators<typeof Kitchen>()

 @STI(Room)
-export default class RoomKitchen extends Room {
-  public override get serializers(): DreamSerializers<RoomKitchen> {
+export default class Kitchen extends Room {
+  public override get serializers(): DreamSerializers<Kitchen> {
     return {
       default: 'Room/KitchenSerializer',
       summary: 'Room/KitchenSummarySerializer',
     }
   }

-  public appliances: DreamColumn<RoomKitchen, 'appliances'>
+  public appliances: DreamColumn<Kitchen, 'appliances'>
 }
diff --git a/api/src/app/serializers/Room/KitchenSerializer.ts b/api/src/app/serializers/Room/KitchenSerializer.ts
index f5a38d7..618c25a 100644
--- a/api/src/app/serializers/Room/KitchenSerializer.ts
+++ b/api/src/app/serializers/Room/KitchenSerializer.ts
@@ -1,9 +1,8 @@
+import Kitchen from '@models/Room/Kitchen.js'
 import { RoomSerializer, RoomSummarySerializer } from '@serializers/RoomSerializer.js'
-import RoomKitchen from '@models/Room/Kitchen.js'

-export const RoomKitchenSummarySerializer = (roomKitchen: RoomKitchen) =>
-  RoomSummarySerializer(RoomKitchen, roomKitchen)
+export const RoomKitchenSummarySerializer = (roomKitchen: Kitchen) =>
+  RoomSummarySerializer(Kitchen, roomKitchen)

-export const RoomKitchenSerializer = (roomKitchen: RoomKitchen) =>
-  RoomSerializer(RoomKitchen, roomKitchen)
-    .attribute('appliances')
+export const RoomKitchenSerializer = (roomKitchen: Kitchen) =>
+  RoomSerializer(Kitchen, roomKitchen).attribute('appliances')
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index 856dcf2..c767b4c 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -349,6 +349,9 @@
                           },
                           {
                             "$ref": "#/components/schemas/RoomBedroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomKitchenSummary"
                           }
                         ]
                       }
@@ -393,6 +396,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -442,6 +457,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -508,6 +526,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -549,6 +570,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -854,6 +887,56 @@
           }
         }
       },
+      "RoomKitchen": {
+        "type": "object",
+        "required": [
+          "appliances",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "appliances": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "description": "The following values will be allowed:\n  dishwasher,\n  microwave,\n  oven,\n  stove"
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
+            "description": "The following values will be allowed:\n  Kitchen"
+          }
+        }
+      },
+      "RoomKitchenSummary": {
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
index 21db2c7..b6c53c8 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -349,6 +349,9 @@
                           },
                           {
                             "$ref": "#/components/schemas/RoomBedroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomKitchenSummary"
                           }
                         ]
                       }
@@ -393,6 +396,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -442,6 +457,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -508,6 +526,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -549,6 +570,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -879,6 +912,63 @@
           }
         }
       },
+      "RoomKitchen": {
+        "type": "object",
+        "required": [
+          "appliances",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "appliances": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "enum": [
+                "dishwasher",
+                "microwave",
+                "oven",
+                "stove"
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
+              "Kitchen"
+            ]
+          }
+        }
+      },
+      "RoomKitchenSummary": {
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
index 21db2c7..b6c53c8 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -349,6 +349,9 @@
                           },
                           {
                             "$ref": "#/components/schemas/RoomBedroomSummary"
+                          },
+                          {
+                            "$ref": "#/components/schemas/RoomKitchenSummary"
                           }
                         ]
                       }
@@ -393,6 +396,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -442,6 +457,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -508,6 +526,9 @@
                     },
                     {
                       "$ref": "#/components/schemas/RoomBedroom"
+                    },
+                    {
+                      "$ref": "#/components/schemas/RoomKitchen"
                     }
                   ]
                 }
@@ -549,6 +570,18 @@
               "schema": {
                 "type": "object",
                 "properties": {
+                  "appliances": {
+                    "type": "array",
+                    "items": {
+                      "type": "string",
+                      "enum": [
+                        "dishwasher",
+                        "microwave",
+                        "oven",
+                        "stove"
+                      ]
+                    }
+                  },
                   "bathOrShowerStyle": {
                     "type": [
                       "string",
@@ -879,6 +912,63 @@
           }
         }
       },
+      "RoomKitchen": {
+        "type": "object",
+        "required": [
+          "appliances",
+          "deletedAt",
+          "id",
+          "position",
+          "type"
+        ],
+        "properties": {
+          "appliances": {
+            "type": "array",
+            "items": {
+              "type": "string",
+              "enum": [
+                "dishwasher",
+                "microwave",
+                "oven",
+                "stove"
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
+              "Kitchen"
+            ]
+          }
+        }
+      },
+      "RoomKitchenSummary": {
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
index 3fd51e7..4ec7262 100644
--- a/api/src/types/db.ts
+++ b/api/src/types/db.ts
@@ -64,6 +64,15 @@ import { type CalendarDate, type DateTime } from '@rvoh/dream'

 import type { ColumnType } from "kysely";

+export type ApplianceTypesEnum = "dishwasher" | "microwave" | "oven" | "stove";
+export const ApplianceTypesEnumValues = [
+  "dishwasher",
+  "microwave",
+  "oven",
+  "stove"
+] as const
+
+
 export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
   ? U[]
   : ArrayTypeImpl<T>;
@@ -153,6 +162,7 @@ export interface Places {
 }

 export interface Rooms {
+  appliances: Generated<ArrayType<ApplianceTypesEnum>>;
   bathOrShowerStyle: BathOrShowerStylesEnum | null;
   bedTypes: Generated<ArrayType<BedTypesEnum>>;
   createdAt: Timestamp;
diff --git a/api/src/types/dream.globals.ts b/api/src/types/dream.globals.ts
index bc30c46..9432dcc 100644
--- a/api/src/types/dream.globals.ts
+++ b/api/src/types/dream.globals.ts
@@ -10,6 +10,8 @@ export const globalTypeConfig = {
       'Room/BathroomSummarySerializer',
       'Room/BedroomSerializer',
       'Room/BedroomSummarySerializer',
+      'Room/KitchenSerializer',
+      'Room/KitchenSummarySerializer',
       'RoomSerializer',
       'RoomSummarySerializer'
     ],
diff --git a/api/src/types/dream.ts b/api/src/types/dream.ts
index 9cde824..7f41eb1 100644
--- a/api/src/types/dream.ts
+++ b/api/src/types/dream.ts
@@ -59,6 +59,8 @@ us humans, he says:

 import { type CalendarDate, type DateTime } from '@rvoh/dream'
 import {
+  ApplianceTypesEnum,
+  ApplianceTypesEnumValues,
   BathOrShowerStylesEnum,
   BathOrShowerStylesEnumValues,
   BedTypesEnum,
@@ -389,8 +391,17 @@ export const schema = {
       default: ['dream:STI'],
       named: [],
     },
-    nonJsonColumnNames: ['bathOrShowerStyle', 'bedTypes', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
+    nonJsonColumnNames: ['appliances', 'bathOrShowerStyle', 'bedTypes', 'createdAt', 'deletedAt', 'id', 'placeId', 'position', 'type', 'updatedAt'],
     columns: {
+      appliances: {
+        coercedType: {} as ApplianceTypesEnum[],
+        enumType: {} as ApplianceTypesEnum,
+        enumArrayType: [] as ApplianceTypesEnum[],
+        enumValues: ApplianceTypesEnumValues,
+        dbType: 'appliance_types_enum[]',
+        allowNull: false,
+        isArray: true,
+      },
       bathOrShowerStyle: {
         coercedType: {} as BathOrShowerStylesEnum | null,
         enumType: {} as BathOrShowerStylesEnum,
@@ -566,6 +577,7 @@ export const connectionTypeConfig = {
       'Place': 'places',
       'Room/Bathroom': 'rooms',
       'Room/Bedroom': 'rooms',
+      'Room/Kitchen': 'rooms',
       'Room': 'rooms',
       'User': 'users'
     },
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index 7a1fc89..f346e96 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -225,7 +225,7 @@ export interface paths {
                     content: {
                         "application/json": {
                             cursor: string | null;
-                            results: (components["schemas"]["RoomBathroomSummary"] | components["schemas"]["RoomBedroomSummary"])[];
+                            results: (components["schemas"]["RoomBathroomSummary"] | components["schemas"]["RoomBedroomSummary"] | components["schemas"]["RoomKitchenSummary"])[];
                         };
                     };
                 };
@@ -255,6 +255,7 @@ export interface paths {
             requestBody?: {
                 content: {
                     "application/json": {
+                        appliances?: ("dishwasher" | "microwave" | "oven" | "stove")[];
                         /** @enum {string|null} */
                         bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
                         bedTypes?: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
@@ -269,7 +270,7 @@ export interface paths {
                         [name: string]: unknown;
                     };
                     content: {
-                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"];
+                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"] | components["schemas"]["RoomKitchen"];
                     };
                 };
                 400: components["responses"]["BadRequest"];
@@ -316,7 +317,7 @@ export interface paths {
                         [name: string]: unknown;
                     };
                     content: {
-                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"];
+                        "application/json": components["schemas"]["RoomBathroom"] | components["schemas"]["RoomBedroom"] | components["schemas"]["RoomKitchen"];
                     };
                 };
                 400: components["responses"]["BadRequest"];
@@ -370,6 +371,7 @@ export interface paths {
             requestBody?: {
                 content: {
                     "application/json": {
+                        appliances?: ("dishwasher" | "microwave" | "oven" | "stove")[];
                         /** @enum {string|null} */
                         bathOrShowerStyle?: "bath" | "bath_and_shower" | "none" | "shower" | null;
                         bedTypes?: ("bunk" | "cot" | "king" | "queen" | "sofabed" | "twin")[];
@@ -446,6 +448,18 @@ export interface components {
         RoomBedroomSummary: {
             id: string;
         };
+        RoomKitchen: {
+            appliances: ("dishwasher" | "microwave" | "oven" | "stove")[];
+            /** Format: date-time */
+            deletedAt: string | null;
+            id: string;
+            position: number | null;
+            /** @enum {string} */
+            type: "Kitchen";
+        };
+        RoomKitchenSummary: {
+            id: string;
+        };
         ValidationErrors: {
             /** @enum {string} */
             type: "validation";
````
