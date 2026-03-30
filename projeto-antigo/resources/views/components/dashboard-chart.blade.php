@props([
'id' => 'chart',
'type' => 'bar',
'labels' => [],
'data' => [],
'color' => '#FF9D00',
'api' => null
])

<div class="w-full">
    <canvas id="{{ $id }}" class="w-full h-64"></canvas>
</div>

@push('scripts')
<script>

document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById('{{ $id }}');

    const chart = new Chart(ctx, {

        type: @json($type),

        data: {
            labels: @json($labels),
            datasets: [{
                label: "",
                data: @json($data),
                backgroundColor: @json($color),
                borderRadius: 8,
                barThickness: 28
            }]
        },

        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }

    });


    /*
    |--------------------------------------------------------------------------
    | Se existir API → buscar dados
    |--------------------------------------------------------------------------
    */

    @if($api)

    fetch("{{ $api }}")
        .then(res => res.json())
        .then(json => {

            let values = []

            if(json.length && json[0].mes !== undefined){

                values = Array(12).fill(0)

                json.forEach(item => {
                    values[item.mes - 1] = item.total
                })

            }

            if(json.length && json[0].dia !== undefined){

                values = Array(31).fill(0)

                json.forEach(item => {
                    values[item.dia - 1] = item.total
                })

            }

            chart.data.datasets[0].data = values
            chart.update()

        })

    @endif

});

</script>
@endpush