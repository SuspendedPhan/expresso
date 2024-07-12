export default function DecTest() {
    new Test().test();
}

class Test {
    hi = 1;
    constructor() {
        this.hi = 2;
    }

    @testDecorator
    public test() {
        this.test2();
        console.log("hi", this.hi);
    }

    private test2() {
        console.log("test2");
    }
}


function testDecorator(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    console.log(target);
  
    const originalMethod = descriptor.value;
    // descriptor.value = (...args: any[]) => {
    //   console.log("testDecorator");
    //   return originalMethod.apply(target, args);
    // };
    descriptor.value = function (...args: any[]) {
        console.log("testDecorator");
        return originalMethod.apply(target, args);
      };
    // return descriptor;
  }
  