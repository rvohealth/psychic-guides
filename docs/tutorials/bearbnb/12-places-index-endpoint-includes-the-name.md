---
title: Places index endpoint includes the name
---

# Places index endpoint includes the name

## Commit Message

```
Places index endpoint includes the name

```cosole
yarn psy sync
yarn uspec spec/unit/controllers/V1/Host/PlacesController.spec.ts
```
```

## Changes

```diff
diff --git a/api/spec/unit/controllers/V1/Host/PlacesController.spec.ts b/api/spec/unit/controllers/V1/Host/PlacesController.spec.ts
index 25e59a6..b4ccace 100644
--- a/api/spec/unit/controllers/V1/Host/PlacesController.spec.ts
+++ b/api/spec/unit/controllers/V1/Host/PlacesController.spec.ts
@@ -32,6 +32,7 @@ describe('V1/Host/PlacesController', () => {
       expect(body.results).toEqual([
         expect.objectContaining({
           id: place.id,
+          name: place.name,
         }),
       ])
     })
diff --git a/api/src/app/serializers/PlaceSerializer.ts b/api/src/app/serializers/PlaceSerializer.ts
index 83fab47..ba698d3 100644
--- a/api/src/app/serializers/PlaceSerializer.ts
+++ b/api/src/app/serializers/PlaceSerializer.ts
@@ -1,13 +1,15 @@
-import { DreamSerializer } from '@rvoh/dream'
 import Place from '@models/Place.js'
+import { DreamSerializer } from '@rvoh/dream'
 
+// prettier-ignore
 export const PlaceSummarySerializer = (place: Place) =>
   DreamSerializer(Place, place)
     .attribute('id')
+    .attribute('name')
 
+// prettier-ignore
 export const PlaceSerializer = (place: Place) =>
   PlaceSummarySerializer(place)
-    .attribute('name')
     .attribute('style')
     .attribute('sleeps')
     .attribute('deletedAt')
diff --git a/api/src/openapi/mobile.openapi.json b/api/src/openapi/mobile.openapi.json
index 9e6b01e..1e15a02 100644
--- a/api/src/openapi/mobile.openapi.json
+++ b/api/src/openapi/mobile.openapi.json
@@ -387,11 +387,15 @@
       "PlaceSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "name"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "name": {
+            "type": "string"
           }
         }
       },
diff --git a/api/src/openapi/openapi.json b/api/src/openapi/openapi.json
index 876629e..a0344c9 100644
--- a/api/src/openapi/openapi.json
+++ b/api/src/openapi/openapi.json
@@ -395,11 +395,15 @@
       "PlaceSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "name"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "name": {
+            "type": "string"
           }
         }
       },
diff --git a/api/src/openapi/spec.openapi.json b/api/src/openapi/spec.openapi.json
index 876629e..a0344c9 100644
--- a/api/src/openapi/spec.openapi.json
+++ b/api/src/openapi/spec.openapi.json
@@ -395,11 +395,15 @@
       "PlaceSummary": {
         "type": "object",
         "required": [
-          "id"
+          "id",
+          "name"
         ],
         "properties": {
           "id": {
             "type": "string"
+          },
+          "name": {
+            "type": "string"
           }
         }
       },
diff --git a/api/src/types/openapi/spec.openapi.d.ts b/api/src/types/openapi/spec.openapi.d.ts
index 9d9b2a8..4c6f75e 100644
--- a/api/src/types/openapi/spec.openapi.d.ts
+++ b/api/src/types/openapi/spec.openapi.d.ts
@@ -218,6 +218,7 @@ export interface components {
         };
         PlaceSummary: {
             id: string;
+            name: string;
         };
         ValidationErrors: {
             /** @enum {string} */
```
