<x-app-layout>

<div class="space-y-8 max-w-5xl mx-auto">

    <x-title-card
        title="Sobre o sistema"
        breadcrumb="Home > Sobre"
    />

    {{-- INTRODUÇÃO --}}
    <x-card>
        <h2 class="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">O que é o OfficeBiz?</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            O OfficeBiz é um sistema de gestão de pedidos de serviços. Ele organiza o ciclo completo de um pedido: desde a criação pelo licenciado, passando pela execução de etapas pelo prestador, até a conclusão e acompanhamento pelo cliente. O sistema conta com notificações automáticas por e-mail e dentro do próprio painel, além de controle de acesso por perfil de usuário.
        </p>
    </x-card>

    {{-- PERFIS DE USUÁRIO --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Perfis de usuário</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center">
                        <x-heroicon-s-shield-check class="w-5 h-5 text-white" />
                    </div>
                    <h3 class="font-bold text-gray-800 dark:text-gray-100">Admin</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Acesso total ao sistema</li>
                    <li>• Dashboard com gráficos e faturamento</li>
                    <li>• Gerencia todos os pedidos, usuários e produtos</li>
                    <li>• Cadastra e gerencia prestadores</li>
                    <li>• Troca o prestador de qualquer pedido</li>
                    <li>• Filtra pedidos por licenciado e prestador</li>
                    <li>• Visualiza log de atividades</li>
                    <li>• Gerencia contratos e tutoriais</li>
                    <li>• Recebe notificações de todos os pedidos</li>
                </ul>
            </div>

            <div class="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <x-heroicon-s-briefcase class="w-5 h-5 text-white" />
                    </div>
                    <h3 class="font-bold text-gray-800 dark:text-gray-100">Licenciado</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Cria e acompanha seus próprios pedidos</li>
                    <li>• Gerencia seus clientes</li>
                    <li>• Envia mensagens e anexos nos pedidos</li>
                    <li>• Recebe e-mails sobre seus pedidos</li>
                    <li>• Acessa tutoriais e produtos</li>
                </ul>
            </div>

            <div class="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <x-heroicon-s-wrench-screwdriver class="w-5 h-5 text-white" />
                    </div>
                    <h3 class="font-bold text-gray-800 dark:text-gray-100">Prestador</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Visualiza pedidos disponíveis (sem prestador)</li>
                    <li>• Aceita pedidos para executar</li>
                    <li>• Avança etapas dos pedidos aceitos</li>
                    <li>• Envia mensagens e anexos</li>
                    <li>• Recebe notificação ao ser vinculado a um pedido</li>
                    <li>• Recebe e-mails sobre prazos e atualizações</li>
                </ul>
            </div>

            <div class="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <x-heroicon-s-user class="w-5 h-5 text-white" />
                    </div>
                    <h3 class="font-bold text-gray-800 dark:text-gray-100">Cliente</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Visualiza seus próprios pedidos</li>
                    <li>• Acompanha status e etapas</li>
                    <li>• Acessa tutoriais e produtos</li>
                    <li>• Recebe notificações quando pedido é criado ou etapa avança</li>
                </ul>
            </div>

        </div>
    </x-card>

    {{-- FLUXO DE STATUS DO PEDIDO --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Fluxo de status do pedido</h2>

        <div class="flex justify-center overflow-x-auto py-2">
            <svg viewBox="0 0 780 470" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-3xl" style="min-width:480px">

                {{-- Novo Pedido --}}
                <rect x="290" y="10" width="200" height="50" rx="10" fill="#6366f1" />
                <text x="390" y="32" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Pedido criado</text>
                <text x="390" y="50" text-anchor="middle" fill="#c7d2fe" font-size="11">pelo Licenciado / Admin</text>

                {{-- Seta para Aguardando --}}
                <line x1="390" y1="60" x2="390" y2="100" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>

                {{-- Aguardando Pagamento --}}
                <rect x="260" y="100" width="260" height="58" rx="10" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
                <text x="390" y="126" text-anchor="middle" fill="#854d0e" font-size="13" font-weight="bold">Aguardando Pagamento</text>
                <text x="390" y="148" text-anchor="middle" fill="#a16207" font-size="11">Status inicial do pedido</text>

                {{-- Seta para Pago --}}
                <line x1="390" y1="158" x2="390" y2="198" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="400" y="182" fill="#6b7280" font-size="10">Admin confirma pagamento</text>

                {{-- Pago --}}
                <rect x="260" y="198" width="260" height="58" rx="10" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
                <text x="390" y="224" text-anchor="middle" fill="#065f46" font-size="13" font-weight="bold">Pago</text>
                <text x="390" y="246" text-anchor="middle" fill="#047857" font-size="11">Aguardando prestador</text>

                {{-- Seta para Em Andamento --}}
                <line x1="390" y1="256" x2="390" y2="296" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="400" y="280" fill="#6b7280" font-size="10">Prestador aceita o pedido</text>

                {{-- Em Andamento --}}
                <rect x="260" y="296" width="260" height="58" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                <text x="390" y="322" text-anchor="middle" fill="#1e40af" font-size="13" font-weight="bold">Em Andamento</text>
                <text x="390" y="344" text-anchor="middle" fill="#1d4ed8" font-size="11">Etapas sendo executadas</text>

                {{-- Seta para Retorno (direita) --}}
                <line x1="520" y1="325" x2="610" y2="325" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="535" y="317" fill="#6b7280" font-size="10">retorno</text>

                {{-- Retorno --}}
                <rect x="610" y="296" width="150" height="58" rx="10" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/>
                <text x="685" y="322" text-anchor="middle" fill="#155e75" font-size="13" font-weight="bold">Retorno</text>
                <text x="685" y="344" text-anchor="middle" fill="#0e7490" font-size="11">Em revisão</text>

                {{-- Seta do Retorno de volta --}}
                <path d="M 685 296 Q 685 268 520 268 Q 390 268 390 296" stroke="#06b6d4" stroke-width="2" fill="none" marker-end="url(#arrowcyan)" stroke-dasharray="5,3"/>
                <text x="580" y="261" fill="#0e7490" font-size="10">retoma</text>

                {{-- Cancelado --}}
                <rect x="10" y="296" width="140" height="58" rx="10" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
                <text x="80" y="322" text-anchor="middle" fill="#991b1b" font-size="13" font-weight="bold">Cancelado</text>
                <text x="80" y="344" text-anchor="middle" fill="#b91c1c" font-size="11">Qualquer status</text>

                {{-- Seta para Cancelado (de Em Andamento) --}}
                <line x1="260" y1="325" x2="150" y2="325" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="162" y="317" fill="#6b7280" font-size="10">cancelar</text>

                {{-- Seta para Cancelado (de Aguardando) - dashed --}}
                <path d="M 260 129 Q 185 129 80 200 Q 80 250 80 296" stroke="#9ca3af" stroke-width="2" fill="none" stroke-dasharray="4,3" marker-end="url(#arrow)"/>

                {{-- Seta para Cancelado (de Pago) - dashed --}}
                <path d="M 260 227 Q 195 227 150 258 Q 80 275 80 296" stroke="#9ca3af" stroke-width="2" fill="none" stroke-dasharray="4,3" marker-end="url(#arrow)"/>

                {{-- Seta para Concluído --}}
                <line x1="390" y1="354" x2="390" y2="406" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="400" y="386" fill="#6b7280" font-size="10">Admin conclui o pedido</text>

                {{-- Concluído --}}
                <rect x="260" y="406" width="260" height="58" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
                <text x="390" y="432" text-anchor="middle" fill="#14532d" font-size="13" font-weight="bold">Concluído</text>
                <text x="390" y="454" text-anchor="middle" fill="#15803d" font-size="11">Pedido encerrado pelo Admin</text>

                {{-- Arrow markers --}}
                <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
                    </marker>
                    <marker id="arrowcyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#06b6d4" />
                    </marker>
                </defs>

            </svg>
        </div>

        <div class="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 text-sm">
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-yellow-300 border border-yellow-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Aguardando Pagamento</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-emerald-200 border border-emerald-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Pago</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-blue-300 border border-blue-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Em Andamento</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-cyan-200 border border-cyan-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Retorno</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-red-200 border border-red-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Cancelado</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-green-200 border border-green-500 flex-shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400">Concluído</span>
            </div>
        </div>
    </x-card>

    {{-- FLUXO DE ETAPAS --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Fluxo de etapas do pedido</h2>

        <div class="flex justify-center overflow-x-auto py-2">
            <svg viewBox="0 0 760 300" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-3xl" style="min-width:480px">

                <defs>
                    <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
                    </marker>
                    <marker id="arrow2g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#22c55e" />
                    </marker>
                </defs>

                {{-- Pedido criado --}}
                <rect x="10" y="120" width="130" height="50" rx="8" fill="#6366f1" />
                <text x="75" y="142" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Pedido criado</text>
                <text x="75" y="160" text-anchor="middle" fill="#c7d2fe" font-size="10">Etapas copiadas</text>

                <line x1="140" y1="145" x2="168" y2="145" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow2)"/>

                {{-- Etapa 1 --}}
                <rect x="170" y="110" width="110" height="70" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                <text x="225" y="135" text-anchor="middle" fill="#1e40af" font-size="11" font-weight="bold">Etapa 1</text>
                <text x="225" y="153" text-anchor="middle" fill="#1d4ed8" font-size="10">Em andamento</text>
                <text x="225" y="169" text-anchor="middle" fill="#3b82f6" font-size="10">⏱ X dias</text>

                <line x1="280" y1="145" x2="308" y2="145" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow2)"/>
                <text x="290" y="138" fill="#6b7280" font-size="9">avança</text>

                {{-- Etapa 2 --}}
                <rect x="310" y="110" width="110" height="70" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                <text x="365" y="135" text-anchor="middle" fill="#1e40af" font-size="11" font-weight="bold">Etapa 2</text>
                <text x="365" y="153" text-anchor="middle" fill="#1d4ed8" font-size="10">Em andamento</text>
                <text x="365" y="169" text-anchor="middle" fill="#3b82f6" font-size="10">⏱ X dias</text>

                <line x1="420" y1="145" x2="448" y2="145" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow2)"/>
                <text x="430" y="138" fill="#6b7280" font-size="9">avança</text>

                {{-- Etapa N --}}
                <rect x="450" y="110" width="110" height="70" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                <text x="505" y="135" text-anchor="middle" fill="#1e40af" font-size="11" font-weight="bold">Etapa N</text>
                <text x="505" y="153" text-anchor="middle" fill="#1d4ed8" font-size="10">Em andamento</text>
                <text x="505" y="169" text-anchor="middle" fill="#3b82f6" font-size="10">⏱ X dias</text>

                <line x1="560" y1="145" x2="588" y2="145" stroke="#22c55e" stroke-width="2" marker-end="url(#arrow2g)"/>
                <text x="563" y="138" fill="#15803d" font-size="9">conclui</text>

                {{-- Concluído --}}
                <rect x="590" y="110" width="130" height="70" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
                <text x="655" y="140" text-anchor="middle" fill="#14532d" font-size="12" font-weight="bold">Concluído</text>
                <text x="655" y="162" text-anchor="middle" fill="#15803d" font-size="10">Sem etapa ativa</text>

                {{-- Linha de prazo --}}
                <line x1="75" y1="220" x2="680" y2="220" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,3"/>
                <text x="75" y="240" fill="#9ca3af" font-size="10" font-style="italic">Verificação diária de prazo às 08h → alerta quando etapa está próxima do vencimento ou já vencida</text>

                {{-- Ícones prazo --}}
                <circle cx="225" cy="220" r="6" fill="#eab308"/>
                <circle cx="365" cy="220" r="6" fill="#ef4444"/>
                <text x="225" y="213" text-anchor="middle" fill="#854d0e" font-size="9">⚠ prazo</text>
                <text x="365" y="213" text-anchor="middle" fill="#991b1b" font-size="9">✕ vencido</text>

            </svg>
        </div>

        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Cada etapa é iniciada automaticamente quando a anterior é concluída. O progresso do pedido é calculado com base na proporção de etapas finalizadas.
        </p>
    </x-card>

    {{-- FLUXO DE NOTIFICAÇÕES --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Quem recebe cada notificação</h2>

        <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700">
                        <th class="text-left p-3 rounded-tl-lg font-semibold text-gray-700 dark:text-gray-300">Evento</th>
                        <th class="p-3 text-center font-semibold text-orange-600 dark:text-orange-400">Admin</th>
                        <th class="p-3 text-center font-semibold text-blue-600 dark:text-blue-400">Licenciado</th>
                        <th class="p-3 text-center font-semibold text-green-600 dark:text-green-400">Prestador</th>
                        <th class="p-3 text-center font-semibold text-purple-600 dark:text-purple-400 rounded-tr-lg">Cliente</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Pedido criado</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                        <td class="p-3 text-center">🔔</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Status atualizado</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Nova mensagem</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Novo anexo</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Etapa avançada</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Prazo a vencer</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Prazo vencido</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="p-3 text-gray-700 dark:text-gray-300 font-medium">Prestador vinculado</td>
                        <td class="p-3 text-center">🔔</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center">🔔 + ✉️</td>
                        <td class="p-3 text-center text-gray-300 dark:text-gray-600">—</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span>🔔 Notificação no painel (sino)</span>
            <span>✉️ Notificação por e-mail</span>
            <span>— Não recebe</span>
        </div>

        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            O usuário que realizou a ação <strong>não recebe</strong> a notificação daquela ação. O Admin sempre recebe notificações de todos os pedidos, independentemente de ser o ator.
        </p>
    </x-card>

    {{-- TIPOS DE PRODUTO --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Tipos de produto</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <x-heroicon-s-bolt class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 dark:text-gray-100">Produto Pontual</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Serviço com etapas definidas</p>
                    </div>
                </div>

                <div class="flex justify-center overflow-x-auto">
                    <svg viewBox="0 0 300 140" class="w-full max-w-xs">
                        <defs>
                            <marker id="ap3" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L7,3 z" fill="#6366f1" />
                            </marker>
                        </defs>
                        <rect x="5" y="40" width="70" height="40" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
                        <text x="40" y="64" text-anchor="middle" fill="#3730a3" font-size="10">Etapa 1</text>
                        <line x1="75" y1="60" x2="93" y2="60" stroke="#6366f1" stroke-width="1.5" marker-end="url(#ap3)"/>
                        <rect x="95" y="40" width="70" height="40" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
                        <text x="130" y="64" text-anchor="middle" fill="#3730a3" font-size="10">Etapa 2</text>
                        <line x1="165" y1="60" x2="183" y2="60" stroke="#6366f1" stroke-width="1.5" marker-end="url(#ap3)"/>
                        <rect x="185" y="40" width="70" height="40" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
                        <text x="220" y="64" text-anchor="middle" fill="#3730a3" font-size="10">Etapa N</text>
                        <text x="150" y="110" text-anchor="middle" fill="#6b7280" font-size="10">Progresso rastreado por etapa</text>
                        <text x="150" y="126" text-anchor="middle" fill="#6b7280" font-size="10">Prazo por etapa (dias)</text>
                    </svg>
                </div>
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                        <x-heroicon-s-arrow-path class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 dark:text-gray-100">Produto Recorrente</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Serviço contínuo com abas de documentos</p>
                    </div>
                </div>

                <div class="flex justify-center overflow-x-auto">
                    <svg viewBox="0 0 300 140" class="w-full max-w-xs">
                        <defs>
                            <marker id="ap4" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L7,3 z" fill="#06b6d4" />
                            </marker>
                        </defs>
                        <rect x="60" y="30" width="180" height="60" rx="10" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/>
                        <text x="150" y="57" text-anchor="middle" fill="#155e75" font-size="12" font-weight="bold">Pedido Recorrente</text>
                        <text x="150" y="78" text-anchor="middle" fill="#0e7490" font-size="11">Em andamento contínuo</text>
                        <path d="M 230 90 Q 260 110 240 120 Q 200 135 150 120 Q 100 105 80 120 Q 60 130 70 90" stroke="#06b6d4" stroke-width="1.5" fill="none" stroke-dasharray="4,3" marker-end="url(#ap4)"/>
                        <text x="150" y="132" text-anchor="middle" fill="#6b7280" font-size="10">Ciclo contínuo sem etapas fixas</text>
                    </svg>
                </div>
            </div>

        </div>
    </x-card>

    {{-- VISÃO GERAL DO SISTEMA --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Visão geral do sistema</h2>

        <div class="flex justify-center overflow-x-auto py-2">
            <svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-3xl" style="min-width:480px">
                <defs>
                    <marker id="ag" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L7,3 z" fill="#9ca3af" />
                    </marker>
                </defs>

                {{-- Licenciado --}}
                <rect x="10" y="100" width="120" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                <text x="70" y="122" text-anchor="middle" fill="#1e40af" font-size="12" font-weight="bold">Licenciado</text>
                <text x="70" y="140" text-anchor="middle" fill="#1d4ed8" font-size="10">Cria pedido</text>

                <line x1="130" y1="125" x2="188" y2="125" stroke="#9ca3af" stroke-width="2" marker-end="url(#ag)"/>

                {{-- Pedido --}}
                <rect x="190" y="80" width="160" height="90" rx="10" fill="#f3f4f6" stroke="#6b7280" stroke-width="2"/>
                <text x="270" y="108" text-anchor="middle" fill="#374151" font-size="12" font-weight="bold">Pedido</text>
                <text x="270" y="126" text-anchor="middle" fill="#6b7280" font-size="10">Status + Etapas</text>
                <text x="270" y="142" text-anchor="middle" fill="#6b7280" font-size="10">Mensagens + Anexos</text>
                <text x="270" y="158" text-anchor="middle" fill="#6b7280" font-size="10">Progresso</text>

                {{-- Prestador --}}
                <rect x="10" y="190" width="120" height="50" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
                <text x="70" y="212" text-anchor="middle" fill="#14532d" font-size="12" font-weight="bold">Prestador</text>
                <text x="70" y="230" text-anchor="middle" fill="#15803d" font-size="10">Executa etapas</text>

                <line x1="130" y1="215" x2="188" y2="155" stroke="#9ca3af" stroke-width="2" marker-end="url(#ag)"/>

                {{-- Cliente --}}
                <rect x="10" y="10" width="120" height="50" rx="8" fill="#f3e8ff" stroke="#a855f7" stroke-width="2"/>
                <text x="70" y="32" text-anchor="middle" fill="#581c87" font-size="12" font-weight="bold">Cliente</text>
                <text x="70" y="50" text-anchor="middle" fill="#7e22ce" font-size="10">Acompanha</text>

                <line x1="130" y1="35" x2="188" y2="95" stroke="#9ca3af" stroke-width="2" marker-end="url(#ag)"/>

                {{-- Seta para notificações --}}
                <line x1="350" y1="125" x2="408" y2="125" stroke="#9ca3af" stroke-width="2" marker-end="url(#ag)"/>

                {{-- Notificações --}}
                <rect x="410" y="80" width="140" height="90" rx="10" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
                <text x="480" y="108" text-anchor="middle" fill="#854d0e" font-size="12" font-weight="bold">Notificações</text>
                <text x="480" y="126" text-anchor="middle" fill="#a16207" font-size="10">🔔 Painel</text>
                <text x="480" y="144" text-anchor="middle" fill="#a16207" font-size="10">✉️ E-mail</text>
                <text x="480" y="162" text-anchor="middle" fill="#a16207" font-size="10">⏱ Agendadas</text>

                {{-- Admin --}}
                <rect x="570" y="100" width="120" height="50" rx="8" fill="#ffedd5" stroke="#f97316" stroke-width="2"/>
                <text x="630" y="122" text-anchor="middle" fill="#7c2d12" font-size="12" font-weight="bold">Admin</text>
                <text x="630" y="140" text-anchor="middle" fill="#9a3412" font-size="10">Visão total</text>

                <line x1="550" y1="125" x2="568" y2="125" stroke="#9ca3af" stroke-width="2" marker-end="url(#ag)"/>

                {{-- Produto --}}
                <rect x="265" y="210" width="160" height="50" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                <text x="345" y="232" text-anchor="middle" fill="#3730a3" font-size="12" font-weight="bold">Produto</text>
                <text x="345" y="250" text-anchor="middle" fill="#4338ca" font-size="10">Define as etapas</text>

                <line x1="340" y1="210" x2="300" y2="170" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#ag)"/>

            </svg>
        </div>
    </x-card>

    {{-- LOGS DO SISTEMA --}}
    <x-card>
        <h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Logs do sistema</h2>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            O sistema registra automaticamente as seguintes atividades através do <strong>Spatie Activity Log</strong>. Os logs ficam acessíveis no painel de administração em <em>Log de Atividades</em>.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-2 mb-3">
                    <x-heroicon-o-user-group class="w-5 h-5 text-blue-500" />
                    <h3 class="font-semibold text-gray-800 dark:text-gray-100">Usuários</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Usuário criado</li>
                    <li>• Usuário atualizado</li>
                    <li>• Usuário deletado</li>
                    <li>• Usuário restaurado</li>
                    <li>• Usuário removido permanentemente</li>
                </ul>
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-2 mb-3">
                    <x-heroicon-o-shopping-bag class="w-5 h-5 text-indigo-500" />
                    <h3 class="font-semibold text-gray-800 dark:text-gray-100">Produtos</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Produto criado</li>
                    <li>• Produto atualizado</li>
                </ul>
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-2 mb-3">
                    <x-heroicon-o-clipboard-document-list class="w-5 h-5 text-yellow-500" />
                    <h3 class="font-semibold text-gray-800 dark:text-gray-100">Pedidos</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Pedido criado</li>
                    <li>• Pedido atualizado (status, prestador)</li>
                    <li>• Mensagem enviada no pedido</li>
                </ul>
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-2 mb-3">
                    <x-heroicon-o-arrow-right-on-rectangle class="w-5 h-5 text-green-500" />
                    <h3 class="font-semibold text-gray-800 dark:text-gray-100">Acesso</h3>
                </div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Login de usuário</li>
                    <li>• Logout de usuário</li>
                </ul>
            </div>

        </div>
    </x-card>

</div>

</x-app-layout>
