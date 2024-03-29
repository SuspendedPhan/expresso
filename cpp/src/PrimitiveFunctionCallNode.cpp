//
// Created by Dylan on 7/13/2021.
//

#include "PrimitiveFunctionCallNode.h"
#include "PrimitiveFunction.h"

float PrimitiveFunctionCallNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    std::map<const FunctionParameter *, Value>
    for (const auto &parameter : _primitiveFunction->getParameters()->getAll()) {
        const auto &argument = _arguments.getArgument(parameter);
        nodeEvalContext.valueByParameter[parameter] = argument->eval(evalContext, nodeEvalContext);
    }
    const auto evalFunctor = _primitiveFunction->getEvalFunctor();
    const auto answer = evalFunctor(nodeEvalContext.valueByParameter);
    for (const auto &parameter : _primitiveFunction->getParameters()->getAll()) {
        nodeEvalContext.valueByParameter.erase(parameter);
    }
    return answer;
}

const PrimitiveFunction *PrimitiveFunctionCallNode::getCalledFunction() const {
    return _primitiveFunction;
}

FunctionArgumentCollection *PrimitiveFunctionCallNode::getArgumentCollection() {
    return &_arguments;
}

PrimitiveFunctionCallNode::PrimitiveFunctionCallNode(const PrimitiveFunction *primitiveFunction) : _primitiveFunction(
        primitiveFunction) {}

PrimitiveFunctionCallNode::PrimitiveFunctionCallNode(const std::string &id, const PrimitiveFunction *primitiveFunction)
        : Node(id), _primitiveFunction(primitiveFunction) {}
