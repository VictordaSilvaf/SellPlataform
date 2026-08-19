<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menu_products', function (Blueprint $table) {
            $table->foreignId('menu_section_id')
                ->nullable()
                ->after('menu_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('menu_section_id');
        });
    }
};
