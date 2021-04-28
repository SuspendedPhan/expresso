//
// Created by Dylan on 4/27/2021.
//

#include <map>
#include <vector>
#include <string>
#include "Attribute.h"

class Attribute;

class Attribute {
    public:
        std::string name;
        weak_ptr<Organism> organism;

        Attribute(std::string name, weak_ptr<Organism> organism) {
            this->name = name;
            this->organism = organism;
        }

        virtual AttributeOutput eval(const EvalContext& evalContext) = 0;
        virtual ~Attribute() {}
};