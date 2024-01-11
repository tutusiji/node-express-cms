module.exports = {
  apps: [
    {
      name: 'ssr-app',
      script: 'server-ssr.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
