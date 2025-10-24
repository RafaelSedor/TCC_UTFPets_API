#!/bin/bash

# Replace environment variables in JavaScript files
for file in /usr/share/nginx/html/main*.js; do
  if [ -f $file ]; then
    # Replace environment variables
    sed -i "s|http://localhost:8080|${API_URL}|g" $file
    sed -i "s|your_vapid_public_key_here|${VAPID_PUBLIC_KEY}|g" $file
    sed -i "s|your_cloud_name|${CLOUDINARY_CLOUD_NAME}|g" $file
    sed -i "s|your_upload_preset|${CLOUDINARY_UPLOAD_PRESET}|g" $file
  fi
done

# Start nginx
exec "$@"