//
// Created by Dylan on 7/11/2021.
//

#include "EvalContext.h"

void EvalContext::setValue(const IntrinsicAttribute *attribute, float value) {
    _valueByIntrinsicAttribute[attribute] = value;
}
