#include <emscripten/bind.h>

using namespace emscripten;

class EvalOutput {
    public:
        std::vector<float> radiuss;
        float getRadius(int cloneNumber) { return this->radiuss[cloneNumber]; }
        int getCloneCount() { return this->radiuss.size(); }
};

class Ast {
    public:
        void setClones(int clones) {
            this->clones = clones;
        }

        EvalOutput* eval() {
           auto output = new EvalOutput();
           output->radiuss.resize(this->clones);
           for (int i = 0; i < this->clones; i++) {
                output->radiuss[i] = i * 50;
           }
           return output;
        }

    private:
        int clones;
};

int say_hello() {
  printf("Hello from your wasm module\n");
  return 0;
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("sayHello", &say_hello);

  class_<Ast>("Ast")
    .constructor<>()
    .function("setClones", &Ast::setClones)
    .function("eval", &Ast::eval, allow_raw_pointers())
  ;

  class_<EvalOutput>("EvalOutput")
    .constructor<>()
    .function("getRadius", &EvalOutput::getRadius)
    .function("getCloneCount", &EvalOutput::getCloneCount)
  ;
}