{
  "targets": [
    {
      "target_name": "tree_sitter_varian_binding",
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c"
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include\")",
        "src"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags_c": [
        "-std=c11"
      ],
      "defines": [
        "NDEBUG"
      ]
    }
  ]
}
