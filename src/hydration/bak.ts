// @ts-nocheck
const libraryProject = yield* LibraryProjectFactory2({
    id: deProject.id,
    name: deProject.name,
    project,
  });

  const library = yield* LibraryCtx.library;
  library.libraryProjects.push(libraryProject);