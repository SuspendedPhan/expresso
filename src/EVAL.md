- ItemPath
    - object|earth / object|moon > property|radius
    - object|earth / component|planet / object|circle > property|radius
    - object|earth / component|planet > property|velocity
    - object|earth > clone-count-property

- ItemInstancePath
    - object|earth: 5 / object|moon: 2 > property|radius
    - object|earth: 5 / component|planet / object|circle: 10 > property|radius
    - object|earth: 5 / component|planet > property|velocity
    - object|earth: 5 > clone-count-property

- object, component, property, clone-count-property
    - CreateObjectPathSegment
    - CreateComponentPathSegment
    - CreatePropertyPathSegment
    - CreateCloneCountPropertyPathSegment
    - AppendPathSegment