@php
\Carbon\Carbon::setLocale('pt_BR');
$role = Auth::user()->role ?? null;
@endphp
<x-app-layout>
    <div class="space-y-6">

        <x-order-header :id="$order->id" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="space-y-6">

                <x-order-info
                    :order="$order"
                    :steps="$order->steps"
                    product="{{ $order->product->name }}"
                    progress="{{ $order->progresso }}"
                    cliente="{{ $order->user->name }}"
                    email="{{ $order->user->email }}"
                    telefone="{{ $order->user->telefone }}"
                    endereco="{{ $order->user->endereco }},{{ $order->user->numero }}"
                    cidade="{{ $order->user->cidade }}-{{ $order->user->estado }}"
                />

                @php
                    $somenteLeitura = $order->isCancelado() ||
                        $role === 'cliente' ||
                        ($role === 'prestador' && !$order->isPrestador(Auth::user()));
                @endphp

                <x-order-files
                    :files="$order->attachments"
                    :orderId="$order->id"
                    :readonly="$somenteLeitura"
                />

                @if($order->product->isRecorrente() && $order->documentCategories->isNotEmpty())
                    <x-order-document-tabs
                        :categories="$order->documentCategories"
                        :orderId="$order->id"
                        :readonly="$somenteLeitura"
                    />
                @endif

            </div>

            <div class="space-y-6">

                @if($role === 'admin')
                    <x-card>
                        <form method="POST" action="{{ route('pedido.update', $order->id) }}" data-ajax>
                            @csrf
                            @method('PUT')
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status do pedido</label>
                            <div class="flex gap-3">
                                <select name="status" class="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-400 focus:ring-blue-400">
                                    @foreach(\App\Enums\OrderStatusEnum::cases() as $s)
                                        <option value="{{ $s->value }}" @selected($order->status === $s)>
                                            {{ $s->label() }}
                                        </option>
                                    @endforeach
                                </select>
                                <button type="submit" data-cy="btn-salvar-status" class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </x-card>
                @endif

                @if(
                    !$order->isCancelado() &&
                    (
                        in_array($role, ['admin','licenciado']) ||
                        ($role === 'prestador' && $order->isPrestador(Auth::user()))
                    )
                )
                    <x-order-editor :orderId="$order->id"/>
                @endif

                <x-order-filters />

                @foreach($messages as $month => $msgs)

                    <h3 class="text-gray-600 dark:text-gray-300 font-medium mt-6">
                        {{ \Carbon\Carbon::parse($month)->translatedFormat('F Y') }}
                    </h3>

                    @foreach($msgs as $msg)

                        <x-order-message
                            nome="{{ $msg->user->name }}"
                            data="{{ $msg->date->format('d/m/Y H:i') }}"
                            texto="{{ $msg->message }}"
                            arquivo="{{ $msg->file_name }}"
                            url="{{ $msg->file_url }}"
                        />

                    @endforeach

                @endforeach

            </div>

        </div>

    </div>
</x-app-layout>
