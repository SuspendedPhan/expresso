// eval_6_test.go

package evaluator_test

var expectedFinalResults = []map[string]interface{}{
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        2,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        3,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        4,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        5,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        6,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        3,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        4,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        5,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        6,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        4,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        5,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        6,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        8,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        5,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        6,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        8,
			},
		},
	},
	{
		"exObjectId": "circle",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "circle-radius",
				"value":                        9,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        2,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        3,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        4,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        3,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        4,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        5,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        4,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        5,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        6,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        5,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        6,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
	{
		"exObjectId": "moon",
		"propertyInstanceResults": []map[string]interface{}{
			{
				"componentParameterPropertyId": "moon-radius",
				"value":                        7,
			},
			{
				"componentParameterPropertyId": "moon-x",
				"value":                        7,
			},
		},
	},
}
