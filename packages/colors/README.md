# @tailwindcss-more/colors

A PostCSS plugin for TailwindCSS v4 that adds a few new color utilities.

## Installation

Install both `tailwindcss` and `postcss`

```sh
npm install tailwindcss @tailwindcss/postcss postcss
```

```sh
npm install @tailwindcss-more/colors
```

Add the plugin to your `postcss` config file before `@tailwindcss/postcss`.

**postcss.config.js**

```js
const config = {
  plugins: ["@tailwindcss-more/colors", "@tailwindcss/postcss"],
};

export default config;
```

## Usage

All of the utilities work for any base Tailwind color utility (e.g. `bg`, `text`, `border`, `fill`, etc.).

### Interpolate Color

`{utility}-{color}-{step}`

Generate an interpolated color for any undefined step.

**Set background color to 75% between bg-red-400 and bg-red-500**

```html
<div class="bg-red-475">...</div>
```

**Set text color to 64% between text-white and text-blue-50**

```html
<p class="text-blue-32">...</p>
```

**Set shadow color to 10% between shadow-pink-950 and shadow-black**

```html
<div class="shadow-pink-955">...</div>
```

Interpolated colors are only generated for colors that have the base 11 steps defined `(50, 100, 200, ... , 800, 900, 950)`. Therefore it is not possible to interpolate `white` or `black`, or any custom colors unless you define the 11 steps for them.

### Lighten Color

`{utility}-light-{color}-{step}`

Generate a lighter version of any color by mixing it with white.

**Set background color to mix of bg-red-500 and bg-white**

```html
<div class="bg-light-red-500">...</div>
```

**Set text color to mix of text-sky-525 and text-white**

```html
<p class="text-light-sky-525">...</p>
```

Lighter colors are only generated for colors that have that step defined (i.e. custom colors must have the step used defined, so `text-light-custom-500` won't work unlesss `--color-custom-500` is defined in your theme variables). Therefore it is not possible to lighten `white` or `black`.

### Darken Color

`{utility}-dark-{color}-{step}`

Generate a darker version of any color by mixing it with black.

**Set background color to mix of bg-red-500 and bg-black**

```html
<div class="bg-dark-red-500">...</div>
```

**Set text color to mix of text-green-460 and text-black**

```html
<p class="text-dark-green-460">...</p>
```

Darker colors are only generated for colors that have that step defined (i.e. custom colors must have the step used defined, so `text-dark-custom-500` won't work unlesss `--color-custom-500` is defined in your theme variables). Therefore it is not possible to darken `white` or `black`.

### Mix Color

`{utility}-{color1}-{color2}-{step}`

Generate a mix of two colors.

**Set background color to mix of bg-red-500 and bg-blue-500**

```html
<div class="bg-red-blue-500">...</div>
```

**Set text color to mix of text-red-450 and text-orange-450**

```html
<p class="text-red-orange-450">...</p>
```

Mixed colors are only generated if `color1` and `color2` both have that step defined (i.e. custom colors must have the step used defined, so `text-custom1-custom2-500` won't work unlesss `--color-custom1-500` and `--color-custom2-500` are defined in your theme variables). Therefore it is not possible to mix with `white` or `black`.
