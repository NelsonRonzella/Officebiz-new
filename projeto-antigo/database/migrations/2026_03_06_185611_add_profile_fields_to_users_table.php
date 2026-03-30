<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->string('cpf')->nullable()->unique()->after('email');
            $table->string('cnpj')->nullable()->unique()->after('cpf');

            $table->string('telefone')->after('name');

            $table->string('endereco')->nullable();
            $table->string('numero')->nullable();
            $table->string('bairro')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado')->nullable();

        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn([
                'cpf',
                'cnpj',
                'telefone',
                'endereco',
                'numero',
                'bairro',
                'cidade',
                'estado'
            ]);

        });
    }
};