import Swal from 'sweetalert2';
window.Swal = Swal;

function showSuccess(message) {
    return Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: message,
        confirmButtonColor: '#3b82f6',
    });
}

function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: message,
        confirmButtonColor: '#3b82f6',
    });
}

function showValidationErrors(errors) {
    // Deduplica mensagens idênticas (ex: required_without em dois campos)
    const messages = [...new Set(Object.values(errors).flat())];
    return Swal.fire({
        icon: 'warning',
        title: 'Verifique os campos',
        html: '<ul class="text-left text-sm space-y-1 mt-2">' +
            messages.map(m => `<li>• ${m}</li>`).join('') +
            '</ul>',
        confirmButtonColor: '#3b82f6',
    });
}

function clearFieldErrors(form) {
    form.querySelectorAll('[data-field-error]').forEach(el => el.remove());
    form.querySelectorAll('.ajax-field-error').forEach(el => {
        el.classList.remove('ajax-field-error', '!border-red-500');
    });
}

function showFieldErrors(form, errors) {
    clearFieldErrors(form);
    const shownMessages = new Set();

    for (const [field, messages] of Object.entries(errors)) {
        const input = form.querySelector(`[name="${field}"], [name="${field}[]"]`);
        if (!input) continue;

        input.classList.add('ajax-field-error', '!border-red-500');

        // Não adiciona parágrafo se a mensagem já foi exibida em outro campo
        const msg = messages[0];
        if (shownMessages.has(msg)) continue;
        shownMessages.add(msg);

        const errorEl = document.createElement('p');
        errorEl.className = 'text-red-500 text-xs mt-1';
        errorEl.setAttribute('data-field-error', '');
        errorEl.textContent = msg;

        // Insere sempre DENTRO do form: após o label (se houver) ou após o próprio input.
        // Evita subir para divs fora do form via closest('div').
        const anchor = input.closest('label') || input;
        anchor.insertAdjacentElement('afterend', errorEl);
    }
}

// ─── Formulários AJAX ────────────────────────────────────────────────────────

function initAjaxForms() {
    document.querySelectorAll('form[data-ajax]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('[type="submit"]');
            const originalHTML = submitBtn?.innerHTML;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Aguarde...';
            }

            clearFieldErrors(form);

            try {
                const formData = new FormData(form);

                const response = await axios.post(form.action, formData);

                const data = response.data;
                form.reset();
                await showSuccess(data.message || 'Operação realizada com sucesso!');

                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.reload();
                }

            } catch (error) {
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    showFieldErrors(form, errors);
                    await showValidationErrors(errors);
                } else {
                    const message = error.response?.data?.message || 'Ocorreu um erro inesperado.';
                    await showError(message);
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                }
            }
        });
    });
}

// ─── Confirmação de exclusão ─────────────────────────────────────────────────

function initDeleteConfirms() {
    document.querySelectorAll('form[data-ajax-delete]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const confirmMsg = form.dataset.confirmMessage || 'Esta ação não pode ser desfeita.';

            const result = await Swal.fire({
                icon: 'warning',
                title: 'Confirmar exclusão',
                text: confirmMsg,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar',
            });

            if (!result.isConfirmed) return;

            try {
                const formData = new FormData(form);
                const response = await axios.post(form.action, formData);
                const data = response.data;

                await showSuccess(data.message || 'Item excluído com sucesso!');

                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    // Remove o card/linha do DOM sem recarregar
                    const removable = form.closest('[data-deletable]');
                    if (removable) {
                        removable.remove();
                    } else {
                        window.location.reload();
                    }
                }

            } catch (error) {
                const message = error.response?.data?.message || 'Erro ao excluir item.';
                await showError(message);
            }
        });
    });
}

// ─── Confirmação de ações (cancelar, marcar pago, etc.) ─────────────────────

function initConfirmActions() {
    document.querySelectorAll('form[data-ajax-confirm]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title   = form.dataset.confirmTitle   || 'Confirmar ação';
            const text    = form.dataset.confirmMessage || 'Deseja continuar?';
            const btnText = form.dataset.confirmBtn     || 'Confirmar';
            const btnColor = form.dataset.confirmColor  || '#3b82f6';

            const result = await Swal.fire({
                icon: 'question',
                title,
                text,
                showCancelButton: true,
                confirmButtonColor: btnColor,
                cancelButtonColor: '#6b7280',
                confirmButtonText: btnText,
                cancelButtonText: 'Cancelar',
            });

            if (!result.isConfirmed) return;

            try {
                const formData = new FormData(form);
                const response = await axios.post(form.action, formData);
                const data = response.data;

                await showSuccess(data.message || 'Ação realizada com sucesso!');

                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.reload();
                }

            } catch (error) {
                const message = error.response?.data?.message || 'Ocorreu um erro inesperado.';
                await showError(message);
            }
        });
    });
}

// ─── Alpine component: formulário de usuário (máscaras + ViaCEP) ─────────────

document.addEventListener('alpine:init', () => {
    window.Alpine.data('userForm', (initial) => ({
        tipo:        initial.tipo,
        cpfVal:      initial.cpf,
        cnpjVal:     initial.cnpj,
        cepVal:      initial.cep,
        telefoneVal: initial.telefone,
        endereco:    initial.endereco,
        bairro:      initial.bairro,
        cidade:      initial.cidade,
        estado:      initial.estado,
        cepLoading:  false,
        cepNotFound: false,

        init() {
            // Aplica máscara nos valores iniciais (vindos do banco)
            this.cpfVal      = this._fmtCpf(this.cpfVal);
            this.cnpjVal     = this._fmtCnpj(this.cnpjVal);
            this.cepVal      = this._fmtCep(this.cepVal);
            this.telefoneVal = this._fmtTelefone(this.telefoneVal);
        },

        // ── Formatadores ────────────────────────────────────────────────────
        _fmtTelefone(v) {
            v = String(v).replace(/\D/g, '').slice(0, 11);
            if (v.length > 10) {
                v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else {
                v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            }
            return v;
        },
        _fmtCpf(v) {
            v = String(v).replace(/\D/g, '').slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            return v;
        },
        _fmtCnpj(v) {
            v = String(v).replace(/\D/g, '').slice(0, 14);
            v = v.replace(/(\d{2})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1/$2');
            v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
            return v;
        },
        _fmtCep(v) {
            v = String(v).replace(/\D/g, '').slice(0, 8);
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
            return v;
        },

        // ── Handlers de input ────────────────────────────────────────────────
        maskTelefone(e) {
            const masked = this._fmtTelefone(e.target.value);
            e.target.value = masked;
            this.telefoneVal = masked;
        },
        maskCpf(e) {
            const masked = this._fmtCpf(e.target.value);
            e.target.value = masked;
            this.cpfVal = masked;
        },
        maskCnpj(e) {
            const masked = this._fmtCnpj(e.target.value);
            e.target.value = masked;
            this.cnpjVal = masked;
        },
        maskCep(e) {
            const masked = this._fmtCep(e.target.value);
            e.target.value = masked;
            this.cepVal = masked;
            this.cepNotFound = false;
            const digits = masked.replace(/\D/g, '');
            if (digits.length === 8) this.buscarCep(digits);
        },

        // ── Busca de CEP ─────────────────────────────────────────────────────
        async buscarCep(cep) {
            this.cepLoading = true;
            this.cepNotFound = false;
            try {
                const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const d = await r.json();
                if (d.erro) { this.cepNotFound = true; return; }
                this.endereco = d.logradouro;
                this.bairro   = d.bairro;
                this.cidade   = d.localidade;
                this.estado   = d.uf;
            } catch {
                this.cepNotFound = true;
            } finally {
                this.cepLoading = false;
            }
        },

        // ── Validações ───────────────────────────────────────────────────────
        cpfValido() {
            const n = this.cpfVal.replace(/\D/g, '');
            if (n.length < 11) return null;
            if (/^(\d)\1+$/.test(n)) return false;
            let s = 0;
            for (let i = 0; i < 9; i++) s += parseInt(n[i]) * (10 - i);
            let r = (s * 10) % 11; if (r >= 10) r = 0;
            if (r !== parseInt(n[9])) return false;
            s = 0;
            for (let i = 0; i < 10; i++) s += parseInt(n[i]) * (11 - i);
            r = (s * 10) % 11; if (r >= 10) r = 0;
            return r === parseInt(n[10]);
        },
        cnpjValido() {
            const n = this.cnpjVal.replace(/\D/g, '');
            if (n.length < 14) return null;
            if (/^(\d)\1+$/.test(n)) return false;
            const calc = (len) => {
                let sum = 0, pos = len - 7;
                for (let i = len; i >= 1; i--) {
                    sum += parseInt(n[len - i]) * pos--;
                    if (pos < 2) pos = 9;
                }
                return sum % 11 < 2 ? 0 : 11 - sum % 11;
            };
            return calc(12) === parseInt(n[12]) && calc(13) === parseInt(n[13]);
        },
    }));
});

// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initAjaxForms();
    initDeleteConfirms();
    initConfirmActions();
});
