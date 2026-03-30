<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_steps', function (Blueprint $table) {

            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->integer('order');

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();

            $table->timestamps();

        });

        Schema::table('orders', function (Blueprint $table) {

            $table->foreignId('current_step_id')
                ->nullable()
                ->after('progresso')
                ->constrained('order_steps')
                ->nullOnDelete();

        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            $table->dropForeign(['current_step_id']);
            $table->dropColumn('current_step_id');

        });

        Schema::dropIfExists('order_steps');
    }
};