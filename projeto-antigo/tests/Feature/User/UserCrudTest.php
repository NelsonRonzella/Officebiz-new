<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserCrudTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'Novo Usuario',
            'email'                 => 'novo@exemplo.com',
            'password'              => 'senhasegura123',
            'password_confirmation' => 'senhasegura123',
            'telefone'              => '11999999999',
            'role'                  => 'admin',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Admin cria usuários
    // -------------------------------------------------------------------------

    public function test_admin_cria_administrador(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/clientes', $this->payload(['role' => 'admin', 'email' => 'admin2@exemplo.com']))->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'admin2@exemplo.com', 'role' => 'admin']);
    }

    public function test_admin_cria_licenciado(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/clientes', $this->payload(['role' => 'licenciado', 'email' => 'lic@exemplo.com']))->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'lic@exemplo.com', 'role' => 'licenciado']);
    }

    public function test_admin_cria_prestador(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/clientes', $this->payload(['role' => 'prestador', 'email' => 'prest@exemplo.com']))->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'prest@exemplo.com', 'role' => 'prestador']);
    }

    public function test_admin_ativa_desativa_usuario_via_toggle(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->create(['active' => true]);

        $this->actingAs($admin)->patch("/usuarios/{$target->id}/toggle");

        $this->assertFalse((bool) $target->fresh()->active);

        $this->actingAs($admin)->patch("/usuarios/{$target->id}/toggle");

        $this->assertTrue((bool) $target->fresh()->active);
    }

    // -------------------------------------------------------------------------
    // Licenciado cria cliente
    // -------------------------------------------------------------------------

    public function test_licenciado_cria_cliente(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)->post('/clientes', $this->payload(['role' => 'cliente', 'email' => 'cli@exemplo.com']))->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'cli@exemplo.com', 'role' => 'cliente']);
    }

    public function test_licenciado_nao_pode_criar_admin(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)
            ->post('/clientes', $this->payload(['role' => 'admin', 'email' => 'adm2@exemplo.com']))
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'adm2@exemplo.com']);
    }

    // -------------------------------------------------------------------------
    // Validações — web form retorna redirect com erros de sessão (não 422)
    // -------------------------------------------------------------------------

    public function test_email_duplicado_retorna_erro_de_validacao(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['email' => 'duplicado@exemplo.com']);

        $this->actingAs($admin)
            ->post('/clientes', $this->payload(['email' => 'duplicado@exemplo.com']))
            ->assertSessionHasErrors(['email']);
    }

    public function test_senha_muito_curta_retorna_erro_de_validacao(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/clientes', $this->payload([
                'password'              => '123',
                'password_confirmation' => '123',
            ]))
            ->assertSessionHasErrors(['password']);
    }

    public function test_nome_obrigatorio_retorna_erro_de_validacao(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/clientes', $this->payload(['name' => '']))
            ->assertSessionHasErrors(['name']);
    }

    // -------------------------------------------------------------------------
    // Cliente não pode criar usuário — RoleMiddleware redireciona (não retorna 403)
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_criar_usuario(): void
    {
        $cliente = User::factory()->cliente()->create();

        $this->actingAs($cliente)
            ->post('/clientes', $this->payload(['email' => 'novo2@exemplo.com']))
            ->assertRedirect('/pedidos');
    }
}
