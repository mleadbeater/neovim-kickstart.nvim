const assert = require("node:assert");
const { test } = require("node:test");

const Parser = require("tree-sitter");

test("can load grammar", () => {
  const parser = new Parser();
  assert.doesNotThrow(() => parser.setLanguage(require(".")));
});

test("reports syntax errors for malformed input", () => {
  const parser = new Parser();
  parser.setLanguage(require("."));

  const tree = parser.parse("MACHINE Demo { STATE Idle;");
  const root = tree.rootNode;
  const hasError =
    typeof root.hasError === "function" ? root.hasError() : root.hasError;

  assert.equal(Boolean(hasError), true);
});
