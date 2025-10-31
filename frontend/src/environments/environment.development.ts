export const environment = {
  production: false,
  apiUrl: '/api/v1',  // Usa proxy do Angular - sem CORS!
  apiPublicUrl: 'http://localhost/api/v1',
  appName: 'UTFPets',
  appVersion: '1.0.0',
  vapidPublicKey: 'BPXuOil4km670_Bntd2GdUN80YRBcUzcNXyRRxs3xX_DtLgFE1SS1OYLQ1QI6XKd9zJPnlSxA-Rt4r8eL94WwlNt0',
  cloudinary: {
    cloudName: 'your_cloud_name',
    uploadPreset: 'your_upload_preset'
  },
  features: {
    enablePWA: true,
    enableNotifications: true
  }
};