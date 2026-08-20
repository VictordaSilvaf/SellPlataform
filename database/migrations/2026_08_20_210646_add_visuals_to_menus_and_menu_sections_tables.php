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
        Schema::table('menus', function (Blueprint $table) {
            $table->string('banner_path')->nullable()->after('status');
            $table->unsignedInteger('banner_version')->default(0)->after('banner_path');
            $table->string('banner_color', 7)->default('#141414')->after('banner_version');
        });

        Schema::table('menu_sections', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('description');
            $table->unsignedInteger('image_version')->default(0)->after('image_path');
            $table->string('background_color', 7)->default('#1a1a1a')->after('image_version');
            $table->string('image_side', 10)->default('LEFT')->after('background_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['banner_path', 'banner_version', 'banner_color']);
        });

        Schema::table('menu_sections', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'image_version', 'background_color', 'image_side']);
        });
    }
};
