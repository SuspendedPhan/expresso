//
// Created by Dylan on 7/13/2021.
//

#ifndef EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H
#define EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H


#include "Node.h"

class PrimitiveFunction;

class PrimitiveFunctionCallNode : public Node {
private:
    const PrimitiveFunction * _primitiveFunction;
    FunctionArgumentCollection _arguments = FunctionArgumentCollection(this);
public:
    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;
    const PrimitiveFunction * getCalledFunction() const;

    explicit PrimitiveFunctionCallNode(const PrimitiveFunction *primitiveFunction);

    PrimitiveFunctionCallNode(const std::string &id, const PrimitiveFunction *primitiveFunction);

    FunctionArgumentCollection * getArgumentCollection();
};


#endif //EXPRESSO_PRIMITIVEFUNCTIONCALLNODE_H
