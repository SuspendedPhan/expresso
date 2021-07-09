//
// Created by Dylan on 5/17/2021.
//

#include <iostream>
#include "Signal.h"

void Signal::setListener(std::function<void()> listener) {
    this->listener = listener;
}

void Signal::dispatch() {
    if (this->listener) {
        this->listener();
    }
}
