//
// Created by Dylan on 4/27/2021.
//

#include "Attribute.h"

AttributeOutput EditableAttribute::eval(const EvalContext &evalContext) {
    AttributeOutput output;
    float value = this->rootNode->eval(evalContext);
    output.value = value;
    output.name = this->name;
    return output;
}

void EditableAttribute2::eval() {

}
