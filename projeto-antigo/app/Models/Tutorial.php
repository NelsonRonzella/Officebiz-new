<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{

    protected $fillable = [
        'title',
        'description',
        'link'
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }

    public function getYoutubeThumbnailAttribute()
    {

        $url = $this->link;

        if (!$url) {
            return null;
        }

        preg_match(
            '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/',
            $url,
            $matches
        );

        $videoId = $matches[1] ?? null;

        if (!$videoId) {
            return null;
        }

        return "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
    }

}