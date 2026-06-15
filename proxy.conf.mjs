export default [
  {
    context: ['/api'],
    target: 'https://talentree-api-d4ahaxdefvarbhah.austriaeast-01.azurewebsites.net',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Connection': 'keep-alive'
    }
  }
];