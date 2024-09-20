<script lang="ts">
  import { Effect, Stream, Ref } from "effect";
  import { of } from "rxjs";
  import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
  import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
  import { ViewCtx } from "src/ctx/ViewCtx";
  import {
    NavProjectNameFocusFactory,
    type NavProjectNameFocus,
  } from "src/focus/NavFocus";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { EffectUtils } from "src/utils/utils/EffectUtils";
  import { log5 } from "src/utils/utils/Log5";
  import type { NavSection } from "src/utils/utils/Nav";
  import { type OBS } from "src/utils/utils/Utils";
  import {
    createFieldValueData,
    type FieldValueData,
  } from "src/utils/views/Field";
  import FieldValue from "src/utils/views/FieldValue.svelte";
  import { isType } from "variant";
  import NavCollapsedSectionView from "./NavCollapsedSectionView.svelte";
  import NavSectionView from "./NavSectionView.svelte";
  import { Subject } from "rxjs/internal/Subject";

  const log55 = log5("NavMenuView.svelte");

  let navCollapsed$: OBS<boolean>;
  let navSections: NavSection[];

  DexRuntime.runPromise(
    Effect.gen(function* () {
      navCollapsed$ = yield* ViewCtx.navCollapsed$;
      navSections = yield* ViewCtx.navSections;
    })
  );

  const projectNavFocused$ = of(false);

  function toggleNav() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const navCollapsed$ = yield* ViewCtx.navCollapsed$;
        navCollapsed$.next(!navCollapsed$.value);
      })
    );
  }

  let projectName$ = new BehaviorSubject<string>("");
  let projectNameFieldData: FieldValueData;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const libraryProjectCtx = yield* LibraryProjectCtx;

      projectNameFieldData = yield* createFieldValueData<NavProjectNameFocus>({
        value$: projectName$,
        focusIsFn: isType(NavProjectNameFocusFactory),
        createEditingFocusFn: (isEditing) =>
          NavProjectNameFocusFactory({ isEditing }),
        filterFn: () => true,
      });
      yield* Stream.runForEach(projectNameFieldData.onInput, (value) => {
        return Effect.gen(function* () {
          log55.debug("Updating project name: input");
          const vv = yield* libraryProjectCtx.activeLibraryProject;
          yield* Ref.set(vv.name, value);
        });
      });
    })
  );

  DexRuntime.runPromise(
    Effect.gen(function* () {
      log55.debug("Updating project name: start");
      // TODO: leak
      const libraryProjectCtx = yield* LibraryProjectCtx;
      const activeLibraryProject = EffectUtils.obsToStream(
        libraryProjectCtx.activeLibraryProject$
      );
      const name = Stream.flatMap(
        activeLibraryProject,
        (activeLibraryProject2) => {
          log55.debug("Updating project name: active library project changed");
          return activeLibraryProject2.name.changes;
        },
        { switch: true }
      );
      yield* Stream.runForEach(name, (name2) => {
        return Effect.gen(function* () {
          projectName$.next(name2);
        });
      });
    })
  );
</script>

{#if $navCollapsed$}
  <div class="p-2 bg-base-200 flex flex-col">
    <div class="p-1 indicator">
      <span
        class="indicator-item indicator-right indicator-bottom badge underline text-xs"
        class:hidden={!$projectNavFocused$}>H</span
      >
      <button
        class="fa-solid fa-bars block btn btn-sm w-8 h-8 p-0 shadow-none"
        on:click={toggleNav}
      ></button>
    </div>

    {#each navSections as section}
      <div class="divider m-0"></div>
      <NavCollapsedSectionView {section}></NavCollapsedSectionView>
    {/each}
  </div>
{:else}
  <ul class="bg-base-200 h-full menu">
    <div class="p-4 pr-0 py-2 flex items-center gap-8">
      <div class="pl-1 text-lg w-max">
        <FieldValue fieldData={projectNameFieldData} />
      </div>
      <div class="indicator">
        <span
          class="indicator-item indicator-right indicator-bottom badge underline text-xs"
          class:hidden={!$projectNavFocused$}>H</span
        >
        <button
          class="fa-solid fa-bars btn btn-sm shadow-none"
          on:click={toggleNav}
        ></button>
      </div>
    </div>

    {#each navSections as section}
      <div class="divider m-0"></div>
      <NavSectionView {section}></NavSectionView>
    {/each}
  </ul>
{/if}
