/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "varian",

  extras: ($) => [$.comment, $.block_comment, /[\s]/],

  conflicts: ($) => [
    [$.call_expression, $.member_expression],
    [$.type_identifier, $.identifier],
    [$.generic_parameters, $.binary_expression],
    [$.anonymous_function, $.call_expression],
    [$.return_statement],
    [$.break_statement],
    [$.continue_statement],
    [$.statement, $._expression],
    [$.expression_statement, $.binary_expression],
    [$.return_statement, $.binary_expression],
    [$.break_statement, $.binary_expression],
    [$.continue_statement, $.binary_expression],
    [$.comptime_block, $._expression],
    [$.if_expression, $._expression],
    [$.while_statement, $._expression],
    [$.for_statement, $._expression],
    [$.loop_statement, $._expression],
    [$.match_expression, $._expression],
    [$.try_expression, $._expression],
    [$.block, $._expression],
    [$.comptime_block, $.binary_expression],
    [$.if_expression, $.binary_expression],
    [$.while_statement, $.binary_expression],
    [$.for_statement, $.binary_expression],
    [$.loop_statement, $.binary_expression],
    [$.match_expression, $.binary_expression],
    [$.try_expression, $.binary_expression],
    [$.block, $.binary_expression],
    [$.string, $.interpolated_string],
    [$.regex_literal],
    [$.assignment_statement, $.binary_expression],
    [$.enum_literal],
    [$.lambda_expression, $._expression],
    [$.lambda_expression, $.binary_expression],
    [$.let_declaration, $.binary_expression],
    [$.const_declaration, $.binary_expression],
    [$.mut_declaration, $.binary_expression],
  ],

  word: ($) => $.identifier,

  rules: {
    // ───────────────────────────────────────────────
    source_file: ($) => repeat($._declaration),

    // ─── Comments ──────────────────────────────────
    comment: ($) => token(seq("//", /[^\n]*/)),
    block_comment: ($) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    // ─── Identifiers ───────────────────────────────
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    type_identifier: ($) => /[A-Z][a-zA-Z0-9_]*/,

    // ───────────────────────────────────────────────
    // Top-level declarations
    // ───────────────────────────────────────────────
    _declaration: ($) =>
      choice(
        $.use_statement,
        $.function_definition,
        $.struct_definition,
        $.enum_definition,
        $.actor_definition,
        $.trait_definition,
        $.impl_block,
        $.type_alias,
        $.test_definition,
        $.ffi_declaration,
        $.statement,
      ),

    statement: ($) =>
      choice(
        $.let_declaration,
        $.const_declaration,
        $.mut_declaration,
        $.assignment_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.expression_statement,
        $.if_expression,
        $.while_statement,
        $.for_statement,
        $.loop_statement,
        $.match_expression,
        $.try_expression,
        $.throw_statement,
        $.block,
        $.assert_statement,
        $.comptime_block,
      ),

    expression_statement: ($) => seq($._expression, optional(";")),

    block: ($) => seq("{", repeat($.statement), "}"),

    // ─── Let/Const/Mut ────────────────────────────
    let_declaration: ($) =>
      seq(
        "let",
        field("name", choice($.identifier, "_")),
        optional(seq(":", $._type)),
        optional(seq("=", $._expression)),
        optional(";"),
      ),

    const_declaration: ($) =>
      seq(
        "const",
        field("name", $.identifier),
        optional(seq(":", $._type)),
        "=",
        $._expression,
        optional(";"),
      ),

    mut_declaration: ($) =>
      seq(
        "mut",
        field("name", $.identifier),
        optional(seq(":", $._type)),
        optional(seq("=", $._expression)),
        optional(";"),
      ),

    assignment_statement: ($) =>
      seq(
        choice($.identifier, $.member_expression, $.index_expression),
        choice("=", "+=", "-=", "*=", "/="),
        $._expression,
        optional(";"),
      ),

    // ─── Return / Break / Continue ───────────────
    return_statement: ($) =>
      seq("return", optional($._expression), optional(";")),

    break_statement: ($) =>
      seq("break", optional($._expression), optional(";")),
    continue_statement: ($) => seq("continue", optional(";")),

    // ─── Control flow ────────────────────────────
    if_expression: ($) =>
      prec.right(
        seq(
          "if",
          $._expression,
          choice($.block, seq(";")),
          optional(
            prec.right(
              seq("else", choice($.if_expression, choice($.block, seq(";")))),
            ),
          ),
        ),
      ),

    while_statement: ($) => seq("while", $._expression, $.block),
    for_statement: ($) =>
      seq("for", $.identifier, "in", $._expression, $.block),
    loop_statement: ($) => seq("loop", $.block),

    match_expression: ($) =>
      seq("match", $._expression, "{", repeat($.match_arm), "}"),

    match_arm: ($) =>
      seq(choice($._expression, "case"), "=>", $._expression, optional(",")),

    try_expression: ($) =>
      seq(
        "try",
        $.block,
        optional(seq("catch", optional($.identifier), $.block)),
      ),

    throw_statement: ($) =>
      seq("throw", "(", $._expression, ")", optional(";")),

    assert_statement: ($) =>
      prec(1, seq("assert", $._expression, optional(";"))),
    comptime_block: ($) => seq("comptime", choice($.block, $._expression)),

    // ─── Use ─────────────────────────────────────
    use_statement: ($) => seq("use", $.string, optional(";")),

    // ─── Test ────────────────────────────────────
    test_definition: ($) => seq("test", $.string, $.block),

    // ───────────────────────────────────────────────
    // Function definition
    // ───────────────────────────────────────────────
    function_definition: ($) =>
      seq(
        repeat($.decorator),
        optional("pub"),
        optional("async"),
        "fn",
        field("name", $.identifier),
        optional($.generic_parameters),
        "(",
        commaSep($.parameter),
        ")",
        optional(seq("->", $._type, repeat(seq(",", $._type)))),
        choice($.block, seq("=>", $._expression)),
      ),

    anonymous_function: ($) =>
      seq(
        optional("async"),
        "fn",
        optional($.generic_parameters),
        "(",
        commaSep($.parameter),
        ")",
        optional(seq("->", $._type)),
        $.block,
      ),

    parameter: ($) =>
      seq(field("name", $.identifier), optional(seq(":", $._type))),

    generic_parameters: ($) => seq("<", commaSep1($.type_identifier), ">"),

    // ───────────────────────────────────────────────
    // Struct definition
    // ───────────────────────────────────────────────
    struct_definition: ($) =>
      seq(
        repeat($.decorator),
        optional("pub"),
        "struct",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        "{",
        commaSep($.struct_field),
        "}",
      ),

    struct_field: ($) =>
      seq(
        repeat($.field_decorator),
        field("name", $.identifier),
        optional(seq(":", $._type)),
        optional(seq("=", $._expression)),
      ),

    field_decorator: ($) =>
      seq("@", $.identifier, optional(seq("(", $._expression, ")"))),

    // ───────────────────────────────────────────────
    // Enum definition
    // ───────────────────────────────────────────────
    enum_definition: ($) =>
      seq(
        "enum",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        "{",
        commaSep($.enum_variant),
        "}",
      ),

    enum_variant: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("(", commaSep1($._type), ")")),
      ),

    // ───────────────────────────────────────────────
    // Actor definition
    // ───────────────────────────────────────────────
    actor_definition: ($) =>
      seq(
        "actor",
        field("name", $.identifier),
        "{",
        repeat(
          choice(
            seq(
              $.identifier,
              optional(seq(":", $._type)),
              optional(seq("=", $._expression)),
              optional(","),
            ),
            $.function_definition,
          ),
        ),
        "}",
      ),

    // ───────────────────────────────────────────────
    // Trait definition
    // ───────────────────────────────────────────────
    trait_definition: ($) =>
      seq(
        "trait",
        field("name", $.type_identifier),
        "{",
        repeat(
          seq(
            optional("pub"),
            "fn",
            $.identifier,
            "(",
            commaSep($.parameter),
            ")",
            optional(seq("->", $._type)),
            optional(";"),
          ),
        ),
        "}",
      ),

    // ───────────────────────────────────────────────
    // Impl block
    // ───────────────────────────────────────────────
    impl_block: ($) =>
      seq(
        "impl",
        field("type", $._type),
        "{",
        repeat(
          seq(
            optional("pub"),
            "fn",
            $.identifier,
            "(",
            commaSep($.parameter),
            ")",
            optional(seq("->", $._type)),
            choice($.block, seq("=>", $._expression)),
          ),
        ),
        "}",
      ),

    // ───────────────────────────────────────────────
    // Type alias
    // ───────────────────────────────────────────────
    type_alias: ($) =>
      seq("type", $.identifier, optional(seq("=", $._type)), optional(";")),

    // ───────────────────────────────────────────────
    // FFI declaration
    // ───────────────────────────────────────────────
    ffi_declaration: ($) =>
      seq(
        "@",
        "ffi",
        "(",
        $.string,
        ",",
        $.string,
        ")",
        "fn",
        $.identifier,
        "(",
        commaSep($.parameter),
        ")",
        optional(seq("->", $._type)),
        optional(";"),
      ),

    // ─── Decorator ───────────────────────────────
    decorator: ($) =>
      seq("@", $.identifier, optional(seq("(", $._expression, ")"))),

    // ───────────────────────────────────────────────
    // Types
    // ───────────────────────────────────────────────
    _type: ($) =>
      choice(
        $.primitive_type,
        $.type_identifier,
        $.generic_type,
        $.array_type,
        $.function_type,
        $.tuple_type,
      ),

    primitive_type: ($) =>
      choice(
        "bool",
        "int",
        "float",
        "string",
        "byte",
        "void",
        "ptr",
        "c_int",
        "c_double",
        "c_float",
        "c_char",
      ),

    generic_type: ($) => seq($.type_identifier, "<", commaSep1($._type), ">"),

    array_type: ($) =>
      seq("[", $._type, optional(seq(";", $._expression)), "]"),

    function_type: ($) =>
      seq("fn", "(", commaSep($._type), ")", optional(seq("->", $._type))),

    tuple_type: ($) => seq("(", commaSep1($._type), ")"),

    // ───────────────────────────────────────────────
    // Expressions
    // ───────────────────────────────────────────────
    _expression: ($) =>
      choice(
        $.identifier,
        $.number,
        $.string,
        $.single_quote_string,
        $.interpolated_string,
        $.byte_slice,
        $.regex_literal,
        $.boolean,
        $.null,
        $.array_literal,
        $.struct_literal,
        $.enum_literal,
        $.lambda_expression,
        $.anonymous_function,
        $.unary_expression,
        $.await_expression,
        $.propagate_expression,
        $.optional_chain,
        $.nil_coalescing_expression,
        $.binary_expression,
        $.channel_send,
        $.range_expression,
        $.channel_receive,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.if_expression,
        $.match_expression,
        $.try_expression,
        $.block,
        $.paren_expression,
      ),

    paren_expression: ($) => seq("(", $._expression, ")"),

    // ─── Literals ───────────────────────────────
    string: ($) =>
      seq(
        '"',
        repeat(choice(token.immediate(prec(1, /[^"\\\{\n]+/)), /\\(.|\n)/)),
        '"',
      ),

    single_quote_string: ($) =>
      seq(
        "'",
        repeat(choice(token.immediate(prec(1, /[^'\\\n]+/)), /\\(.|\n)/)),
        "'",
      ),

    interpolated_string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            token.immediate(prec(1, /[^"\\\{\n]+/)),
            /\\(.|\n)/,
            seq("{", $._expression, "}"),
          ),
        ),
        '"',
      ),

    byte_slice: ($) => token(seq('b"', /[^"\\\n]*/, '"')),

    regex_literal: ($) =>
      seq(
        "/",
        token.immediate(/[^\/\\\n]*/),
        optional("/"),
        optional(/[a-z]*/),
      ),

    number: ($) =>
      token(
        choice(
          /0[xX][0-9a-fA-F]+/,
          /0[bB][01]+/,
          /0[oO][0-7]+/,
          /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/,
          /[0-9]+/,
        ),
      ),

    boolean: ($) => choice("true", "false"),
    null: ($) => "null",

    array_literal: ($) => seq("[", commaSep($._expression), "]"),

    struct_literal: ($) =>
      seq(
        field("type", $.type_identifier),
        "{",
        commaSep(seq($.identifier, ":", $._expression)),
        optional(","),
        "}",
      ),

    enum_literal: ($) =>
      seq(
        field("type", $.type_identifier),
        "::",
        field("variant", $.identifier),
        optional(seq("(", commaSep($._expression), ")")),
      ),

    // ─── Lambda ─────────────────────────────────
    lambda_expression: ($) =>
      seq("|", commaSep($.identifier), "|", choice($._expression, $.block)),

    // ─── Channel receive ────────────────────────
    channel_receive: ($) => prec(-1, seq("<-", $._expression)),

    // ─── Ranges ────────────────────────────────
    range_expression: ($) =>
      prec.left(-2, seq($._expression, "..", $._expression)),

    // ─── Unary ─────────────────────────────────
    unary_expression: ($) =>
      prec(11, seq(choice("!", "not", "-", "~"), $._expression)),

    // ─── Await (prefix) ────────────────────────
    await_expression: ($) => prec.right(11, seq("await", $._expression)),

    // ─── Propagate (postfix ?) ─────────────────
    propagate_expression: ($) => prec(12, seq($._expression, "?")),

    // ─── Optional chain ────────────────────────
    optional_chain: ($) => prec(13, seq($._expression, "?.", $.identifier)),

    // ─── Nil coalescing ────────────────────────
    nil_coalescing_expression: ($) =>
      prec.left(1, seq($._expression, "??", $._expression)),

    // ───────────────────────────────────────────────
    // Binary expressions (by precedence)
    // ───────────────────────────────────────────────
    binary_expression: ($) =>
      choice(
        // Logical or
        prec.left(2, seq($._expression, choice("or", "||"), $._expression)),
        // Logical and
        prec.left(3, seq($._expression, choice("and", "&&"), $._expression)),
        // Equality
        prec.left(4, seq($._expression, choice("==", "!="), $._expression)),
        // Comparison
        prec.left(
          5,
          seq($._expression, choice("<", ">", "<=", ">="), $._expression),
        ),
        // Bitwise or
        prec.left(6, seq($._expression, "|", $._expression)),
        // Bitwise xor
        prec.left(7, seq($._expression, "^", $._expression)),
        // Bitwise and
        prec.left(8, seq($._expression, "&", $._expression)),
        // Term (add/sub)
        prec.left(9, seq($._expression, choice("+", "-"), $._expression)),
        // Factor (mul/div/mod)
        prec.left(10, seq($._expression, choice("*", "/", "%"), $._expression)),
      ),

    channel_send: ($) =>
      prec.right(20, seq($._expression, "<-", $._expression)),

    // ───────────────────────────────────────────────
    // Call / Member / Index
    // ───────────────────────────────────────────────
    call_expression: ($) =>
      prec(
        14,
        seq(
          field(
            "function",
            choice(
              $.identifier,
              $.member_expression,
              $.enum_literal,
              $.index_expression,
              $.call_expression,
              $.paren_expression,
            ),
          ),
          "(",
          commaSep(choice($._expression, $.named_argument)),
          ")",
        ),
      ),

    named_argument: ($) => seq($.identifier, ":", $._expression),

    member_expression: ($) =>
      prec(
        15,
        seq(
          choice(
            $.identifier,
            $.member_expression,
            $.call_expression,
            $.paren_expression,
          ),
          ".",
          field("property", $.identifier),
        ),
      ),

    index_expression: ($) =>
      prec(
        14,
        seq(
          choice($.identifier, $.member_expression, $.paren_expression),
          "[",
          $._expression,
          "]",
        ),
      ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
