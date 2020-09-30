import Vue from 'vue';
import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import StackTrace from 'stacktrace-js';

// Types

export const Status = {
  'Passed': 'Passed',
  'Failed': 'Failed',
  'NotRun': 'NotRun',
};

export class AssertionError { }

// Store

const makeStore = () => ({
  tests: [] as Array<any>,
});

const store = makeStore();
export const Store = store;

// Actions

export function clearStore() {
  Vue.set(store, 'tests', []);
}

export function runTests() {
  const okTests = [
    // 'pen organs',
    // 'getGhostEdits',
    // 'organs compute',
    // 'pen test',
    // 'insert node, replace node, from tree'
    'ghost edits'
  ] as any[];
  for (const test of store.tests) {
    const ok = okTests.length === 0 || wu(okTests).has(test.name);
    if (!ok) continue;

    try {
      test.testFn();
      test.status = Status.Passed;
    } catch (error) {
      test.status = Status.Failed;
      if (!(error instanceof AssertionError)) {
        console.error(error);
      }
      console.log(`${test.name} failed`);
      continue;
    }
  }
}

export function describe(name, testSuite) {
  testSuite();
};

export function it(name, testFn) {
  store.tests.push({ name, testFn, id: uuidv4(), status: Status.NotRun });
}

// Gets

export const getTests = ((store) => {
  return store.tests;
}).bind(undefined, store);
