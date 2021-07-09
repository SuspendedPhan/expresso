//
// Created by Dylan on 5/17/2021.
//

#include <iostream>
#include "Signal.h"

void Signal::setListener(std::function<void()> listener) {
    this->listener = listener;
}

void Signal::dispatch() {
    std::cout << "dispatch 1" << std::endl;
    if (this->listener) {
        std::cout << "dispatch 2" << std::endl;
        this->listener();
    }
}
