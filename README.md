# Phoenix package for VS Code

Syntax highlighting support for Phoenix templates.

## Features

  * Support syntax highlighting for `.heex` files
  * Extends Elixir's syntax highlighting to support HEEx's syntax inside `~H`

## Emmet Support 

To use emmet with `.heex` file extensions and inside `~H` sigils, include the options below in your settings:

```json
"emmet.includeLanguages": {
  "phoenix-heex": "html",
  "elixir": "html"
}
```

## License

Copyright (c) 2021, Marlus Saraiva.

Source code is licensed under the [MIT License](LICENSE).
