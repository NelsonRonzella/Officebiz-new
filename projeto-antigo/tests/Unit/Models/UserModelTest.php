<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_admin(): void
    {
        $user = User::factory()->admin()->create();
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isCliente());
        $this->assertFalse($user->isPrestador());
        $this->assertFalse($user->isLicenciado());
    }

    public function test_is_cliente(): void
    {
        $user = User::factory()->cliente()->create();
        $this->assertTrue($user->isCliente());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isPrestador());
        $this->assertFalse($user->isLicenciado());
    }

    public function test_is_prestador(): void
    {
        $user = User::factory()->prestador()->create();
        $this->assertTrue($user->isPrestador());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isCliente());
        $this->assertFalse($user->isLicenciado());
    }

    public function test_is_licenciado(): void
    {
        $user = User::factory()->licenciado()->create();
        $this->assertTrue($user->isLicenciado());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isCliente());
        $this->assertFalse($user->isPrestador());
    }
}
