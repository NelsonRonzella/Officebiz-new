<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_steps', function (Blueprint $table) {
            $table->unsignedInteger('duration_days')->nullable()->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('order_steps', function (Blueprint $table) {
            $table->dropColumn('duration_days');
        });
    }
};
