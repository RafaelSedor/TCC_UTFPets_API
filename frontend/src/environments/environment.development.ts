export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  apiPublicUrl: 'http://localhost:8080',
  appName: 'UTFPets',
  appVersion: '1.0.0',
  vapidPublicKey: 'your_vapid_public_key_here',
  cloudinary: {
    cloudName: 'your_cloud_name',
    uploadPreset: 'your_upload_preset'
  },
  features: {
    enablePWA: true,
    enableNotifications: true
  }
};