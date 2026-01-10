/**
 * PerfilMeta - Versión Premium Corregida
 */
class MetaBase extends HTMLElement {
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
 * COMPONENTE DE EDICIÓN (Usado en el Perfil)
 */
class PerfilMeta extends MetaBase {
    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    render() {
        const nodo = this.getNodoSeguro() || {};
        const metaActual = (nodo.meta || nodo.META || "").trim();

        this.innerHTML = `
            <link rel="stylesheet" href="/menu_opcion/Info_Usuario/CSS/MetaComponent.css">
            <div class="meta-edit-card edit-group">
                <div class="meta-header">
                    <h3><i class="fa-solid fa-bullseye"></i> Mi Meta del Ciclo</h3>
                    <div class="meta-status-container">
                        <span id="meta-status" class="status-label">Guardado</span>
                        
                        <button class="edit-trigger mini-btn" title="Editar meta">
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
                    <input type="text" id="input-meta-comp" class="meta-input-field" 
                           maxlength="60" 
                           placeholder="Ej: Aprobar Cálculo con 15..." 
                           value="${metaActual}" readonly>
                </div>

                <div class="meta-footer">
                    <small>Se muestra en tu perfil público.</small>
                    <small id="char-count" class="char-counter">${metaActual.length}/60</small>
                </div>
            </div>
        `;
    }

    setupEvents() {
        const group = this.querySelector('.edit-group');
        const btnSave = this.querySelector('#btn-save-meta');
        const input = this.querySelector('#input-meta-comp');
        const status = this.querySelector('#meta-status');
        const charCount = this.querySelector('#char-count');
        const btnEdit = this.querySelector('.edit-trigger');
        const btnCancel = this.querySelector('.btn-cancel');

        const updateStatus = (text, isPending = false, color = "") => {
            if (!status) return;
            status.innerText = text;
            status.style.color = color;
            isPending ? status.classList.add('pending-anim') : status.classList.remove('pending-anim');
        };

        btnEdit.onclick = () => {
            group.classList.add('editing');
            input.removeAttribute('readonly');
            input.focus();
            updateStatus("Editando", false, "var(--neon-cyan)");
        };

        input.addEventListener('input', () => {
            const nodo = this.getNodoSeguro();
            const haCambiado = input.value.trim() !== (nodo.meta || nodo.META || "").trim();
            charCount.innerText = `${input.value.length}/60`;
            
            if (haCambiado) {
                updateStatus("Pendiente...", true, "var(--warning-orange)");
                btnSave.classList.add('active');
            } else {
                updateStatus("Editando", false, "var(--neon-cyan)");
                btnSave.classList.remove('active');
            }
        });

        btnSave.onclick = (e) => {
            e.preventDefault();
            if (!btnSave.classList.contains('active')) return;
            updateStatus("Sincronizando...", true, "var(--neon-cyan)");
            btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            input.setAttribute('readonly', true);
            group.classList.remove('editing');
            window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
        };

        btnCancel.onclick = () => {
            const nodo = this.getNodoSeguro();
            input.value = nodo.meta || nodo.META || "";
            charCount.innerText = `${input.value.length}/60`;
            group.classList.remove('editing');
            input.setAttribute('readonly', true);
            updateStatus("Guardado");
        };

        const resetVisuals = () => {
            const nodoNuevo = this.getNodoSeguro();
            const metaNueva = nodoNuevo.meta || nodoNuevo.META || "";
            if (input) {
                input.value = metaNueva;
                charCount.innerText = `${metaNueva.length}/60`;
            }
            updateStatus("Guardado");
            btnSave.innerHTML = '<i class="fa-solid fa-check"></i>';
            btnSave.classList.remove('active');
            btnSave.style.pointerEvents = "auto";
        };

        window.addEventListener('reset-meta-visuals', resetVisuals);
        window.addEventListener('meta-global-update', resetVisuals);
    }
}

/**
 * COMPONENTE DE VISUALIZACIÓN (Usado en el Inicio - SIN BOTONES)
 */
class HomeMeta extends MetaBase {
    connectedCallback() {
        this.render();
        window.addEventListener('meta-global-update', () => this.render());
        window.addEventListener('reset-meta-visuals', () => this.render());
    }

    /**
 * COMPONENTE DE VISUALIZACIÓN (Dentro de MetaComponent.js)
 */
render() {
    const nodo = this.getNodoSeguro();
    const metaActual = (nodo.meta || nodo.META || "").trim();

    const contenido = metaActual 
        ? `<p class="home-meta-text"><span>“</span>${metaActual}<span>”</span></p>`
        : `<p class="home-meta-empty">Aún no has definido tu meta para este ciclo. <br><span class="meta-call-action">¡Establece un objetivo ahora!</span></p>`;

    this.innerHTML = `
        <div class="home-meta-container">
            <div class="meta-icon-wrapper">
                <i class="fa-solid fa-rocket"></i>
            </div>
            <div class="meta-content-view">
                <small class="meta-label-premium">OBJETIVO DEL CICLO</small>
                ${contenido}
            </div>
        </div>
    `;
}
}

customElements.define('perfil-meta', PerfilMeta);
customElements.define('home-meta', HomeMeta);