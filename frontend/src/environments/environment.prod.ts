// Environment de PRODUÇÃO
// Usado quando executar: ng build --configuration production

export const environment = {
  production: true,
  apiUrl: 'https://api.utfpets.online/api/v1',  // URL completa em produção
  apiPublicUrl: 'https://api.utfpets.online/api/v1',
  appName: 'UTFPets',
  appVersion: '1.0.0',
  vapidPublicKey: 'BPXuOil4km670_Bntd2GdUN80YRBcUzcNXyRRxs3xX_DtLgFE1SS1OYLQ1QI6XKd9zJPnlSxA-Rt4r8eL94WwlNt0',
  enablePwa: true,  // Habilitar PWA em produção
  enableNotifications: true  // Habilitar notificações em produção
};
