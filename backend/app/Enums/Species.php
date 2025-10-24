<?php

namespace App\Enums;

enum Species: string
{
    case Dog = 'Cachorro';
    case Cat = 'Gato';
    case Bird = 'Pássaro';
    case Fish = 'Peixe';
    case Reptile = 'Réptil';
    case Rodent = 'Roedor';
    case Other = 'Outro';
}