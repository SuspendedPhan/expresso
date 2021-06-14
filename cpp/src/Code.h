//
// Created by Dylan on 5/9/2021.
//

#ifndef EXPRESSO_CODE_H
#define EXPRESSO_CODE_H

#include <algorithm>
#include <random>
#include <sstream>
#include <functional>
#include <iostream>

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

    template<typename T>
    static std::vector<T> filter(const std::vector<T> & v, std::function<bool(const T &)> predicate) {
        std::vector<T> answer;
        for (const auto &item : v) {
            if (predicate(item)) {
                answer.emplace_back(std::move(item));
            }
        }
        return answer;
    }

    template<typename T>
    static std::vector<T> reject(const std::vector<T> & v, std::function<bool(const T &)> predicate) {
        return Code::filter<T>(v, [&](auto & item) { return !predicate(item); });
    }

    template<typename T, typename U>
    static std::vector<U> map(const std::vector<T> & v, std::function<U(const T &)> transform) {
        std::vector<U> answer;
        for (const auto &item : v) {
            answer.emplace_back(transform(item));
        }
        return answer;
    }

    template<typename T>
    static std::unique_ptr<T> remove(std::vector<std::unique_ptr<T>> &v, std::function<bool(const std::unique_ptr<T> &)> predicate) {
        auto it = find_if(v.begin(), v.end(), predicate);
        if (it == v.end()) {
            std::cerr << "Error in Code::remove" << std::endl;
        } else {
            auto answer = std::move(*it);
            v.erase(it);
            return std::move(answer);
        }
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
