//
// Created by Dylan on 5/9/2021.
//

#ifndef EXPRESSO_CODE_H
#define EXPRESSO_CODE_H

#include <algorithm>
#include <random>
#include <sstream>

static std::random_device              rd;
static std::mt19937                    gen(rd());
static std::uniform_int_distribution<> dis(0, 15);
static std::uniform_int_distribution<> dis2(8, 11);

class Code {
public:
    template<typename T>
    static void vecremove(std::vector<T> & v, const T & item)
    {
        v.erase(std::remove(v.begin(), v.end(), item), v.end());
    }

    static std::string generateUuidV4() {
        std::stringstream ss;
        int i;
        ss << std::hex;
        for (i = 0; i < 8; i++) {
            ss << dis(gen);
        }
        ss << "-";
        for (i = 0; i < 4; i++) {
            ss << dis(gen);
        }
        ss << "-4";
        for (i = 0; i < 3; i++) {
            ss << dis(gen);
        }
        ss << "-";
        ss << dis2(gen);
        for (i = 0; i < 3; i++) {
            ss << dis(gen);
        }
        ss << "-";
        for (i = 0; i < 12; i++) {
            ss << dis(gen);
        };
        return ss.str();
    }
};

#endif //EXPRESSO_CODE_H
