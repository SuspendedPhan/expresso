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

const proxyById = new Map();

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
      const returnData = window.GoModule.invokeFunc(invokeData);
      if (returnData === undefined) {
        return undefined;
      }

      if (returnData.objectId !== undefined) {
        if (!proxyById.has(returnData.objectId)) {
          proxyById.set(returnData.objectId, GoProxy.make(returnData.objectId));
        }
        return proxyById.get(returnData.objectId);
      } else if (returnData.primitive !== undefined) {
        return returnData.primitive;
      } else {
        console.error("return error");
        return undefined;
      }
    }
  }
}

export default class GoProxy {
  static make(objectId: string) {
    const data: ProxyData = {
      objectId
    };

    const proxy = new Proxy(data, proxyHandler);
    proxyById.set(objectId, proxy);
    return proxy;
  }
}