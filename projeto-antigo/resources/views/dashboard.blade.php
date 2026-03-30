<x-app-layout>

    <div class="space-y-8">

        <x-title-card 
            title="Dashboard"
            breadcrumb="Home"
        />

        {{-- Cards superiores --}}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

            <x-dashboard-stat
                :value="$statusCount[0] ?? 0"
                label="Aguardando pagamento"
                color="yellow"
                :icon="svg('heroicon-o-credit-card','w-8 h-8')"
            />

            <x-dashboard-stat
                :value="$statusCount[1] ?? 0"
                label="Pedidos andamento"
                color="blue"
                :icon="svg('heroicon-o-document','w-8 h-8')"
            />

            <x-dashboard-stat
                :value="$statusCount[2] ?? 0"
                label="Cancelados"
                color="red"
                :icon="svg('heroicon-o-x-circle','w-8 h-8')"
            />

            <x-dashboard-stat
                :value="$statusCount[3] ?? 0"
                label="Retornos"
                color="cyan"
                :icon="svg('heroicon-o-arrow-path','w-8 h-8')"
            />

        </div>


        {{-- Faturamento --}}
        <x-dashboard-card title="Faturamento últimos 12 meses">

            <x-dashboard-chart 
                id="chart_faturamento"
                :labels="['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']"
                :data="array_fill(0,12,0)"
                api="/api/dashboard/faturamento"
            />

        </x-dashboard-card>


        {{-- Pedidos no mês --}}
        <x-dashboard-card title="Pedidos no mês">

            <x-dashboard-chart 
                id="chart_pedidos"
                :labels="range(1,31)"
                :data="array_fill(0,31,0)"
                api="/api/dashboard/pedidos-dia"
            />

        </x-dashboard-card>


        {{-- Pedidos pendentes --}}
        <x-card title="Pedidos pendentes">

            <x-orders-table :orders="$pedidosPendentes" />

        </x-card>

    </div>

</x-app-layout>

<script>

function dashboardData(){

    return {

        async init(){

            this.carregarFaturamento();
            this.carregarPedidos();

        },

        async carregarFaturamento(){

            const res = await fetch('/api/dashboard/faturamento');

            const data = await res.json();

            let valores = Array(12).fill(0);

            data.forEach(item => {

                valores[item.mes - 1] = item.total;

            });

            chart_faturamento.update(valores);

        },

        async carregarPedidos(){

            const res = await fetch('/api/dashboard/pedidos-dia');

            const data = await res.json();

            let valores = Array(31).fill(0);

            data.forEach(item => {

                valores[item.dia - 1] = item.total;

            });

            chart_pedidos.update(valores);

        }

    }

}

</script>