<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CalendarController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Calendar not implemented'], 501);
    }

    public function rotateToken(): JsonResponse
    {
        return response()->json(['message' => 'Rotate calendar token not implemented'], 501);
    }

    // Public ICS feed
    public function feed(string $calendarToken): Response
    {
        $ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//UTFPets//EN\r\nCALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n";
        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
        ]);
    }
}

