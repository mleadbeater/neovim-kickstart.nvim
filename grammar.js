// grammar.js — Tree-sitter starter grammar for Clockwork
// Focus: lexing + basic blocks/statements + keyword set for highlighting.

function ci(word) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(word.split('').map(ch =>
      /[a-zA-Z]/.test(ch) ? `[${ch.toLowerCase()}${ch.toUpperCase()}]` : esc(ch)
  ).join(''));
}

const KEYWORDS = [
  // Core language / declarations
  'MODULES', 'MODULE', 'DEFAULTS', 'DEFAULT',
  'MACHINE', 'MACHINES', 'STATEMACHINE',
  'STATE', 'STATES', 'INITIAL', 'INITSTATE',
  'INTERFACE', 'EXTENDS', 'CHANNEL', 'ROUTE',
  'COMMAND', 'COMMANDS', 'RECEIVE', 'RECEIVES', 'SEND', 'SENDS',
  'ENTER', 'LEAVE', 'DURING', 'WHEN', 'WITHIN', 'FROM', 'TO', 'ON', 'USING',

  // Property / export / options
  'GLOBAL', 'LOCAL', 'OPTION', 'GROUP',
  'EXPORT', 'EXPORTS', 'READONLY', 'READWRITE', 'RO', 'RW',
  'WORD', 'DOUBLEWORD', 'STRING', 'FLOAT32',
  'PROPERTIES', 'PROPERTY', 'ENTRIES', 'IDENTIFIER',

  // Control flow / logic
  'IF', 'ELSE', 'AND', 'OR', 'NOT', 'IS', 'ANY', 'ALL', 'ARE', 'WHERE',
  'MATCHES', 'MATCHING', 'BETWEEN', 'INCLUDES', 'EXISTS',
  'REQUIRES', 'IGNORE', 'IGNORES', 'ERROR', 'ERRORS', 'TIMEOUT', 'FAILURE',

  // Actions and state transitions
  'SET', 'ASSIGN', 'BECOMES', 'ADD', 'REPLACE', 'EXTRACT', 'COPY', 'MOVE',
  'INC', 'DEC', 'WAIT', 'WAITFOR', 'LOCK', 'UNLOCK', 'ENABLE', 'DISABLE',
  'RESUME', 'SHUTDOWN', 'ABORT', 'RETURN', 'THROW', 'CATCH', 'RESET', 'LOAD',
  'INCLUDE', 'PUSH', 'SORT', 'CLEAR', 'CREATE', 'SELECT', 'TAKE',
  'TRANSITION', 'TAG',

  // Types / casts / list/value helpers
  'AS', 'INTEGER', 'FLOAT', 'JSON', 'JSON_VALUE',
  'ABS', 'MIN', 'MAX', 'MEAN', 'SUM', 'SIZE', 'LENGTH', 'COUNT',
  'BITSET', 'OF', 'INDEX', 'FIRST', 'LAST', 'ITEM', 'ITEMS',
  'SERIALISE', 'SERIALIZE', 'DESERIALISE', 'SEPARATED', 'FORMAT',

  // Device/channel related
  'KEY', 'VERSION', 'SHARES', 'MONITORS', 'UPDATES', 'REPORTS',
  'STATE_CHANGES', 'PROPERTY_CHANGES',
  'MODBUS', 'SDO', 'LINKED', 'CLASS', 'NAME', 'PUBLISHER', 'THROTTLE',
  'REFERS', 'FIND', 'SEEK',
  'CPU', 'BOARD', 'DIGITALIN', 'DIGITALIO', 'ADC', 'TOUCH', 'PIN', 'ETHERNET', 'DAC', 'SPI', 'SDIO', 'JTAG', 'UART',

  // Misc tokens from legacy lexer/parser
  'BEFORE', 'AFTER', 'ASC', 'ASCENDING', 'DESC', 'DESCENDING',
  'COMMON', 'DIFFERENCE', 'COMBINATION', 'WITH', 'AT', 'BY', 'IN',
  'PLUGIN', 'CONSTRAINT', 'CHANGING',
];

module.exports = grammar({
  name: 'clockwork',

  extras: $ => [
    /\s+/,
    $.comment,        // # until EOL, /* ... */ blocks
    $.plugin_block,   // %BEGIN_PLUGIN ... %END_PLUGIN (treated as comment)
    /'/,              // lexer ignores single quote characters
  ],

  word: $ => $.symbol,

  conflicts: $ => [
    [ $.block_stmt, $._atom_no_semicolon ],
  ],

  rules: {
    // The legacy grammar allows the final statement in a block to omit ';'.
    source_file: $ => seq(repeat($._item), optional($.unterminated_stmt)),

    _item: $ => choice(
      $.block_stmt,
      $.simple_stmt
    ),

    // -------- Structure ------------------------------------------------------

    block_stmt: $ => prec(1, seq(
      // any header like "COMMAND FOO", "SYMBOL STATEMACHINE (..)" etc.
      repeat1($._atom_no_lbrace),
      $.block
    )),

    simple_stmt: $ => seq(
      // generic directive/end-with-semicolon line
      repeat1($._atom_no_semicolon),
      ';'
    ),

    unterminated_stmt: $ => repeat1($._atom_no_semicolon),

    block: $ => seq('{', repeat($._item), optional($.unterminated_stmt), '}'),

    // “Atoms” are the tokens we allow to build generic statements.
    _atom_no_lbrace: $ => choice(
      $.keyword,
      $.symbol,
      $.string,
      $.number,
      $.pattern,
      $.json_expr,
      $.paren_group,
//      $.json_expr,
//      $.json_hint,
      '[',
      ']',
      ',',
      ':',
      ':=',
      '=',
      '==',
      '!=',
      '>=',
      '<=',
      '<',
      '>',
      '&&',
      '||',
      '+',
      '-',
      '*',
      '/',
      '%',
      '&',
      '|',
      '^',
      '!',
      '~',
      '<<',
      '.'
    ),

    _atom_no_semicolon: $ => choice(
      $._atom_no_lbrace
    ),

    paren_group: $ => seq(
      '(',
      repeat($._atom_no_semicolon),
      ')'
    ),

    // -------- Tokens ---------------------------------------------------------

    // Identifiers in the Flex file are SYMBOL: [A-Za-z][A-Za-z0-9_.]*
    symbol: _ => token(/[A-Za-z][A-Za-z0-9_.]*/),

    // Numbers: hex, int, float with optional exponent (mirrors cwlang.lpp)
    number: _ => token(choice(
      /0x[0-9a-fA-F][0-9a-fA-F]*/,
      /-?[0-9][0-9]*/,
      /-?(?:[0-9]+)?\.[0-9]*(?:[eE]-?[0-9]{1,3})?/
    )),

    // Strings: double-quoted with escapes (incl. octal \000)
    string: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\\n]/,
        /\\[nrtt"\\]/,
        /\\[0-3][0-7][0-7]/
      )),
      '"'
    )),

    // Backtick patterns: `...` with escapes (includes \` and octal)
    pattern: _ => token(seq(
      '`',
      repeat(choice(
        /[^`\\]/,
        /\\./,
        /\\[0-3][0-7][0-7]/
      )),
      '`'
    )),

    // ${ ... } captured as one token for now (used in actions / JSON subexpr)
    json_expr: _ => token(seq(
      '${',
      /[^}]*/,
      '}'
    )),

    // The lexer has a special JSON_VALUE handling; as a starter, recognize the hint
    // token 'JSON' (casts) as a keyword and allow raw { ... } snippets to appear.
    // You can later replace this with a proper balanced JSON tokenizer if needed.
//    json_hint: $ => alias('JSON', $.keyword),

    // Comments:
    //  - Hash comments: # to EOL
    //  - C-style block comments: /* ... */
    comment: _ => token(choice(
      seq('#', /[^\n]*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),

    // Treat plugin region as a comment-like block so it doesn’t confuse parsing
    plugin_block: _ => token(seq(
      '%BEGIN_PLUGIN',
      repeat(/[^%]/),
      '%END_PLUGIN'
    )),

    // -------- Keywords -------------------------------------------------------
    // Keep lexer keywords case-insensitive to be tolerant of style differences.
    keyword: _ => token(choice(...KEYWORDS.map(ci))),
  }
});
