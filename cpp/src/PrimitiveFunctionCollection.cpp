//
// Created by Dylan on 7/11/2021.
//

#include <map>
#include <vector>
#include "PrimitiveFunctionCollection.h"
#include "FunctionParameter.h"
#include "Value.h"
#include "PrimitiveFunction.h"
#include "Code.h"

std::unique_ptr<PrimitiveFunctionCollection> PrimitiveFunctionCollection::_instance;

const FunctionParameter * addParameter(
        std::vector<std::unique_ptr<FunctionParameter>> &parameters, std::string name) {
    auto uniq = std::make_unique<FunctionParameter>(std::move(name));
    const auto ptr = uniq.get();
    parameters.push_back(std::move(uniq));
    return ptr;
}

std::vector<const PrimitiveFunction *> PrimitiveFunctionCollection::getFunctions() const {
    std::vector<const PrimitiveFunction *> answer;
    for (auto &primitiveFunction : _primitiveFunctions) {
        answer.push_back(primitiveFunction.get());
    }
    return answer;
}

const PrimitiveFunctionCollection *PrimitiveFunctionCollection::getInstance() {
    if (_instance) {
        return _instance.get();
    }

    _instance = std::make_unique<PrimitiveFunctionCollection>();

    {
        std::vector<std::unique_ptr<FunctionParameter>> parameters;
        const auto a = addParameter(parameters, "a");
        const auto b = addParameter(parameters, "b");
        const auto t = addParameter(parameters, "t");
        const auto eval = [&](std::map<const FunctionParameter *, Value> args) {
            return args[a] + args[t] * (args[b] - args[a]);
        };
        const auto name = "Lerp";
        const auto id = "aad72920-b36d-4d0d-b01b-fce55e842b4d";
        _instance->_primitiveFunctions.emplace_back(std::make_unique<PrimitiveFunction>(id, name, std::move(parameters), eval));
    }

    {
        std::vector<std::unique_ptr<FunctionParameter>> parameters;
        const auto a = addParameter(parameters, "a");
        const auto eval = [&](std::map<const FunctionParameter *, Value> args) {
            return abs(args[a]);
        };
        const auto name = "Abs";
        const auto id = "ee9b3051-a5a4-427e-92e1-90326e3135d0";  // remember to change this
        _instance->_primitiveFunctions.emplace_back(std::make_unique<PrimitiveFunction>(id, name, std::move(parameters), eval));
    }

    {
        std::vector<std::unique_ptr<FunctionParameter>> parameters;
        const auto a = addParameter(parameters, "a");
        const auto b = addParameter(parameters, "b");
        const auto eval = [&](std::map<const FunctionParameter *, Value> args) {
            std::cout << "args[a] " << args[a] << std::endl;
            std::cout << "args[b] " << args[b] << std::endl;
            return args[a] + args[b];
        };
        const auto name = "+";
        const auto id = "d1550fa4-1918-4055-87f6-7507dc6e07a9";  // remember to change this
        _instance->_primitiveFunctions.emplace_back(std::make_unique<PrimitiveFunction>(id, name, std::move(parameters), eval));
    }

    return _instance.get();
}

