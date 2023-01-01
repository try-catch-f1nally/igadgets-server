module.exports = {
  './src/**/*.ts': 'npm run lint',
  '*': ['npm run lint:ec', 'npm run format']
};
