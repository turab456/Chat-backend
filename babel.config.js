// babel.config.js
export default {
    presets: [
      ['@babel/preset-env', { targets: { node: '14' } }], // Adjust the version to your Node.js version
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  };
  