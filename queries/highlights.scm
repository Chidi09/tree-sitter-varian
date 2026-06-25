; Varian tree-sitter highlights
; Used by Zed, Neovim, and other tree-sitter-aware editors

; Keywords
[
  "let" "const" "mut" "fn" "struct" "enum" "actor" "impl" "trait" "type"
  "use" "pub" "test" "comptime" "as" "null" "true" "false"
] @keyword

[
  "return" "if" "else" "while" "for" "in" "loop" "match" "case"
  "break" "continue" "try" "catch" "throw" "assert" "await" "async"
] @keyword.control

["and" "or" "not"] @keyword.operator

; Primitive types
[
  "bool" "int" "float" "string" "byte" "void"
  "ptr" "c_int" "c_double" "c_float" "c_char"
] @type.builtin

; Type identifiers
(type_identifier) @type

; Generic type arguments
(generic_type
  "<" _ ">"
) @punctuation.bracket

; Function definition
(function_definition
  name: (identifier) @function)

(anonymous_function) @function.builtin

; Function calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    property: (identifier) @function.method))

; Method calls via dot
(member_expression
  property: (identifier) @property)

; Variables / parameters
(let_declaration
  name: (identifier) @variable)
(const_declaration
  name: (identifier) @variable)
(mut_declaration
  name: (identifier) @variable)
(parameter
  name: (identifier) @variable.parameter)

; Struct definition
(struct_definition
  name: (type_identifier) @type)

(struct_field
  name: (identifier) @variable.member)

; Enum definition
(enum_definition
  name: (type_identifier) @type)

(enum_variant
  name: (identifier) @constant)

(enum_literal
  name: (type_identifier) @type
  variant: (identifier) @constant)

(struct_literal
  type: (type_identifier) @type)

; Actor
(actor_definition
  name: (identifier) @type)

; Trait
(trait_definition
  name: (type_identifier) @type)

(impl_block
  type: (type_identifier) @type)

; Literals
(number) @number
(boolean) @constant.builtin
(null) @constant.builtin

(string) @string
(single_quote_string) @string
(interpolated_string) @string
(byte_slice) @string
(regex_literal) @string.regex

(escape_sequence) @string.escape

; Comments
(comment) @comment
(block_comment) @comment

; Operators / punctuation
[
  "+" "-" "*" "/" "%" "==" "!=" "<" ">" "<=" ">=" "=" "->" "<-"
  "+=" "-=" "*=" "/=" ".." "&&" "||" "!" "?" "??" "?:"
  "&" "|" "^" "~" "::" ".."
] @operator

["(" ")" "{" "}" "[" "]"] @punctuation.bracket
["," "." ":" ";"] @punctuation.delimiter

; Decorators
(decorator "@" @attribute)

; FFI
(ffi_declaration) @keyword

; Channel ops
(channel_send "<-" @operator)
(channel_receive "<-" @operator)
