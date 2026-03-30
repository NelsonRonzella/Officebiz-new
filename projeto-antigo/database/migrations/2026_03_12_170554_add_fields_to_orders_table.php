<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Criar a coluna como nullable temporariamente para evitar conflito
            $table->unsignedBigInteger('criado_por')->nullable()->after('user_id');
            $table->unsignedBigInteger('prestador')->nullable()->after('criado_por');
            $table->integer('progresso')->default(0)->after('prestador');
        });

        // Preencher a coluna criado_por com algum usuário válido existente
        // Ex: o admin com ID 1 — altere se precisar de outro
        DB::table('orders')->update(['criado_por' => 1]);

        // Agora adiciona as constraints de foreign key
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('criado_por')
                  ->references('id')->on('users')
                  ->cascadeOnDelete();

            $table->foreign('prestador')
                  ->references('id')->on('users')
                  ->nullOnDelete();

            // Tornar a coluna criado_por obrigatória agora que todos os registros têm valor
            $table->unsignedBigInteger('criado_por')->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['criado_por']);
            $table->dropForeign(['prestador']);
            $table->dropColumn(['criado_por', 'prestador', 'progresso']);
        });
    }
};