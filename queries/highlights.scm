; extends

; Comments and plugin sections
(comment) @comment
(plugin_block) @comment

; Lexical tokens
(keyword) @keyword
(number) @number
(string) @string
(pattern) @string.regexp
(json_expr) @string.special

; Identifiers
((symbol) @constant
  (#match? @constant "^[A-Z_][A-Z0-9_]*$"))
(symbol) @variable

; Punctuation
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," ";" ":" "."] @punctuation.delimiter

; Operators
[
  "=" ":=" "==" "!="
  "<" "<=" ">" ">="
  "+" "-" "*" "/" "%"
  "&&" "||" "!"
  "&" "|" "^" "~" "<<"
] @operator

; Parser recovery nodes
(ERROR) @error
(MISSING) @error
