//
// Created by Dylan on 5/9/2021.
//

#ifndef EXPRESSO_CODE_H
#define EXPRESSO_CODE_H

#include <algorithm>

class Code {
public:
    template<typename T>
    static void vecremove(vector<T> & v, const T & item)
    {
        v.erase(std::remove(v.begin(), v.end(), item), v.end());
    }
};

#endif //EXPRESSO_CODE_H
