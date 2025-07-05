const { contextBridge } = require('electron');

// Parse the backendBaseUrl from command line args
function getBackendBaseUrl() {
  const arg = process.argv.find(a => a.startsWith('--backendBaseUrl='));
  return arg ? arg.replace('--backendBaseUrl=', '') : 'http://localhost:3001/api';
}

contextBridge.exposeInMainWorld('api', {
  getBackendBaseUrl,
});
