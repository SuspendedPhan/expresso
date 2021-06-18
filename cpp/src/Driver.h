//
// Created by Dylan on 6/18/2021.
//

#ifndef EXPRESSO_DRIVER_H
#define EXPRESSO_DRIVER_H

class Car;


class Driver {
public:
    static std::unique_ptr<Car> make(std::unique_ptr<Driver> driver) {
        return std::make_unique<Car>(std::move(driver));
    }
};


#endif //EXPRESSO_DRIVER_H
