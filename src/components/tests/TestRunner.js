import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import StackTrace from 'stacktrace-js';

// Types

export const Status = {
  'Passed': 'Passed',
  'Failed': 'Failed',
  'NotRun': 'NotRun',
};

// Store

const makeStore = () => ({
  tests: [],
});

const store = makeStore();
export const Store = store;

// Actions

export function runTests() {
  for (const test of store.tests) {
    try {
      test.testFn();
      test.status = Status.Passed;
    } catch (ex) {
      test.status = Status.Failed;
    }
  }
}

export function describe(name, testSuite) { };

export function it(name, testFn) {
  store.tests.push({ name, testFn, id: uuidv4(), status: Status.NotRun });
}

// Gets

export const getTests = ((store) => {
  return store.tests;
}).bind(undefined, store);
