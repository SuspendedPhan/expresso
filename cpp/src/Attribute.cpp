//
// Created by Dylan on 4/27/2021.
//

#include "Attribute.h"

AttributeOutput EditableAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    float value = this->rootNode->eval(evalContext);
    output.value = value;
    output.name = this->name;
    return output;
}

IntrinsicAttribute::IntrinsicAttribute(const std::string &name, const weak_ptr<Organism> &organism) : Attribute(name,
                                                                                                                organism) {}

AttributeOutput IntrinsicAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    output.name = this->name;
    const std::weak_ptr<const IntrinsicAttribute> &shared_this = std::static_pointer_cast<const IntrinsicAttribute>(
            shared_from_this());
    output.value = evalContext.valueByIntrinsicAttribute.find(shared_this)->second;
    return output;
}
