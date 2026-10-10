package tree_sitter_clockwork_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_clockwork "github.com/mleadbeater/neovim-kickstart.nvim.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_clockwork.Language())
	if language == nil {
		t.Errorf("Error loading Clockwork grammar")
	}
}
