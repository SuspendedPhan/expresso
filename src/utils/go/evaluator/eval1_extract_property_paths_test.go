// eval1_extract_property_paths_test.go

package evaluator_test

import "testing"

// ---Input---
// - object|earth
//     - component|planet
//         - property|velocity
//         - object|circle
//             - property|radius
//     - object|moon
//         - property|radius
//
// ---Output---
// CloneCountPropertyPaths:
// - object|earth > clone-count-property
// - object|earth / object|moon > clone-count-property
// - object|earth / component|planet / object|circle > clone-count-property

// NonCloneCountPropertyPaths:
// - object|earth / object|moon > property|radius
// - object|earth / component|planet > property|velocity
// - object|earth / component|planet / object|circle > property|radius

func TestExtractPropertyPaths(t *testing.T) {
}
