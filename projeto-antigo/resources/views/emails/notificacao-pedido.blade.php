<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>{{ $titulo }}</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }

        .header {
            text-align: center;
            padding: 30px;
            border-bottom: 1px solid #eee;
        }

        .logo {
            height: 50px;
        }

        .content {
            padding: 40px;
        }

        .title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #000;
        }

        .card {
            background: #fafafa;
            border-left: 4px solid #ff9d00;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }

        .button {
            display: inline-block;
            padding: 14px 24px;
            background: #ff9d00;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 25px;
            border-top: 1px solid #eee;
        }
    </style>
</head>

<body>

    <div class="container">

        <div class="header">
            <img src="https://app.officebiz.com.br/logo.png" class="logo">
        </div>

        <div class="content">

            <div class="title">
                {{ $titulo }}
            </div>

            <p>Olá,</p>

            <p>{{ $mensagem }}</p>

            <div class="card">

                <strong>Pedido #{{ $pedido->id }}</strong>

                @if(isset($extra))
                    <br><br>
                    {!! $extra !!}
                @endif

            </div>

            <a href="{{ url('/pedidos/'.$pedido->id) }}" class="button">
                Visualizar Pedido
            </a>

            <p style="margin-top:30px;">
                Obrigado por utilizar nosso sistema.
            </p>

        </div>

        <div class="footer">
            © {{ date('Y') }} OfficeBiz
        </div>

    </div>

</body>
</html>