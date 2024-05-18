import GoProxy from '@/code/GoProxy'

declare var GoModule: any

const target = {}

export default new Proxy(target, {
  get(target: {}, p: PropertyKey, receiver: any): any {
    return () => {
      const objectId = window.GoModule.newFuncs[p]()
      return GoProxy.make(objectId)
    }
  }
})
