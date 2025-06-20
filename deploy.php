<?php

namespace Deployer;

require 'recipe/common.php';

// Project name
set('application', 'my_project');
set('writable_mode', 'chmod');
set('keep_releases', 5);

set('writable_dirs', [
    'bootstrap/cache',
    'storage',
    'storage/',
    'storage/app',
    'storage/app/public',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/cache/data',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
]);

set('log_files', 'storage/logs/*.log');

set('repository', 'git@github.com:testsmith-io/practice-software-testing.git');

set('git_tty', true);

set('shared_dirs', []);
set('shared_files', []);
set('writable_dirs', []);

host('production')
    ->setHostname('142.93.137.65')
    ->set('remote_user', 'root')
    ->setForwardAgent(true)
    ->set('stage', 'production')
    ->set('deploy_path', '/var/www/api.practicesoftwaretesting.com');

task('deploy:sprint1', fn() => deploy('sprint1', 'v1.', '-v1'));
task('deploy:sprint2', fn() => deploy('sprint2', 'v2.', '-v2'));
task('deploy:sprint3', fn() => deploy('sprint3', 'v3.', '-v3'));
task('deploy:sprint4', fn() => deploy('sprint4', 'v4.', '-v4'));
task('deploy:sprint5', fn() => deploy('sprint5', '', ''));
task('deploy:sprint5-with-bugs', fn() => deploy('sprint5-with-bugs', 'with-bugs.', '-with-bugs'));

function deploy($source, $webDestination, $apiDestination) {
    writeln("🚀 Bắt đầu deploy sprint: {$source}");

    // === API ===
    writeln("📂 Upload API...");
    run("cd /var/www/ && mkdir -p api{$apiDestination}.practicesoftwaretesting.com_tmp");
    upload(__DIR__ . "/{$source}/API/", "/var/www/api{$apiDestination}.practicesoftwaretesting.com_tmp");
    
    writeln("🔁 Đổi tên thư mục API...");
    run("sudo mv /var/www/api{$apiDestination}.practicesoftwaretesting.com /var/www/api{$apiDestination}.practicesoftwaretesting.com_bak || true");
    run("sudo mv /var/www/api{$apiDestination}.practicesoftwaretesting.com_tmp /var/www/api{$apiDestination}.practicesoftwaretesting.com");
    run("sudo rm -rf /var/www/api{$apiDestination}.practicesoftwaretesting.com_tmp");
    run("sudo rm -rf /var/www/api{$apiDestination}.practicesoftwaretesting.com_bak || true");

    writeln("🧪 Kiểm tra API endpoint...");
    run("curl https://api{$apiDestination}.practicesoftwaretesting.com/status || true");

    writeln("⚙️ Artisan migrate + seed...");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan migrate:fresh --force -vvvv");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan db:seed --force -vvvv");

    writeln("🧼 Dọn dẹp Laravel cache...");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan optimize:clear");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan config:cache");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan route:cache");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan config:clear");
    run("/usr/bin/php /var/www/api{$apiDestination}.practicesoftwaretesting.com/artisan l5-swagger:generate");

    writeln("🔒 Gán quyền thư mục...");
    run("sudo chmod -R 777 /var/www/api{$apiDestination}.practicesoftwaretesting.com/storage");
    run("sudo chown -R www-data:www-data /var/www/api{$apiDestination}.practicesoftwaretesting.com/storage");

    // === UI ===
    writeln("🧹 Xoá node_modules UI...");
    runLocally("rm -rf {$source}/UI/node_modules/esbuild/");
    runLocally("rm -rf {$source}/UI/node_modules");
    runLocally("rm -f {$source}/UI/package-lock.json");
    runLocally("npm cache clean --force");

    writeln("🛠️ Build UI...");
    runLocally("cd {$source}/UI/ && npm cache verify && npm install --include=optional --legacy-peer-deps && npm run build");

    writeln("📦 Upload UI...");
    run("cd /var/www/ && mkdir -p {$webDestination}practicesoftwaretesting.com_tmp/public_html");
    upload(__DIR__ . "/{$source}/UI/dist/toolshop/", "/var/www/{$webDestination}practicesoftwaretesting.com_tmp/public_html");

    writeln("🔁 Đổi tên thư mục UI...");
    run("sudo mv /var/www/{$webDestination}practicesoftwaretesting.com /var/www/{$webDestination}practicesoftwaretesting.com_bak || true");
    run("sudo mv /var/www/{$webDestination}practicesoftwaretesting.com_tmp /var/www/{$webDestination}practicesoftwaretesting.com");
    run("sudo rm -rf /var/www/{$webDestination}practicesoftwaretesting.com_tmp");
    run("sudo rm -rf /var/www/{$webDestination}practicesoftwaretesting.com_bak || true");

    writeln("✅ Kết thúc deploy sprint: {$source}");
}
