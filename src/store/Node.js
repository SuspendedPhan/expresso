function makeStore() {
  return {
    rootNodes: [],
  };
}

function makeGets(root, store) {
  return {
    // editableFromName: function (name) {
    //   return wu(store.editableProperties).find(editaableProperty => editaableProperty.name === name);
    // }
  }
}

function makeActions(root, store) {
  return {
    // put: function (name) {
    //   store.editableProperties.push(store.makeEditableProperty(name));
    // }
  }
}

export function make(root) {
  const store = makeStore();
  return {
    store,
    gets: makeGets(root, store),
    actions: makeActions(root, store),
  };
}
