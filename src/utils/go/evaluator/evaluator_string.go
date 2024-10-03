package evaluator

import (
	"fmt"
	"strings"
)

func (e *Evaluator) String() string {
	/*
		- object|earth
		- component|planet
			- property|planet-velocity
				- reference-expr: object|earth > clone-number-target
			- object|circle
				- property|radius
					- call-expr
						- reference-expr: object|earth > component|planet > property|planet-velocity
						- reference-expr: object|earth > object|circle > clone-number-target
		- object|moon
			- property|radius
				- call-expr
					- reference-expr: object|earth > clone-number-target
					- reference-expr: object|earth > object|moon > clone-number-target
			- property|moon-x
				- number-expr: 7
	*/
	var sb strings.Builder
	visitedObjects := make(map[string]bool)

	var writeExObject func(obj *ExObject, indent string)
	writeExObject = func(obj *ExObject, indent string) {
		if visitedObjects[obj.Id] {
			sb.WriteString(fmt.Sprintf("%s- object|%s (already visited)\n", indent, obj.Id))
			return
		}
		visitedObjects[obj.Id] = true
		sb.WriteString(fmt.Sprintf("%s- object|%s\n", indent, obj.Id))

		// Component
		if obj.ComponentId != "" {
			component, exists := e.ComponentById[obj.ComponentId]
			if exists {
				sb.WriteString(fmt.Sprintf("%s\t- component|%s\n", indent, component.Id))
				for _, propId := range component.ComponentParameterPropertyIds {
					prop, exists := e.PropertyById[propId]
					if exists {
						sb.WriteString(fmt.Sprintf("%s\t\t- property|%s\n", indent, prop.Id))
						expr := prop.Expr()
						if expr.ReferenceExpr != nil {
							sb.WriteString(fmt.Sprintf("%s\t\t\t- reference-expr: %s\n", indent, expr.ReferenceExpr.String()))
						}
					}
				}
				for _, propId := range component.BasicPropertyIds {
					prop, exists := e.PropertyById[propId]
					if exists {
						sb.WriteString(fmt.Sprintf("%s\t\t- property|%s\n", indent, prop.Id))
						expr := prop.Expr()
						if expr.ReferenceExpr != nil {
							sb.WriteString(fmt.Sprintf("%s\t\t\t- reference-expr: %s\n", indent, expr.ReferenceExpr.String()))
						}
					}
				}
			}
		}

		// Properties
		for _, propId := range obj.ComponentParameterPropertyIds {
			prop, exists := e.PropertyById[propId]
			if exists {
				sb.WriteString(fmt.Sprintf("%s\t- property|%s\n", indent, prop.Id))
				expr := prop.Expr()
				if expr.ReferenceExpr != nil {
					sb.WriteString(fmt.Sprintf("%s\t\t- reference-expr: %s\n", indent, expr.ReferenceExpr.String()))
				}
			}
		}
		for _, propId := range obj.BasicPropertyIds {
			prop, exists := e.PropertyById[propId]
			if exists {
				sb.WriteString(fmt.Sprintf("%s\t- property|%s\n", indent, prop.Id))
				expr := prop.Expr()
				if expr.CallExpr != nil {
					sb.WriteString(fmt.Sprintf("%s\t\t- call-expr\n", indent))
					arg0 := expr.CallExpr.Arg0()
					arg1 := expr.CallExpr.Arg1()
					if arg0 != nil {
						sb.WriteString(fmt.Sprintf("%s\t\t\t- reference-expr: %s\n", indent, arg0.Id))
					}
					if arg1 != nil {
						sb.WriteString(fmt.Sprintf("%s\t\t\t- reference-expr: %s\n", indent, arg1.Id))
					}
				} else if expr.NumberExpr != nil {
					sb.WriteString(fmt.Sprintf("%s\t\t- number-expr: %v\n", indent, expr.NumberExpr.Value))
				} else if expr.ReferenceExpr != nil {
					sb.WriteString(fmt.Sprintf("%s\t\t- reference-expr: %s\n", indent, expr.ReferenceExpr.String()))
				}
			}
		}

		// Children
		for _, childId := range obj.ChildrenIds {
			child, exists := e.ExObjectById[childId]
			if exists {
				writeExObject(child, indent+"\t")
			}
		}
	}

	for _, rootId := range e.RootExObjectIds {
		if obj, exists := e.ExObjectById[rootId]; exists {
			writeExObject(obj, "")
		}
	}

	return sb.String()
}
