interface ProxyData {
  objectId: string;
}

interface InvokeData {
  objectId: string;
  methodName: string;
  args: InvokeArg[];
}

interface InvokeArg {
  objectId?: string;
  primitive?: string | number | boolean;
}

declare module window {
  function invoke(data: InvokeData);
}


function argToInvokeArg(arg: any) {
  const objectId = arg["$$objectId"];
  if (objectId !== undefined) {
    return { objectId };
  } else {
    return { primitive: arg };
  }
}

const proxyHandler = {
  get: function (target: ProxyData, prop, receiver) {
    if (prop === "$$objectId") {
      return target.objectId;
    }

    return (...args) => {
      const invokeArgs = args.map(t => argToInvokeArg(t));
      const invokeData: InvokeData = {
        objectId: target.objectId,
        methodName: prop,
        args: invokeArgs
      };
      return window.invoke(invokeData);
    }
  }
}

export default class GoProxy {
  static make(objectId: string) {
    const data: ProxyData = {
      objectId
    };

    return new Proxy(data, proxyHandler);
  }
}