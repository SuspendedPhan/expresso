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

const FunctionParameter * addParameter(
        std::vector<std::unique_ptr<FunctionParameter>> &parameters, std::string name) {
    auto uniq = std::make_unique<FunctionParameter>(std::move(name));
    const auto ptr = uniq.get();
    parameters.push_back(std::move(uniq));
    return ptr;
}


void PrimitiveFunctionCollection::addFunctions() {
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
        _primitiveFunctions.emplace_back(std::make_unique<PrimitiveFunction>(id, name, std::move(parameters), eval));
    }

    {
        std::vector<std::unique_ptr<FunctionParameter>> parameters;
        const auto a = addParameter(parameters, "a");
        const auto eval = [&](std::map<const FunctionParameter *, Value> args) {
            return abs(args[a]);
        };
        const auto name = "Abs";
        const auto id = "ee9b3051-a5a4-427e-92e1-90326e3135d0";
        _primitiveFunctions.emplace_back(std::make_unique<PrimitiveFunction>(id, name, std::move(parameters), eval));
    }

//    {
//        std::vector<std::unique_ptr<FunctionParameter>> parameters;
//        const auto a = addParameter(parameters, "a");
//        const auto b = addParameter(parameters, "b");
//        const auto t = addParameter(parameters, "t");
//        const auto eval = [&](std::map<const FunctionParameter *, DataType> args) {
//            return args[a] + args[t] * (args[b] - args[a]);
//        };
//        const auto name = NAME;
//        const auto id = ID;
//        _primitiveFunctions.emplace_back(PrimitiveFunction(id, name, std::move(parameters), eval));
//    }
}

