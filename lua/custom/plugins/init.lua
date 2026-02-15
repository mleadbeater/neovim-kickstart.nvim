-- You can add your own plugins here or in other files in this directory!
--  I promise not to create any merge conflicts in this directory :)
--
-- See the kickstart.nvim README for more information
return {
  {
    'nvim-treesitter/nvim-treesitter',
    init = function()
      local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
      parser_config.clockwork = {
        install_info = {
          url = '/Users/martin/.config/nvim/tree-sitter-clockwork',
          files = { 'src/parser.c' },
          requires_generate_from_grammar = false,
        },
        filetype = 'clockwork',
      }

      vim.filetype.add {
        extension = {
          cw = 'clockwork',
          lpc = 'clockwork',
        },
      }
      local function set_clockwork_error_hl()
        vim.api.nvim_set_hl(0, "@error", { fg = "#ff5f5f", undercurl = true, sp = "#ff5f5f" })
        vim.api.nvim_set_hl(0, "@error.clockwork", { link = "@error" })
      end
      
      vim.api.nvim_create_autocmd("ColorScheme", {
        pattern = "*",
        callback = set_clockwork_error_hl,
      })
      
      set_clockwork_error_hl() -- apply immediately on startup

    end,
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      table.insert(opts.ensure_installed, 'clockwork')
    end,
  },
}
