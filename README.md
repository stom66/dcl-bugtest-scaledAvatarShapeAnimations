### `dcl-bugtest-scaledAvatarShapeAnimations`

# Bug: scaled AvatarShapes play the wrong locomotion clip

Desktop Explorer picks walk, jog, or run from world-space speed. The AvatarShape's scale is left out of that comparison. A 9x body moving at 10 m/s covers about 1.1 m/s relative to its own size, and a 3x body covers about 3.3 m/s. Both are walks, and the client plays run.

https://github.com/user-attachments/assets/33d5ef22-c331-41a5-b7c4-ed7d77bec522

## Repro

Three AvatarShapes share one world speed and ping-pong east-west between x = 10 and x = 54 on a 4x4 scene. **Slower** and **Faster** step that speed by 0.5 m/s between 0 and 16. It starts at 10 m/s.

| Avatar | Scale | Shirt | Depth | Engine at 10 m/s | By size at 10 m/s |
| --- | --- | --- | --- | --- | --- |
| scale times 1 | 1 | blue | z = 20 | run | run |
| scale times 3 | 3 | red | z = 32 | run | walk |
| scale times 9 | 9 | green | z = 44 | run | walk |

You spawn in the middle of the south edge, looking north. The line under the speed reads both columns. Open the folder in the [Creator Hub](https://decentraland.org/download/creator-hub) and press Preview, or run `npm run start`.

## Cause

Checked against `decentraland/unity-explorer` (default branch, fetched 2026-11-23).

- `SDKAvatarShapesMotionSystem.UpdateAnimations` turns the distance still to cover into metres per second, then calls `RemotePlayerUtils.GetBlendValueFromSpeed`.
- `GetBlendValueFromSpeed` (`Explorer/Assets/DCL/Infrastructure/Utility/RemotePlayerUtils.cs`) compares that speed to fixed cutoffs: walk up to 4 m/s, jog above 4 m/s, run above 9.5 m/s.
- `AvatarShapeHandlerSystem.LoadAvatarShape` parents the character to the scene entity and sets the child's local scale to 1, so the entity scale is the body's `lossyScale`. The clip is drawn at that scale. The selector still uses the absolute speed.

The scene writes that shared position every frame. The distance in the lookup is the distance the transform moved, so 10 m/s is a run at every scale.

## Proposed fix

In `UpdateAnimations`, divide that speed by the character transform's `lossyScale` before the lookup. `UpdateMotion` already has the transform. Take the largest absolute axis so a uniform scale matches that scale, and a body enlarged on one axis still counts as larger. A scale of 1 leaves the current thresholds unchanged.

```csharp
Vector3 lossy = characterTransformComponent.Transform.lossyScale;
float bodyScale = Mathf.Max(
    Mathf.Abs(lossy.x),
    Mathf.Abs(lossy.y),
    Mathf.Abs(lossy.z));
if (bodyScale < 0.0001f)
    bodyScale = 1f;

movementBlendValue = RemotePlayerUtils.GetBlendValueFromSpeed(speed / bodyScale);
```

This patch has not been opened on `decentraland/unity-explorer`. On desktop, at 10 m/s the 9x and 3x bodies should drop to walk, and the 1x body should stay on run.

The mobile client (`decentraland/godot-explorer`) has the same kind of absolute cutoffs in `DclAvatar::classify_locomotion` (walk below 4 m/s, jog below 6.5 m/s, run from 6.5 m/s). Scene AvatarShapes are `DclAvatar` nodes, and that function is called from `set_target_position` and `apply_wire_locomotion`. The scene-entity transform path does not call it, so this file does not show the mobile client making the same choice. The confirmed bug is the Unity desktop path above.
