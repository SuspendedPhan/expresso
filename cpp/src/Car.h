//
// Created by Dylan on 6/14/2021.
//

#ifndef EXPRESSO_CAR_H
#define EXPRESSO_CAR_H


#include <memory>
#include "vector"
#include "Driver.h"

class Car {
public:
    int id;
    std::unique_ptr<Car> child;
    std::vector<std::unique_ptr<Car>> children;
    std::unique_ptr<Driver> driver;

    Car() : id(-1) {}
    Car(std::unique_ptr<Driver> driver) : driver(std::move(driver)) {}

    static std::unique_ptr<Car> make(std::unique_ptr<Driver> driver) {
        return std::make_unique<Car>(std::move(driver));
    }

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
