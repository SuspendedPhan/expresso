//
// Created by Dylan on 5/17/2021.
//

#ifndef EXPRESSO_SIGNAL_H
#define EXPRESSO_SIGNAL_H


#include <functional>

class Signal {
public:
    std::function<void()> listener;
    void setListener(std::function<void()> listener);
    void dispatch();
};


#endif //EXPRESSO_SIGNAL_H
