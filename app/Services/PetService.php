<?php

namespace App\Services;

use App\Models\Pet;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class PetService
{
    public function create(array $data): Pet
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $upload = Cloudinary::upload($data['photo']->getRealPath());
            $data['photo'] = $upload->getSecurePath();
        }

        return Pet::create($data);
    }

    public function update(Pet $pet, array $data): Pet
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            // remover foto antiga
            $publicId = $pet->getCloudinaryPublicId();
            Cloudinary::destroy($publicId);

            $upload = Cloudinary::upload($data['photo']->getRealPath());
            $data['photo'] = $upload->getSecurePath();
        }

        $pet->update($data);
        return $pet->fresh();
    }
}
