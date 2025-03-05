import fs from "fs/promises";
import { globby } from "globby";
import { AtRule, Declaration, Root, Result } from "postcss";

const colorValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const cache = {};

function getColorValue(color: string, intensity: number) {
  if (intensity < 50) {
    return `color-mix(in oklab, var(--color-${color}-50) ${
      intensity * 2
    }%, var(--color-white))`;
  } else if (intensity < 100) {
    return `color-mix(in oklab, var(--color-${color}-50) ${intensity}%, var(--color-${color}-100))`;
  } else if (intensity < 200) {
    return `color-mix(in oklab, var(--color-${color}-100) ${
      intensity - 100
    }%, var(--color-${color}-200))`;
  } else if (intensity < 300) {
    return `color-mix(in oklab, var(--color-${color}-200) ${
      intensity - 200
    }%, var(--color-${color}-300))`;
  } else if (intensity < 400) {
    return `color-mix(in oklab, var(--color-${color}-300) ${
      intensity - 300
    }%, var(--color-${color}-400))`;
  } else if (intensity < 500) {
    return `color-mix(in oklab, var(--color-${color}-400) ${
      intensity - 400
    }%, var(--color-${color}-500))`;
  } else if (intensity < 600) {
    return `color-mix(in oklab, var(--color-${color}-500) ${
      intensity - 500
    }%, var(--color-${color}-600))`;
  } else if (intensity < 700) {
    return `color-mix(in oklab, var(--color-${color}-600) ${
      intensity - 600
    }%, var(--color-${color}-700))`;
  } else if (intensity < 800) {
    return `color-mix(in oklab, var(--color-${color}-700) ${
      intensity - 700
    }%, var(--color-${color}-800))`;
  } else if (intensity < 900) {
    return `color-mix(in oklab, var(--color-${color}-800) ${
      intensity - 800
    }%, var(--color-${color}-900))`;
  } else if (intensity < 950) {
    return `color-mix(in oklab, var(--color-${color}-900) ${
      (intensity - 900) * 2
    }%, var(--color-${color}-950))`;
  } else {
    return `color-mix(in oklab, var(--color-${color}-950), var(--color-black) ${
      (intensity - 950) * 2
    }%)`;
  }
}

function plugin(opts = {}) {
  const colorRegex =
    "(?:bg|text|decoration|border|outline|shadow|inset-shadow|ring|inset-ring|accent|caret|fill|stroke)";

  const tokens = {
    mix: new RegExp(`${colorRegex}-([a-zA-Z]+)-([a-zA-Z]+)-(\\d+)`, "g"),
    light: new RegExp(`${colorRegex}-light-([a-zA-Z]+)-(\\d+)`, "g"),
    dark: new RegExp(`${colorRegex}-dark-([a-zA-Z]+)-(\\d+)`, "g"),
    color: new RegExp(`${colorRegex}-([a-zA-Z]+)-(\\d+)`, "g"),
  };

  const mixIgnoreWords = ["light", "dark"];

  return {
    postcssPlugin: "@tailwindcss-more/colors",

    async Once(root: Root, { result }: { result: Result }) {
      const paths = await globby(
        ["**.ts", "**.tsx", "**.js", "**.jsx", "**.html"],
        {
          gitignore: true,
        }
      );

      for (let path of paths) {
        result.messages.push({
          type: "dependency",
          plugin: "@tailwindcss-more/colors",
          file: path,
          parent: result.opts.from,
        });
      }

      const themeVariables = {};

      function addColorVariable(color: string, intensity: number) {
        const base = `--color-${color}-${intensity}`;
        if (
          themeVariables[base] === undefined &&
          !colorValues.includes(intensity)
        ) {
          themeVariables[base] = getColorValue(color, intensity);
        }
      }

      const parsedTokens = new Set<string>();

      const promises: Promise<void>[] = [];

      for (let path of paths) {
        const promise = fs.stat(path).then(async (stats) => {
          if (cache[path] === stats.mtimeMs) {
            return;
          }

          await fs.readFile(path).then((data) => {
            for (let token in tokens) {
              for (let match of data.toString().matchAll(tokens[token])) {
                if (parsedTokens.has(match[0])) {
                  continue;
                }

                let anyMatches = true;

                if (token === "light") {
                  themeVariables[
                    `--color-light-${match[1]}-${match[2]}`
                  ] = `color-mix(in oklab, var(--color-${match[1]}-${match[2]}) 50%, var(--color-white))`;
                  addColorVariable(match[1], Number(match[2]));
                } else if (token === "dark") {
                  themeVariables[
                    `--color-dark-${match[1]}-${match[2]}`
                  ] = `color-mix(in oklab, var(--color-${match[1]}-${match[2]}) 50%, var(--color-black))`;

                  addColorVariable(match[1], Number(match[2]));
                } else if (
                  token === "mix" &&
                  !mixIgnoreWords.includes(match[1]) &&
                  !mixIgnoreWords.includes(match[2])
                ) {
                  themeVariables[
                    `--color-${match[1]}-${match[2]}-${match[3]}`
                  ] = `color-mix(in oklab, var(--color-${match[1]}-${match[3]}) 50%, var(--color-${match[2]}-${match[3]}))`;

                  addColorVariable(match[1], Number(match[3]));
                  addColorVariable(match[2], Number(match[3]));
                } else if (token === "color") {
                  addColorVariable(match[1], Number(match[2]));
                } else {
                  anyMatches = false;
                }

                if (anyMatches) {
                  parsedTokens.add(match[0]);
                }
              }
            }

            cache[path] = stats.mtimeMs;
          });
        });

        promises.push(promise);
      }

      if (promises.length === 0) {
        return;
      }

      await Promise.all(promises);

      const theme = new AtRule({ name: "theme", params: "inline" });
      theme.nodes = [];

      for (let variable in themeVariables) {
        theme.push(
          new Declaration({ prop: variable, value: themeVariables[variable] })
        );
      }

      root.prepend(theme);
    },
  };
}

export default plugin;
export const postcss = true;
