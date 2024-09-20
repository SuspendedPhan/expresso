<script lang="ts">
  import { Effect, Stream } from "effect";
  import { of } from "rxjs";
  import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
  import { ViewCtx } from "src/ctx/ViewCtx";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { EffectUtils } from "src/utils/utils/EffectUtils";
  import type { NavSection } from "src/utils/utils/Nav";
  import { RxFns, type OBS } from "src/utils/utils/Utils";
  import NavCollapsedSectionView from "./NavCollapsedSectionView.svelte";
  import NavSectionView from "./NavSectionView.svelte";

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

  let projectName: string;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const libraryProjectCtx = yield* LibraryProjectCtx;
      const vv = EffectUtils.obsToStream(
        libraryProjectCtx.activeLibraryProject$
      );
      Stream.runForEach(vv, (activeLibraryProject) => {
        return Effect.gen(function* () {
          projectName = activeLibraryProject.name;
        });
      });
      Stream.map;
      // yield* Stream
      RxFns.subscribeScoped(
        libraryProjectCtx.activeLibraryProject$,
        (activeLibraryProject) => {
          projectName = activeLibraryProject.name;
        }
      );
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
      <div class="pl-1 text-lg w-max">Hello World</div>
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
