/**
 * MetaComponent.js - Núcleo Blindado
 */

class MetaBase extends HTMLElement {

    safeString(v) {
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return "";
        return String(v);
    }

    getMetaSeguro(nodo) {
        return this.safeString(nodo?.meta ?? nodo?.META).trim();
    }

    getNodoSeguro() {
        try {
            const raw = sessionStorage.getItem('nodo_activo');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }
}

/**
 * COMPONENTE DE EDICIÓN (Perfil)
 */
class PerfilMeta extends MetaBase {

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    render() {
        const nodo = this.getNodoSeguro();
        const metaActual = this.getMetaSeguro(nodo);

        this.innerHTML = `
            <link rel="stylesheet" href="/menu_opcion/Info_Usuario/CSS/MetaComponent.css">
            <div class="meta-edit-card edit-group">
                <div class="meta-header">
                    <h3><i class="fa-solid fa-bullseye"></i> Mi Meta del Ciclo</h3>
                    <div class="meta-status-container">
                        <span id="meta-status" class="status-label">Guardado</span>
                        <button class="edit-trigger mini-btn">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <div class="edit-controls">
                            <button class="btn-confirm mini-confirm-btn" id="btn-save-meta">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button class="btn-cancel mini-btn-cancel">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="input-glow-wrapper">
                    <input type="text"
                           id="input-meta-comp"
                           maxlength="60"
                           value="${metaActual}"
                           readonly>
                </div>

                <div class="meta-footer">
                    <small>Se muestra en tu perfil público.</small>
                    <small id="char-count">${metaActual.length}/60</small>
                </div>
            </div>
        `;
    }

    setupEvents() {
        const group = this.querySelector('.edit-group');
        const input = this.querySelector('#input-meta-comp');
        const btnSave = this.querySelector('#btn-save-meta');
        const btnEdit = this.querySelector('.edit-trigger');
        const btnCancel = this.querySelector('.btn-cancel');
        const status = this.querySelector('#meta-status');
        const charCount = this.querySelector('#char-count');

        const updateStatus = (text, pending = false) => {
            status.innerText = text;
            status.classList.toggle('pending-anim', pending);
        };

        btnEdit.onclick = () => {
            group.classList.add('editing');
            input.removeAttribute('readonly');
            input.focus();
            updateStatus("Editando");
        };

        input.addEventListener('input', () => {
            const nodo = this.getNodoSeguro();
            const cambio = input.value.trim() !== this.getMetaSeguro(nodo);
            charCount.innerText = `${input.value.length}/60`;
            btnSave.classList.toggle('active', cambio);
            updateStatus(cambio ? "Pendiente..." : "Editando", cambio);
        });

        btnSave.onclick = () => {
            if (!btnSave.classList.contains('active')) return;
            updateStatus("Sincronizando...", true);
            input.setAttribute('readonly', true);
            group.classList.remove('editing');
            window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
        };

        btnCancel.onclick = () => {
            const nodo = this.getNodoSeguro();
            input.value = this.getMetaSeguro(nodo);
            charCount.innerText = `${input.value.length}/60`;
            group.classList.remove('editing');
            input.setAttribute('readonly', true);
            updateStatus("Guardado");
        };

        const reset = () => {
            const nodo = this.getNodoSeguro();
            input.value = this.getMetaSeguro(nodo);
            charCount.innerText = `${input.value.length}/60`;
            updateStatus("Guardado");
            btnSave.classList.remove('active');
        };

        window.addEventListener('meta-global-update', reset);
        window.addEventListener('reset-meta-visuals', reset);
    }
}

/**
 * COMPONENTE DE VISUALIZACIÓN (Inicio)
 */
class HomeMeta extends MetaBase {

    connectedCallback() {
        this.render();
        window.addEventListener('meta-global-update', () => this.render());
    }

    render() {
        const nodo = this.getNodoSeguro();
        const metaActual = this.getMetaSeguro(nodo);

        this.innerHTML = `
            <div class="home-meta-container">
                <i class="fa-solid fa-rocket"></i>
                ${metaActual
                    ? `<p>“${metaActual}”</p>`
                    : `<p>Aún no has definido tu meta.</p>`
                }
            </div>
        `;
    }
}

customElements.define('perfil-meta', PerfilMeta);
customElements.define('home-meta', HomeMeta);
