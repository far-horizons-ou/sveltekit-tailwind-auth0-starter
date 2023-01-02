const path = require('path');
module.exports = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-svelte-csf",
  ],
  "framework": {
    "name": "@storybook/sveltekit",
    "options": {}
  },
  // "features": { "storyStoreV7": false },
  "docs": {
    "autodocs": "tag"
  },
  async viteFinal(config, { configType }) {
    // Remove this and check if the storybook still works (eventually)
    config.resolve.alias = {
      ...config.resolve.alias,
      $lib: path.resolve("./src/lib"),
      $components: path.resolve("./src/components"),
    };
    return config;
  },
}
