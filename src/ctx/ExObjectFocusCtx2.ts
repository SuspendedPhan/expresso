// import assert from "assert-ts";
// import { Context, Layer, Effect } from "effect";
// import { firstValueFrom } from "rxjs";
// import type { ExItem } from "src/ex-object/ExItem";
// import type { ExObject } from "src/ex-object/ExObject";
// import type { Property } from "src/ex-object/Property";
// import { FocusKind } from "src/utils/focus/FocusKind";
// import type { OBS } from "src/utils/utils/Utils";





// export class ExObjectFocusCtx extends Effect.Tag("ExObjectFocusCtx")<
//   ExObjectFocusCtx,
//   {
//     get exObjectFocus$(): OBS<ExObject | false>;
//     // get nameFocus$(): OBS<ExObject>;
//     // get componentFocus$(): OBS<ExObject>;
//     // get propertyFocus$(): OBS<Property | false>;
//     // getNextProperty(property: Property): Promise<Property | null>;
//     // prevProperty(property: Property): Promise<Property | null>;
//     // focusNextExItem(property: Property): Promise<void>;
//     // focusPrevExItem(property: Property): Promise<void>;
//     // getNextExItem(property: Property): Promise<ExItem | null>;
//     // get exItemFocus$(): OBS<ExItem | false>;
//   }
// >() {}

// export const ExObjectFocusCtxLive = Layer.effect(
//   ExObjectFocusCtx,
//   Effect.gen(function* () {
//     const { focusCtx } = ctx;


//     return {
//       get exObjectFocus$() {
//         return mapExObjectFocus$(FocusKind.is.ExObject);
//       },

//       get nameFocus$() {
//         return mapExObjectFocus$(FocusKind.is.ExObjectName);
//       },

//       get componentFocus$() {
//         return mapExObjectFocus$(FocusKind.is.ExObjectComponent);
//       },

//       get propertyFocus$() {
//         return ctx.focusCtx.mapFocus$((focus) => {
//           return FocusKind.is.Property(focus) ? focus.property : false;
//         });
//       },

//       get exItemFocus$() {
//         return ctx.focusCtx.mapFocus$((focus) => {
//           const exItem: ExItem | false = FocusKind.match(focus, {
//             ExObject: ({ exObject }) => exObject as ExItem | false,
//             ExObjectName: ({ exObject }) => exObject,
//             ExObjectComponent: ({ exObject }) => exObject,
//             Property: ({ property }) => property,
//             Expr: ({ expr }) => expr,
//             default: () => false,
//           });
//           return exItem;
//         });
//       },
//     };
//   })
// );
