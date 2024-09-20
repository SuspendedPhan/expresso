import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, pass, variation, type VariantOf } from "variant";

interface NavFocus_ {
  Project: {};
  Library: {};
}

export const NavFocusFactory = dexVariant.scoped("NavFocus")(
  dexVariant.typed<NavFocus_>({
    Project: pass,
    Library: pass,
  })
);

export type NavFocus = VariantOf<typeof NavFocusFactory>;
export type NavFocusKind = DexVariantKind<typeof NavFocusFactory>;

export const NavProjectNameFocusFactory = variation(
  "NavProjectNameFocus",
  fields<{isEditing: boolean}>()
);
export type NavProjectNameFocus = ReturnType<typeof NavProjectNameFocusFactory>;

// export function createNavFocusCtx(ctx: MainContext) {
//   register(ctx);
//   return {
//     sectionFocused$(section: NavSection) {
//       return ctx.focusCtx.mapFocus$((focus) => {
//         const isProject = FocusKind.is.ProjectNav(focus) && section === ctx.viewCtx.navSections[0];
//         const isLibrary = FocusKind.is.LibraryNav(focus) && section === ctx.viewCtx.navSections[1];
//         return isProject || isLibrary;
//       });
//     },
//   };
// }

// function register(ctx: MainContext) {
//   const { keyboardCtx, focusCtx } = ctx;
//   keyboardCtx
//     .onKeydown$(
//       "g",
//       focusCtx.mapFocus$((focus) => {
//         return (
//           !FocusKind.is.ProjectNav(focus) && !FocusKind.is.LibraryNav(focus)
//         );
//       })
//     )
//     .subscribe(() => {
//       focusCtx.setFocus(FocusKind.ProjectNav());
//     });

//   keyboardCtx
//     .onKeydown$("e", focusCtx.mapFocus$(FocusKind.is.ProjectNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.ProjectEditor);
//       focusCtx.popFocus();
//     });

//   keyboardCtx
//     .onKeydown$("c", focusCtx.mapFocus$(FocusKind.is.ProjectNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.ProjectComponents);
//       focusCtx.popFocus();
//     });

//   keyboardCtx
//     .onKeydown$("f", focusCtx.mapFocus$(FocusKind.is.ProjectNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.ProjectFunctionList);
//       focusCtx.popFocus();
//     });

//   keyboardCtx
//     .onKeydown$("l", focusCtx.mapFocus$(FocusKind.is.ProjectNav))
//     .subscribe(() => {
//       focusCtx.setFocus(FocusKind.LibraryNav());
//     });

//   // Library Nav

//   keyboardCtx
//     .onKeydown$("p", focusCtx.mapFocus$(FocusKind.is.LibraryNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.LibraryProjectList);
//       focusCtx.popFocus();
//       focusCtx.popFocus();
//     });

//   keyboardCtx
//     .onKeydown$("c", focusCtx.mapFocus$(FocusKind.is.LibraryNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.LibraryComponentList);
//       focusCtx.popFocus();
//       focusCtx.popFocus();
//     });

//   keyboardCtx
//     .onKeydown$("f", focusCtx.mapFocus$(FocusKind.is.LibraryNav))
//     .subscribe(() => {
//       ctx.viewCtx.activeWindow$.next(DexWindow.LibraryFunctionList);
//       focusCtx.popFocus();
//       focusCtx.popFocus();
//     });

//   keyboardCtx.registerCancel(focusCtx.mapFocus$(FocusKind.is.ProjectNav));
//   keyboardCtx.registerCancel(focusCtx.mapFocus$(FocusKind.is.LibraryNav));
// }
