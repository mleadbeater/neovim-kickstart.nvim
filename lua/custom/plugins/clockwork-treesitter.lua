return {
  {
    'nvim-treesitter/nvim-treesitter',
    init = function()
      local parser_path = vim.fn.stdpath 'data' .. '/site/parser/clockwork.so'
      local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
      parser_config.clockwork = {
        install_info = {
          -- Use a prebuilt local parser binary at parser_path.
          -- Rebuild it from your grammar repo when needed.
          url = '',
          files = {},
          location = parser_path,
        },
        filetype = 'clockwork',
      }

      vim.filetype.add {
        extension = {
          cw = 'clockwork',
          lpc = 'clockwork',
        },
      }
    end,
    opts = function(_, opts)
      -- Do not let nvim-treesitter try to download/build clockwork.
      opts.ignore_install = opts.ignore_install or {}
      if not vim.tbl_contains(opts.ignore_install, 'clockwork') then
        table.insert(opts.ignore_install, 'clockwork')
      end

      -- In case another config added it, remove it from ensure_installed.
      if type(opts.ensure_installed) == 'table' then
        local filtered = {}
        for _, lang in ipairs(opts.ensure_installed) do
          if lang ~= 'clockwork' then
            table.insert(filtered, lang)
          end
        end
        opts.ensure_installed = filtered
      end
    end,
  },
}
