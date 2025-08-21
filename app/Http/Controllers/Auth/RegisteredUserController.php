<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:2048',
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $avatarName = null;

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');

            // Create avatars directory if not exists
            $avatarDir = public_path('avatars');
            if (!File::exists($avatarDir)) {
                File::makeDirectory($avatarDir, 0755, true);
            }

            // Generate unique file name
            $avatarName = Str::uuid() . '.' . $avatar->getClientOriginalExtension();

            // Move to public/avatars
            $avatar->move($avatarDir, $avatarName);
        }

        $user = User::create([
            'avatar_path' => $avatarName,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
