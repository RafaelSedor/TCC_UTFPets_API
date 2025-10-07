<?php
    $defaultFormatMethod = 'scale';
    $retrieveFormattedVideo = cloudinary()->getVideoTag($publicId ?? '')
                                    ->setAttributes(['controls', 'loop', 'preload'])
                                    ->fallback('Your browser does not support HTML5 video tagsssss.')
                                    ->$defaultFormatMethod($width ?? '', $height ?? '');
?>
<?php /**PATH /var/www/vendor/cloudinary-labs/cloudinary-laravel/resources/views/components/video.blade.php ENDPATH**/ ?>