//
// Created by Dylan on 4/28/2021.
//

#ifndef EXPRESSO_FAKEBOOK_H
#define EXPRESSO_FAKEBOOK_H


#include <emscripten/val.h>

template<typename T>
inline void vecremove(vector<T> & v, const T & item)
{
    v.erase(std::remove(v.begin(), v.end(), item), v.end());
}

class FakeBook {
public:
    static shared_ptr<FakeBook> fake;

    static FakeBook* make(emscripten::val onDelete) {
        fake = std::make_shared<FakeBook>();
        fake->weakThis = std::weak_ptr<FakeBook>(fake);
        fake->onDelete = onDelete;
        return fake.get();
    }

    std::string value;
    emscripten::val onDelete = emscripten::val::null();
    emscripten::val onValueChanged = emscripten::val::null();
    emscripten::val onChildrenChanged = emscripten::val::null();
    std::vector<std::shared_ptr<FakeBook>> children;
    int id = rand();
    std::weak_ptr<FakeBook> weakThis;
    std::weak_ptr<FakeBook> parent;

    std::string getValue() {
        return this->value;
    }

    void setValue(std::string value) {
        this->value = value;
        if (!this->onValueChanged.isNull()) {
            this->onValueChanged();
        }
    }

    void subscribeOnValueChanged(emscripten::val onValueChanged) {
        this->onValueChanged = std::move(onValueChanged);
    }

    void subscribeOnChildrenChanged(emscripten::val onChildrenChanged) {
        this->onChildrenChanged = std::move(onChildrenChanged);
    }

    void addChild() {
        const shared_ptr<FakeBook> &fake = std::make_shared<FakeBook>();
        fake->weakThis = std::weak_ptr<FakeBook>(fake);
        fake->parent = this->weakThis;
        this->children.emplace_back(fake);
        if (!this->onChildrenChanged.isNull()) {
            this->onChildrenChanged();
        }
    }

    void remove() {
        this->parent.lock()->removeChild(this->weakThis.lock());
    }

    void removeChild(std::shared_ptr<FakeBook> child) {
        vecremove(this->children, child);
        if (!this->onChildrenChanged.isNull()) {
            this->onChildrenChanged();
        }
    }

    std::vector<FakeBook*>* getChildren() {
        auto children = new std::vector<FakeBook*>();
        for (const auto &child : this->children) {
            children->emplace_back(child.get());
        }
        return children;
    }

    int getId() {
        return id;
    }
};


#endif //EXPRESSO_FAKEBOOK_H
