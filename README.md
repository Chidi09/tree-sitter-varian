# tree-sitter-varian

Varian grammar for [tree-sitter](https://tree-sitter.github.io/tree-sitter/).

## What this is

The parser the [Varian](https://github.com/Chidi09/VarianLang) Zed/Neovim/VS Code extensions use for syntax highlighting, indentation, and code-folding. It mirrors the language spec exactly — every keyword, expression form, declaration, and operator from the upstream C lexer/parser is covered.

## Files

- `grammar.js` — the grammar definition. Regenerate `src/parser.c` from this with `tree-sitter generate`.
- `src/parser.c` + `src/tree_sitter/parser.h` — generated C parser (do not edit by hand).
- `bindings/node/binding.cc` — Node native addon (so editors using `node-tree-sitter` can load this).
- `queries/highlights.scm` — highlight capture patterns consumed by editors (Zed, Neovim, Helix, …).

## Build

```sh
npm install
npm run build      # regenerate src/parser.c from grammar.js
npm test           # run corpus tests
```

To build the WASM module for the web/Zed (requires emcc, Docker, or Podman):

```sh
npx tree-sitter build --wasm
```

## Status

Matches all language features from `src/lexer.c` + `src/parser.c` in the upstream Varian repo as of v0.1.0:

- Primitives: `bool int float string byte void` plus FFI (`ptr c_int c_double c_float c_char`)
- Declarations: `let const mut fn struct enum actor trait impl type use test`
- Decorators: `@name(args)` plus `@ffi("lib", "sym")`
- Generics: `<T, U>` on fn, struct, enum
- Expressions: all binary operators with correct Pratt precedence; `?` propagate; `?.` optional chain; `??` nil coalesce; `..` range; `<-` channel send/receive; lambdas `|a, b| expr`; anonymous `fn` blocks
- Strings: plain, single-quote, interpolated `{expr}`, byte slice `b"..."`, regex `/pat/flags`
- Errors: `?` propagate, `try { } catch (e) { }`, `throw(expr)`, `assert expr`
