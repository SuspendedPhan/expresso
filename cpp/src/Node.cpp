//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

//float AttributeReferenceNode::eval(const EvalContext &evalContext) {
//    return attribute.lock()->eval(evalContext).value;
//}

float NumberNode::eval(const EvalContext &evalContext) {
    return this->value;
}
