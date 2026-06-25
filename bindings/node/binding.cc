#include <napi.h>
#include "src/tree_sitter/parser.h"

extern "C" TSLanguage *tree_sitter_varian();

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("name", Napi::String::New(env, "varian"));
    auto language = Napi::External<TSLanguage>::New(env, tree_sitter_varian());
    exports.Set("language", language);
    return exports;
}

NODE_API_MODULE(tree_sitter_varian_binding, Init)
