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
        Schema::table('workspaces', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('slug');
            $table->unsignedInteger('logo_version')->default(0)->after('logo_path');
            $table->string('cover_path')->nullable()->after('logo_version');
            $table->unsignedInteger('cover_version')->default(0)->after('cover_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'logo_version', 'cover_path', 'cover_version']);
        });
    }
};
