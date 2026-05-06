export default [
  {
    context: ['/api'],
    target: 'https://backtalentree.runasp.net',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Connection': 'keep-alive'
    }
  }
];