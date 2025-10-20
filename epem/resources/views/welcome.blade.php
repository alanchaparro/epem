<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>EPEM - Laravel</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Styles -->
        <style>
            body {
                font-family: 'Figtree', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                background: white;
                padding: 3rem;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 600px;
                margin: 2rem;
            }
            h1 {
                color: #333;
                font-size: 3rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }
            .subtitle {
                color: #666;
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .status {
                background: #10b981;
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                font-weight: 500;
                display: inline-block;
                margin: 1rem 0;
            }
            .info {
                background: #f3f4f6;
                padding: 1.5rem;
                border-radius: 10px;
                margin-top: 2rem;
                text-align: left;
            }
            .info h3 {
                color: #374151;
                margin-top: 0;
            }
            .info ul {
                color: #6b7280;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 EPEM</h1>
            <p class="subtitle">Sistema de Gestión Empresarial</p>
            
            <div class="status">
                ✅ Laravel funcionando correctamente
            </div>

            <div class="info">
                <h3>📋 Información del Sistema</h3>
                <ul>
                    <li><strong>Framework:</strong> Laravel {{ app()->version() }}</li>
                    <li><strong>PHP:</strong> {{ PHP_VERSION }}</li>
                    <li><strong>Entorno:</strong> {{ app()->environment() }}</li>
                    <li><strong>Base de datos:</strong> {{ config('database.default') }}</li>
                </ul>
            </div>

            <div class="info">
                <h3>🔧 Próximos Pasos</h3>
                <ul>
                    <li>Ejecutar migraciones: <code>php artisan migrate</code></li>
                    <li>Iniciar frontend: <code>npm run dev</code></li>
                    <li>Configurar autenticación con Laravel Breeze</li>
                </ul>
            </div>
        </div>
    </body>
</html>
