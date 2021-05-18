//
// Created by Dylan on 5/17/2021.
//

#ifdef __EMSCRIPTEN__

#ifndef EXPRESSO_EMBINDUTIL_H
#define EXPRESSO_EMBINDUTIL_H

#include "Signal.h"

class EmbindUtil {
public:
    static void setSignalListener(Signal* signal, emscripten::val listener) {
        signal->setListener(listener);
    }
};

#endif


#endif //EXPRESSO_EMBINDUTIL_H
