//
// Created by Dylan on 7/13/2021.
//

#ifndef EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H
#define EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H


#include "Node.h"

class PrimitiveFunction;

class PrimitiveFunctionCallNode : public Node {
private:
    PrimitiveFunction * _primitiveFunction;
    FunctionArgumentCollection _arguments;
public:
    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;
    PrimitiveFunction * getCalledFunction();

    explicit PrimitiveFunctionCallNode(PrimitiveFunction *primitiveFunction);

    PrimitiveFunctionCallNode(const std::string &id, PrimitiveFunction *primitiveFunction);

    FunctionArgumentCollection * getArgumentCollection();
};


#endif //EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H
