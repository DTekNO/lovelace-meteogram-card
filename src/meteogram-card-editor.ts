/**
 * The card's visual editor: Home Assistant's own ha-form, driven by the schema in
 * config-form.ts.
 *
 * A static getConfigForm() would need no element at all, and was tried first. It
 * cannot work here for one reason: Home Assistant renders that form straight from the
 * stored config, so every option the YAML omits arrives as undefined, and a boolean
 * selector draws undefined as off. This card defaults its layer toggles to *on* when
 * absent, so the form showed the opposite of what the card was doing for anyone who
 * had not written every key out — and clicking a wrongly-unchecked box just wrote the
 * value it already had. The schema has no `default` key to fix that, so the data has
 * to be merged before the form sees it, which needs something that owns the data.
 *
 * This is still nothing like the 787-line editor it replaces. It builds no markup: it
 * hands ha-form a schema and gets out of the way, so the components are Home
 * Assistant's problem rather than assumptions of ours.
 */
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MeteogramCardConfig } from "./types";
import { meteogramConfigForm, CARD_DEFAULTS } from "./config-form";

@customElement("meteogram-card-editor")
export class MeteogramCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: any;
    @state() private _config: MeteogramCardConfig = {};
    @state() private _formReady = false;

    public setConfig(config: MeteogramCardConfig): void {
        this._config = config ?? {};
    }

    connectedCallback(): void {
        super.connectedCallback();
        void this._awaitForm();
    }

    /**
     * ha-form is what every built-in card editor is built from, so it is present in
     * practice — but ha-textfield was assumed present too and is not, which is what
     * made this card's fields invisible. If it never arrives, say so instead of
     * rendering an empty box.
     */
    private async _awaitForm(): Promise<void> {
        if (customElements.get("ha-form")) {
            this._formReady = true;
            return;
        }
        await Promise.race([
            customElements.whenDefined("ha-form"),
            new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
        this._formReady = !!customElements.get("ha-form");
    }

    protected render() {
        if (!this._formReady) {
            return html`<div class="fallback">
                Home Assistant's form components are not available on this page, so the
                visual editor cannot be shown. The card can still be configured in YAML.
            </div>`;
        }
        const form = meteogramConfigForm();
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${{ ...CARD_DEFAULTS, ...this._config }}
                .schema=${form.schema}
                .computeLabel=${form.computeLabel}
                .computeHelper=${form.computeHelper}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    /**
     * The form hands back the merged data, defaults included. Keys equal to a default
     * are stripped so the YAML keeps saying what the author actually chose rather than
     * growing a copy of every default the first time the editor is opened.
     */
    private _valueChanged(ev: CustomEvent): void {
        ev.stopPropagation();
        const next: Record<string, any> = { ...(ev.detail?.value ?? {}) };
        for (const [key, value] of Object.entries(CARD_DEFAULTS)) {
            if (next[key] === value && (this._config as any)[key] === undefined) {
                delete next[key];
            }
        }
        for (const key of Object.keys(next)) {
            if (next[key] === undefined || next[key] === "") delete next[key];
        }
        // Clear out the nested blobs written before the sections were flattened, so a
        // config edited by the broken build tidies itself on the next change instead of
        // carrying dead keys the card never reads.
        delete next.layers;
        delete next.advanced;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: next },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
        .fallback {
            padding: 16px;
            color: var(--primary-text-color);
        }
    `;
}
