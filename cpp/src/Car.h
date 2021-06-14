//
// Created by Dylan on 6/14/2021.
//

#ifndef EXPRESSO_CAR_H
#define EXPRESSO_CAR_H


#include <memory>

class Car {
public:
    int id;
    std::unique_ptr<Car> child;

    Car(int id) : id(id) {}
    Car() : id(-1) {}

    void setChild(std::unique_ptr<Car> child) {
        this->child = std::move(child);
    }

    Car* getChild() const {
        return this->child.get();
    }

    int getId() const {
        return id;
    }

    void setId(int id) {
        Car::id = id;
    }
};


#endif //EXPRESSO_CAR_H
