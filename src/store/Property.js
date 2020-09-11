import wu from 'wu';

function makeStore() {
  return {
    computedProperties: [],
    editableProperties: [],
    makeEditableProperty: (name) => ({
      name,
      rootNode: null,
    }),
    
    /** { rootNodeId, parentPropertyId } */
    rootNodeParents: [],
  };
}

function makeGets(root, store) {
  return {
    editableFromName: function (name) {
      return wu(store.editableProperties).find(editaableProperty => editaableProperty.name === name);
    }
  }
}

function makeActions(root, store) {
  return {
    putEditable: function (name) {
      const answer = store.makeEditableProperty(name);
      store.editableProperties.push(answer);
      return answer;
    }
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
