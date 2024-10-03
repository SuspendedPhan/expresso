// evaluator.go

package evaluator

import "fmt"

// -- TYPES --

type Float = float64

var logger Logger2

type Evaluator struct {
	RootExObjectIds                 []string
	ComponentById                   map[string]*Component
	ExObjectById                    map[string]*ExObject
	PropertyById                    map[string]*Property
	ExprById                        map[string]*Expr
	ExObjectIdByCloneNumberTargetId map[string]string
}

// NewEvaluator creates a new Evaluator instance with initialized maps.
func NewEvaluator(logger_ Logger2) *Evaluator {
	logger = logger_
	return &Evaluator{
		RootExObjectIds:                 []string{},
		ComponentById:                   map[string]*Component{},
		ExObjectById:                    map[string]*ExObject{},
		PropertyById:                    map[string]*Property{},
		ExprById:                        map[string]*Expr{},
		ExObjectIdByCloneNumberTargetId: map[string]string{},
	}
}

// AddRootExObject adds an external object ID to the root objects.
func (e *Evaluator) AddRootExObject(exObjectId string) {
	logger.Log("AddRootExObject", exObjectId)
	e.RootExObjectIds = append(e.RootExObjectIds, exObjectId)
}

// RootExObjects retrieves the root external objects.
func (e *Evaluator) RootExObjects() []*ExObject {
	objects := []*ExObject{}
	for _, exObjectId := range e.RootExObjectIds {
		if obj, exists := e.ExObjectById[exObjectId]; exists {
			objects = append(objects, obj)
		} else {
			logger.Log("RootExObjects", "ExObject not found:", exObjectId)
		}
	}
	return objects
}

// Eval performs the evaluation process and returns the final output.
func (e *Evaluator) Eval() EvaluationResult {
	// Step 1: Retrieve Root External Objects
	rootExObjects := e.RootExObjects()

	// Step 2: Extract Property Paths
	cloneCountPropertyPaths, propertyPaths := e.ExtractPropertyPaths(rootExObjects)

	e.debugEval1(cloneCountPropertyPaths, propertyPaths)

	// Step 3: Annotate Clone Counts
	cloneCountResults, annotatedPropertyPaths := e.AnnotateCloneCounts(cloneCountPropertyPaths, propertyPaths)

	// Step 4: Expand Instance Paths
	propertyInstancePaths := e.ExpandInstancePaths(annotatedPropertyPaths)

	// Step 5: Evaluate Property Instances
	propertyInstanceResults := e.EvaluatePropertyInstances(propertyInstancePaths, propertyPaths, cloneCountResults)

	// Step 6: Group Object Instances
	objectInstanceResults := e.GroupObjectInstances(propertyInstanceResults)

	// spew.Dump(objectInstanceResults)

	return EvaluationResult{
		objectInstanceResults: objectInstanceResults,
	}
}

func (e *Evaluator) debugEval1(cloneCountPropertyPaths []*CloneCountPropertyPath, propertyPaths []*PropertyPath) {
	fmt.Println("Clone Count Property Paths:")
	for _, path := range cloneCountPropertyPaths {
		fmt.Println(path.String())
	}

	fmt.Println("Property Paths:")
	for _, path := range propertyPaths {
		fmt.Println(path.String())
	}
}
