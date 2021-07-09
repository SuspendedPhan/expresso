//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_FUNCTION_H
#define EXPRESSO_FUNCTION_H


#include <memory>
#include <vector>
#include "FunctionParameter.h"
#include "Node.h"

class Node;
class Project;

class Function {
private:
    std::string id;
    std::string name;
    std::vector<std::unique_ptr<FunctionParameter>> parameters;
    std::unique_ptr<Node> rootNode;
    Project * _project;
    Signal _onChangedSignal;
public:
    Function(std::string name, std::unique_ptr<Node> rootNode, std::string id);
    explicit Function(std::string name, std::unique_ptr<Node> rootNode);

    void addParameter(std::unique_ptr<FunctionParameter> parameter);

    const std::string &getId() const;

    const std::string &getName() const;
    Node * getRootNode();
    std::vector<FunctionParameter *> getParameters();
    void setRootNode(std::unique_ptr<Node> rootNode);
    Project * getProject();
    void setProject(Project *project);

    Signal * getOnChangedSignal();
};


#endif //EXPRESSO_FUNCTION_H
