var version = "3.2.1-beta";

const CARD_NAME = "Meteogram Card";
const METEOGRAM_CARD_STARTUP_TIME = new Date();
const DIAGNOSTICS_DEFAULT = version.includes("beta");

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.2");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

var enLocale = {
	"ui.card.meteogram.attribution": "Data from",
	"ui.card.meteogram.status.cached": "cached",
	"ui.card.meteogram.status.success": "success",
	"ui.card.meteogram.status.failed": "failed",
	"ui.card.meteogram.status_panel": "Status Panel",
	"ui.card.meteogram.status.expires_at": "Expires At",
	"ui.card.meteogram.status.last_render": "Last Render",
	"ui.card.meteogram.status.last_fingerprint_miss": "Last Fingerprint Miss",
	"ui.card.meteogram.status.last_data_fetch": "Last Data Fetch",
	"ui.card.meteogram.status.last_cached": "Last cached",
	"ui.card.meteogram.status.api_success": "API Success",
	"ui.card.meteogram.error": "Weather data not available",
	"ui.card.meteogram.attributes.temperature": "Temperature",
	"ui.card.meteogram.attributes.air_pressure": "Pressure",
	"ui.card.meteogram.attributes.precipitation": "Precipitation",
	"ui.card.meteogram.attributes.cloud_coverage": "Cloud Cover",
	"ui.card.meteogram.attributes.weather_icons": "Show Weather Icons",
	"ui.card.meteogram.attributes.wind": "Show Wind",
	"ui.card.meteogram.attributes.dense_icons": "Dense Weather Icons (every hour)",
	"ui.card.meteogram.attributes.fill_container": "Fill Container",
	"ui.editor.meteogram.title": "Meteogram Card Settings",
	"ui.editor.meteogram.title_label": "Title",
	"ui.editor.meteogram.title_description": "Card title (optional, shown at the top of the card)",
	"ui.editor.meteogram.weather_entity": "Weather Entity",
	"ui.editor.meteogram.choose_weather_entity": "Choose a weather entity for Home Assistant integration, or select 'None' to use coordinates.",
	"ui.editor.meteogram.location_info": "Location coordinates will be used to fetch weather data directly from Met.no API.",
	"ui.editor.meteogram.using_ha_location": "Using Home Assistant's location by default.",
	"ui.editor.meteogram.latitude": "Latitude",
	"ui.editor.meteogram.longitude": "Longitude",
	"ui.editor.meteogram.altitude": "Altitude",
	"ui.editor.meteogram.optional": "Optional",
	"ui.editor.meteogram.default": "Default",
	"ui.editor.meteogram.leave_empty": "Leave empty to use Home Assistant's configured location",
	"ui.editor.meteogram.display_options": "Display Options",
	"ui.editor.meteogram.display_mode": "Display Mode",
	"ui.editor.meteogram.meteogram_length": "Meteogram Length",
	"ui.editor.meteogram.hours_8": "8 hours",
	"ui.editor.meteogram.hours_12": "12 hours",
	"ui.editor.meteogram.hours_24": "24 hours",
	"ui.editor.meteogram.hours_48": "48 hours",
	"ui.editor.meteogram.hours_54": "54 hours",
	"ui.editor.meteogram.hours_max": "Max available",
	"ui.editor.meteogram.choose_hours": "Choose how many hours to show in the meteogram",
	"ui.editor.meteogram.attributes.cloud_coverage": "Show Cloud Cover",
	"ui.editor.meteogram.attributes.air_pressure": "Show Pressure",
	"ui.editor.meteogram.attributes.precipitation": "Show Precipitation",
	"ui.editor.meteogram.attributes.weather_icons": "Show Weather Icons",
	"ui.editor.meteogram.attributes.wind": "Show Wind",
	"ui.editor.meteogram.attributes.dense_icons": "Dense Weather Icons (every hour)",
	"ui.editor.meteogram.attributes.fill_container": "Fill Container"
};

var nbLocale = {
	"ui.card.meteogram.attribution": "Data fra",
	"ui.card.meteogram.status.cached": "bufret",
	"ui.card.meteogram.status.success": "suksess",
	"ui.card.meteogram.status.failed": "feilet",
	"ui.card.meteogram.status_panel": "Statuspanel",
	"ui.card.meteogram.status.expires_at": "Utløper",
	"ui.card.meteogram.status.last_render": "Sist tegnet",
	"ui.card.meteogram.status.last_fingerprint_miss": "Siste fingerprint-miss",
	"ui.card.meteogram.status.last_data_fetch": "Siste datainnhenting",
	"ui.card.meteogram.status.last_cached": "Sist bufret",
	"ui.card.meteogram.status.api_success": "API-suksess",
	"ui.card.meteogram.error": "Værdata ikke tilgjengelig",
	"ui.card.meteogram.attributes.temperature": "Temperatur",
	"ui.card.meteogram.attributes.air_pressure": "Lufttrykk",
	"ui.card.meteogram.attributes.precipitation": "Nedbør",
	"ui.card.meteogram.attributes.cloud_coverage": "Skydekke",
	"ui.card.meteogram.attributes.weather_icons": "Vis værikoner",
	"ui.card.meteogram.attributes.wind": "Vis vind",
	"ui.card.meteogram.attributes.dense_icons": "Tette værikoner (hver time)",
	"ui.card.meteogram.attributes.fill_container": "Fyll beholder",
	"ui.editor.meteogram.title": "Meteogram-kortinnstillinger",
	"ui.editor.meteogram.title_label": "Tittel",
	"ui.editor.meteogram.title_description": "Korttittel (valgfritt, vises øverst på kortet)",
	"ui.editor.meteogram.weather_entity": "Værenhet",
	"ui.editor.meteogram.choose_weather_entity": "Velg en værenhet for Home Assistant-integrasjon, eller velg 'None' for å bruke koordinater.",
	"ui.editor.meteogram.location_info": "Lokasjonskoordinater brukes for å hente værdata direkte fra Met.no API.",
	"ui.editor.meteogram.using_ha_location": "Bruker Home Assistants lokasjon som standard.",
	"ui.editor.meteogram.latitude": "Breddegrad",
	"ui.editor.meteogram.longitude": "Lengdegrad",
	"ui.editor.meteogram.altitude": "Høyde over havet",
	"ui.editor.meteogram.optional": "Valgfritt",
	"ui.editor.meteogram.default": "Standard",
	"ui.editor.meteogram.leave_empty": "La stå tomt for å bruke Home Assistants konfigurerte lokasjon",
	"ui.editor.meteogram.display_options": "Visningsvalg",
	"ui.editor.meteogram.display_mode": "Visningsmodus",
	"ui.editor.meteogram.meteogram_length": "Meteogramlengde",
	"ui.editor.meteogram.hours_8": "8 timer",
	"ui.editor.meteogram.hours_12": "12 timer",
	"ui.editor.meteogram.hours_24": "24 timer",
	"ui.editor.meteogram.hours_48": "48 timer",
	"ui.editor.meteogram.hours_54": "54 timer",
	"ui.editor.meteogram.hours_max": "Maks tilgjengelig",
	"ui.editor.meteogram.choose_hours": "Velg hvor mange timer som skal vises i meteogrammet",
	"ui.editor.meteogram.attributes.cloud_coverage": "Vis skydekke",
	"ui.editor.meteogram.attributes.air_pressure": "Vis lufttrykk",
	"ui.editor.meteogram.attributes.precipitation": "Vis nedbør",
	"ui.editor.meteogram.attributes.weather_icons": "Vis værikoner",
	"ui.editor.meteogram.attributes.wind": "Vis vind",
	"ui.editor.meteogram.attributes.dense_icons": "Tette værikoner (hver time)",
	"ui.editor.meteogram.attributes.fill_container": "Fyll beholder"
};

var esLocale = {
	"ui.card.meteogram.attribution": "Datos de",
	"ui.card.meteogram.status.cached": "en caché",
	"ui.card.meteogram.status.success": "éxito",
	"ui.card.meteogram.status.failed": "fallido",
	"ui.card.meteogram.status_panel": "Panel de estado",
	"ui.card.meteogram.status.expires_at": "Expira en",
	"ui.card.meteogram.status.last_render": "Última representación",
	"ui.card.meteogram.status.last_fingerprint_miss": "Última huella fallida",
	"ui.card.meteogram.status.last_data_fetch": "Última obtención de datos",
	"ui.card.meteogram.status.last_cached": "Último en caché",
	"ui.card.meteogram.status.api_success": "Éxito de la API",
	"ui.card.meteogram.error": "Datos meteorológicos no disponibles",
	"ui.card.meteogram.attributes.temperature": "Temperatura",
	"ui.card.meteogram.attributes.air_pressure": "Presión",
	"ui.card.meteogram.attributes.precipitation": "Precipitación",
	"ui.card.meteogram.attributes.cloud_coverage": "Cobertura de nubes",
	"ui.card.meteogram.attributes.weather_icons": "Mostrar iconos meteorológicos",
	"ui.card.meteogram.attributes.wind": "Mostrar viento",
	"ui.card.meteogram.attributes.dense_icons": "Iconos meteorológicos densos (cada hora)",
	"ui.card.meteogram.attributes.fill_container": "Rellenar el contenedor",
	"ui.editor.meteogram.title": "Configuración de la tarjeta Meteograma",
	"ui.editor.meteogram.title_label": "Título",
	"ui.editor.meteogram.title_description": "Título de la tarjeta (opcional, se muestra en la parte superior de la tarjeta)",
	"ui.editor.meteogram.weather_entity": "Entidad meteorológica",
	"ui.editor.meteogram.choose_weather_entity": "Elija una entidad meteorológica para la integración de Home Assistant, o seleccione 'None' para usar coordenadas.",
	"ui.editor.meteogram.location_info": "Las coordenadas se utilizarán para obtener datos meteorológicos directamente de la API de Met.no.",
	"ui.editor.meteogram.using_ha_location": "Usando la ubicación de Home Assistant por defecto.",
	"ui.editor.meteogram.latitude": "Latitud",
	"ui.editor.meteogram.longitude": "Longitud",
	"ui.editor.meteogram.altitude": "Altitud",
	"ui.editor.meteogram.optional": "Opcional",
	"ui.editor.meteogram.default": "Predeterminado",
	"ui.editor.meteogram.leave_empty": "Dejar vacío para usar la ubicación configurada en Home Assistant",
	"ui.editor.meteogram.display_options": "Opciones de visualización",
	"ui.editor.meteogram.display_mode": "Modo de visualización",
	"ui.editor.meteogram.meteogram_length": "Duración del meteograma",
	"ui.editor.meteogram.hours_8": "8 horas",
	"ui.editor.meteogram.hours_12": "12 horas",
	"ui.editor.meteogram.hours_24": "24 horas",
	"ui.editor.meteogram.hours_48": "48 horas",
	"ui.editor.meteogram.hours_54": "54 horas",
	"ui.editor.meteogram.hours_max": "Máximo disponible",
	"ui.editor.meteogram.choose_hours": "Elija cuántas horas mostrar en el meteograma",
	"ui.editor.meteogram.attributes.cloud_coverage": "Mostrar cobertura de nubes",
	"ui.editor.meteogram.attributes.air_pressure": "Mostrar presión",
	"ui.editor.meteogram.attributes.precipitation": "Mostrar precipitación",
	"ui.editor.meteogram.attributes.weather_icons": "Mostrar iconos meteorológicos",
	"ui.editor.meteogram.attributes.wind": "Mostrar viento",
	"ui.editor.meteogram.attributes.dense_icons": "Iconos meteorológicos densos (cada hora)",
	"ui.editor.meteogram.attributes.fill_container": "Rellenar el contenedor"
};

var itLocale = {
	"ui.card.meteogram.attribution": "Dati da",
	"ui.card.meteogram.status.cached": "memorizzato",
	"ui.card.meteogram.status.success": "successo",
	"ui.card.meteogram.status.failed": "fallito",
	"ui.card.meteogram.status_panel": "Pannello di stato",
	"ui.card.meteogram.status.expires_at": "Scade il",
	"ui.card.meteogram.status.last_render": "Ultima visualizzazione",
	"ui.card.meteogram.status.last_fingerprint_miss": "Ultima impronta mancante",
	"ui.card.meteogram.status.last_data_fetch": "Ultimo recupero dati",
	"ui.card.meteogram.status.last_cached": "Ultimo memorizzato",
	"ui.card.meteogram.status.api_success": "Successo API",
	"ui.card.meteogram.error": "Dati meteorologici non disponibili",
	"ui.card.meteogram.attributes.temperature": "Temperatura",
	"ui.card.meteogram.attributes.air_pressure": "Pressione",
	"ui.card.meteogram.attributes.precipitation": "Precipitazione",
	"ui.card.meteogram.attributes.cloud_coverage": "Copertura nuvolosa",
	"ui.card.meteogram.attributes.weather_icons": "Mostra icone meteo",
	"ui.card.meteogram.attributes.wind": "Mostra vento",
	"ui.card.meteogram.attributes.dense_icons": "Icone meteo dense (ogni ora)",
	"ui.card.meteogram.attributes.fill_container": "Riempi contenitore",
	"ui.editor.meteogram.title": "Impostazioni della scheda Meteogramma",
	"ui.editor.meteogram.title_label": "Titolo",
	"ui.editor.meteogram.title_description": "Titolo della scheda (opzionale, mostrato in cima alla scheda)",
	"ui.editor.meteogram.weather_entity": "Entità meteo",
	"ui.editor.meteogram.choose_weather_entity": "Scegli un'entità meteo per l'integrazione con Home Assistant, o seleziona 'None' per usare le coordinate.",
	"ui.editor.meteogram.location_info": "Le coordinate verranno utilizzate per ottenere i dati meteorologici direttamente dall'API Met.no.",
	"ui.editor.meteogram.using_ha_location": "Utilizzo della posizione di Home Assistant come predefinita.",
	"ui.editor.meteogram.latitude": "Latitudine",
	"ui.editor.meteogram.longitude": "Longitudine",
	"ui.editor.meteogram.altitude": "Altitudine",
	"ui.editor.meteogram.optional": "Opzionale",
	"ui.editor.meteogram.default": "Predefinito",
	"ui.editor.meteogram.leave_empty": "Lascia vuoto per usare la posizione configurata in Home Assistant",
	"ui.editor.meteogram.display_options": "Opzioni di visualizzazione",
	"ui.editor.meteogram.display_mode": "Modalità di visualizzazione",
	"ui.editor.meteogram.meteogram_length": "Durata meteogramma",
	"ui.editor.meteogram.hours_8": "8 ore",
	"ui.editor.meteogram.hours_12": "12 ore",
	"ui.editor.meteogram.hours_24": "24 ore",
	"ui.editor.meteogram.hours_48": "48 ore",
	"ui.editor.meteogram.hours_54": "54 ore",
	"ui.editor.meteogram.hours_max": "Massimo disponibile",
	"ui.editor.meteogram.choose_hours": "Scegli quante ore mostrare nel meteogramma",
	"ui.editor.meteogram.attributes.cloud_coverage": "Mostra copertura nuvolosa",
	"ui.editor.meteogram.attributes.air_pressure": "Mostra pressione",
	"ui.editor.meteogram.attributes.precipitation": "Mostra precipitazione",
	"ui.editor.meteogram.attributes.weather_icons": "Mostra icone meteo",
	"ui.editor.meteogram.attributes.wind": "Mostra vento",
	"ui.editor.meteogram.attributes.dense_icons": "Icone meteo dense (ogni ora)",
	"ui.editor.meteogram.attributes.fill_container": "Riempi contenitore"
};

var deLocale = {
	"ui.card.meteogram.attribution": "Daten von",
	"ui.card.meteogram.status.cached": "zwischengespeichert",
	"ui.card.meteogram.status.success": "Erfolg",
	"ui.card.meteogram.status.failed": "Fehler",
	"ui.card.meteogram.status_panel": "Statuspanel",
	"ui.card.meteogram.status.expires_at": "Ablaufdatum",
	"ui.card.meteogram.status.last_render": "Letzte Darstellung",
	"ui.card.meteogram.status.last_fingerprint_miss": "Letzter Fingerabdruck-Fehler",
	"ui.card.meteogram.status.last_data_fetch": "Letzter Datenabruf",
	"ui.card.meteogram.status.last_cached": "Zuletzt zwischengespeichert",
	"ui.card.meteogram.status.api_success": "API-Erfolg",
	"ui.card.meteogram.error": "Wetterdaten nicht verfügbar",
	"ui.card.meteogram.attributes.temperature": "Temperatur",
	"ui.card.meteogram.attributes.air_pressure": "Luftdruck",
	"ui.card.meteogram.attributes.precipitation": "Niederschlag",
	"ui.card.meteogram.attributes.cloud_coverage": "Wolkenbedeckung",
	"ui.card.meteogram.attributes.weather_icons": "Wetter-Symbole anzeigen",
	"ui.card.meteogram.attributes.wind": "Wind anzeigen",
	"ui.card.meteogram.attributes.dense_icons": "Dichte Wettersymbole (jede Stunde)",
	"ui.card.meteogram.attributes.fill_container": "Container ausfüllen",
	"ui.editor.meteogram.title": "Meteogramm-Karteneinstellungen",
	"ui.editor.meteogram.title_label": "Titel",
	"ui.editor.meteogram.title_description": "Kartentitel (optional, wird oben auf der Karte angezeigt)",
	"ui.editor.meteogram.weather_entity": "Wetter-Entität",
	"ui.editor.meteogram.choose_weather_entity": "Wählen Sie eine Wetter-Entität für die Home Assistant-Integration oder wählen Sie 'None' um Koordinaten zu verwenden.",
	"ui.editor.meteogram.location_info": "Die Koordinaten werden verwendet, um Wetterdaten direkt von der Met.no API abzurufen.",
	"ui.editor.meteogram.using_ha_location": "Standardmäßig wird der Standort von Home Assistant verwendet.",
	"ui.editor.meteogram.latitude": "Breitengrad",
	"ui.editor.meteogram.longitude": "Längengrad",
	"ui.editor.meteogram.altitude": "Höhe",
	"ui.editor.meteogram.optional": "Optional",
	"ui.editor.meteogram.default": "Standard",
	"ui.editor.meteogram.leave_empty": "Leer lassen, um die konfigurierte Position von Home Assistant zu verwenden",
	"ui.editor.meteogram.display_options": "Anzeigeoptionen",
	"ui.editor.meteogram.display_mode": "Anzeigemodus",
	"ui.editor.meteogram.meteogram_length": "Meteogramm-Länge",
	"ui.editor.meteogram.hours_8": "8 Stunden",
	"ui.editor.meteogram.hours_12": "12 Stunden",
	"ui.editor.meteogram.hours_24": "24 Stunden",
	"ui.editor.meteogram.hours_48": "48 Stunden",
	"ui.editor.meteogram.hours_54": "54 Stunden",
	"ui.editor.meteogram.hours_max": "Maximal verfügbar",
	"ui.editor.meteogram.choose_hours": "Wählen Sie, wie viele Stunden im Meteogramm angezeigt werden sollen",
	"ui.editor.meteogram.attributes.cloud_coverage": "Wolkenbedeckung anzeigen",
	"ui.editor.meteogram.attributes.air_pressure": "Luftdruck anzeigen",
	"ui.editor.meteogram.attributes.precipitation": "Niederschlag anzeigen",
	"ui.editor.meteogram.attributes.weather_icons": "Wetter-Symbole anzeigen",
	"ui.editor.meteogram.attributes.wind": "Wind anzeigen",
	"ui.editor.meteogram.attributes.dense_icons": "Dichte Wettersymbole (jede Stunde)",
	"ui.editor.meteogram.attributes.fill_container": "Container ausfüllen"
};

var frLocale = {
	"ui.card.meteogram.attribution": "Données de",
	"ui.card.meteogram.status.cached": "mis en cache",
	"ui.card.meteogram.status.success": "succès",
	"ui.card.meteogram.status.failed": "échec",
	"ui.card.meteogram.status_panel": "Panneau d'état",
	"ui.card.meteogram.status.expires_at": "Expire à",
	"ui.card.meteogram.status.last_render": "Dernier rendu",
	"ui.card.meteogram.status.last_fingerprint_miss": "Dernière empreinte manquée",
	"ui.card.meteogram.status.last_data_fetch": "Dernière récupération de données",
	"ui.card.meteogram.status.last_cached": "Dernière mise en cache",
	"ui.card.meteogram.status.api_success": "Succès API",
	"ui.card.meteogram.error": "Données météo non disponibles",
	"ui.card.meteogram.attributes.temperature": "Température",
	"ui.card.meteogram.attributes.air_pressure": "Pression",
	"ui.card.meteogram.attributes.precipitation": "Précipitations",
	"ui.card.meteogram.attributes.cloud_coverage": "Couverture nuageuse",
	"ui.card.meteogram.attributes.weather_icons": "Afficher les icônes météo",
	"ui.card.meteogram.attributes.wind": "Afficher le vent",
	"ui.card.meteogram.attributes.dense_icons": "Icônes météo denses (chaque heure)",
	"ui.card.meteogram.attributes.fill_container": "Remplir le conteneur",
	"ui.editor.meteogram.title": "Paramètres de la carte Météogramme",
	"ui.editor.meteogram.title_label": "Titre",
	"ui.editor.meteogram.title_description": "Titre de la carte (optionnel, affiché en haut de la carte)",
	"ui.editor.meteogram.weather_entity": "Entité météo",
	"ui.editor.meteogram.choose_weather_entity": "Choisissez une entité météo pour l'intégration Home Assistant, ou sélectionnez 'None' pour utiliser les coordonnées.",
	"ui.editor.meteogram.location_info": "Les coordonnées seront utilisées pour obtenir les données météo directement depuis l'API Met.no.",
	"ui.editor.meteogram.using_ha_location": "Utilisation de la localisation Home Assistant par défaut.",
	"ui.editor.meteogram.latitude": "Latitude",
	"ui.editor.meteogram.longitude": "Longitude",
	"ui.editor.meteogram.altitude": "Altitude",
	"ui.editor.meteogram.optional": "Optionnel",
	"ui.editor.meteogram.default": "Défaut",
	"ui.editor.meteogram.leave_empty": "Laisser vide pour utiliser la localisation configurée dans Home Assistant",
	"ui.editor.meteogram.display_options": "Options d'affichage",
	"ui.editor.meteogram.display_mode": "Mode d'affichage",
	"ui.editor.meteogram.meteogram_length": "Durée du météogramme",
	"ui.editor.meteogram.hours_8": "8 heures",
	"ui.editor.meteogram.hours_12": "12 heures",
	"ui.editor.meteogram.hours_24": "24 heures",
	"ui.editor.meteogram.hours_48": "48 heures",
	"ui.editor.meteogram.hours_54": "54 heures",
	"ui.editor.meteogram.hours_max": "Maximum disponible",
	"ui.editor.meteogram.choose_hours": "Choisissez combien d'heures afficher dans le météogramme",
	"ui.editor.meteogram.attributes.cloud_coverage": "Afficher la couverture nuageuse",
	"ui.editor.meteogram.attributes.air_pressure": "Afficher la pression",
	"ui.editor.meteogram.attributes.precipitation": "Afficher les précipitations",
	"ui.editor.meteogram.attributes.weather_icons": "Afficher les icônes météo",
	"ui.editor.meteogram.attributes.wind": "Afficher le vent",
	"ui.editor.meteogram.attributes.dense_icons": "Icônes météo denses (chaque heure)",
	"ui.editor.meteogram.attributes.fill_container": "Remplir le conteneur"
};

var hrLocale = {
	"ui.card.meteogram.attribution": "Podaci od",
	"ui.card.meteogram.status.cached": "pohranjeno",
	"ui.card.meteogram.status.success": "uspjeh",
	"ui.card.meteogram.status.failed": "neuspjeh",
	"ui.card.meteogram.status_panel": "Panel statusa",
	"ui.card.meteogram.status.expires_at": "Istječe",
	"ui.card.meteogram.status.last_render": "Zadnje prikazivanje",
	"ui.card.meteogram.status.last_fingerprint_miss": "Zadnji promašaj otiska",
	"ui.card.meteogram.status.last_data_fetch": "Zadnje dohvaćanje podataka",
	"ui.card.meteogram.status.last_cached": "Zadnje pohranjeno",
	"ui.card.meteogram.status.api_success": "Uspjeh API-a",
	"ui.card.meteogram.error": "Podaci o vremenu nisu dostupni",
	"ui.card.meteogram.attributes.temperature": "Temperatura",
	"ui.card.meteogram.attributes.air_pressure": "Tlak zraka",
	"ui.card.meteogram.attributes.precipitation": "Oborine",
	"ui.card.meteogram.attributes.cloud_coverage": "Naoblaka",
	"ui.card.meteogram.attributes.weather_icons": "Prikaži ikone vremena",
	"ui.card.meteogram.attributes.wind": "Prikaži vjetar",
	"ui.card.meteogram.attributes.dense_icons": "Guste ikone vremena (svaki sat)",
	"ui.card.meteogram.attributes.fill_container": "Ispuni spremnik",
	"ui.editor.meteogram.title": "Postavke Meteogram kartice",
	"ui.editor.meteogram.title_label": "Naslov",
	"ui.editor.meteogram.title_description": "Naslov kartice (neobavezno, prikazuje se na vrhu kartice)",
	"ui.editor.meteogram.weather_entity": "Entitet vremena",
	"ui.editor.meteogram.choose_weather_entity": "Odaberite entitet vremena za integraciju Home Assistanta, ili odaberite 'None' za korištenje koordinata.",
	"ui.editor.meteogram.location_info": "Koordinate lokacije koriste se za dohvaćanje podataka o vremenu izravno s Met.no API-a.",
	"ui.editor.meteogram.using_ha_location": "Koristi se zadana lokacija Home Assistanta.",
	"ui.editor.meteogram.latitude": "Geografska širina",
	"ui.editor.meteogram.longitude": "Geografska dužina",
	"ui.editor.meteogram.altitude": "Nadmorska visina",
	"ui.editor.meteogram.optional": "Neobavezno",
	"ui.editor.meteogram.default": "Zadano",
	"ui.editor.meteogram.leave_empty": "Ostavite prazno za korištenje zadane lokacije Home Assistanta",
	"ui.editor.meteogram.display_options": "Opcije prikaza",
	"ui.editor.meteogram.display_mode": "Način prikaza",
	"ui.editor.meteogram.meteogram_length": "Duljina meteograma",
	"ui.editor.meteogram.hours_8": "8 sati",
	"ui.editor.meteogram.hours_12": "12 sati",
	"ui.editor.meteogram.hours_24": "24 sata",
	"ui.editor.meteogram.hours_48": "48 sati",
	"ui.editor.meteogram.hours_54": "54 sata",
	"ui.editor.meteogram.hours_max": "Maksimalno dostupno",
	"ui.editor.meteogram.choose_hours": "Odaberite koliko sati prikazati u meteogramu",
	"ui.editor.meteogram.attributes.cloud_coverage": "Prikaži naoblaku",
	"ui.editor.meteogram.attributes.air_pressure": "Prikaži tlak zraka",
	"ui.editor.meteogram.attributes.precipitation": "Prikaži oborine",
	"ui.editor.meteogram.attributes.weather_icons": "Prikaži ikone vremena",
	"ui.editor.meteogram.attributes.wind": "Prikaži vjetar",
	"ui.editor.meteogram.attributes.dense_icons": "Guste ikone vremena (svaki sat)",
	"ui.editor.meteogram.attributes.fill_container": "Ispuni spremnik"
};

var nlLocale = {
	"ui.card.meteogram.attribution": "Gegevens van",
	"ui.card.meteogram.status.cached": "gecached",
	"ui.card.meteogram.status.success": "geslaagd",
	"ui.card.meteogram.status.failed": "mislukt",
	"ui.card.meteogram.status_panel": "Statuspaneel",
	"ui.card.meteogram.status.expires_at": "Verloopt op",
	"ui.card.meteogram.status.last_render": "Laatste weergave",
	"ui.card.meteogram.status.last_fingerprint_miss": "Laatste vingerafdruk gemist",
	"ui.card.meteogram.status.last_data_fetch": "Laatste gegevensophaling",
	"ui.card.meteogram.status.last_cached": "Laatst gecached",
	"ui.card.meteogram.status.api_success": "API Succes",
	"ui.card.meteogram.error": "Weergegevens niet beschikbaar",
	"ui.card.meteogram.attributes.temperature": "Temperatuur",
	"ui.card.meteogram.attributes.air_pressure": "Luchtdruk",
	"ui.card.meteogram.attributes.precipitation": "Neerslag",
	"ui.card.meteogram.attributes.cloud_coverage": "Bewolking",
	"ui.card.meteogram.attributes.weather_icons": "Toon weericonen",
	"ui.card.meteogram.attributes.wind": "Toon wind",
	"ui.card.meteogram.attributes.dense_icons": "Dichte weericonen (elk uur)",
	"ui.card.meteogram.attributes.fill_container": "Vul container",
	"ui.editor.meteogram.title": "Meteogram kaartinstellingen",
	"ui.editor.meteogram.title_label": "Titel",
	"ui.editor.meteogram.title_description": "Kaarttitel (optioneel, wordt bovenaan de kaart weergegeven)",
	"ui.editor.meteogram.weather_entity": "Weerentiteit",
	"ui.editor.meteogram.choose_weather_entity": "Kies een weerentiteit voor Home Assistant integratie, of selecteer 'None' om coördinaten te gebruiken.",
	"ui.editor.meteogram.location_info": "Locatiecoördinaten worden gebruikt om weergegevens rechtstreeks op te halen van de Met.no API.",
	"ui.editor.meteogram.using_ha_location": "Gebruikt standaard de locatie van Home Assistant.",
	"ui.editor.meteogram.latitude": "Breedtegraad",
	"ui.editor.meteogram.longitude": "Lengtegraad",
	"ui.editor.meteogram.altitude": "Hoogte",
	"ui.editor.meteogram.optional": "Optioneel",
	"ui.editor.meteogram.default": "Standaard",
	"ui.editor.meteogram.leave_empty": "Laat leeg om de geconfigureerde locatie van Home Assistant te gebruiken",
	"ui.editor.meteogram.display_options": "Weergaveopties",
	"ui.editor.meteogram.display_mode": "Weergavemodus",
	"ui.editor.meteogram.meteogram_length": "Meteogram lengte",
	"ui.editor.meteogram.hours_8": "8 uur",
	"ui.editor.meteogram.hours_12": "12 uur",
	"ui.editor.meteogram.hours_24": "24 uur",
	"ui.editor.meteogram.hours_48": "48 uur",
	"ui.editor.meteogram.hours_54": "54 uur",
	"ui.editor.meteogram.hours_max": "Maximaal beschikbaar",
	"ui.editor.meteogram.choose_hours": "Kies hoeveel uur in het meteogram worden weergegeven",
	"ui.editor.meteogram.attributes.cloud_coverage": "Toon bewolking",
	"ui.editor.meteogram.attributes.air_pressure": "Toon luchtdruk",
	"ui.editor.meteogram.attributes.precipitation": "Toon neerslag",
	"ui.editor.meteogram.attributes.weather_icons": "Toon weericonen",
	"ui.editor.meteogram.attributes.wind": "Toon wind",
	"ui.editor.meteogram.attributes.dense_icons": "Dichte weericonen (elk uur)",
	"ui.editor.meteogram.attributes.fill_container": "Vul container"
};

var plLocale = {
	"ui.card.meteogram.attribution": "Dane z",
	"ui.card.meteogram.status.cached": "w pamięci podręcznej",
	"ui.card.meteogram.status.success": "sukces",
	"ui.card.meteogram.status.failed": "niepowodzenie",
	"ui.card.meteogram.status_panel": "Panel statusu",
	"ui.card.meteogram.status.expires_at": "Wygasa o",
	"ui.card.meteogram.status.last_render": "Ostatnie renderowanie",
	"ui.card.meteogram.status.last_fingerprint_miss": "Ostatnie pominięcie odcisku palca",
	"ui.card.meteogram.status.last_data_fetch": "Ostatnie pobranie danych",
	"ui.card.meteogram.status.last_cached": "Ostatnio w pamięci podręcznej",
	"ui.card.meteogram.status.api_success": "Sukces API",
	"ui.card.meteogram.error": "Dane pogodowe niedostępne",
	"ui.card.meteogram.attributes.temperature": "Temperatura",
	"ui.card.meteogram.attributes.air_pressure": "Ciśnienie",
	"ui.card.meteogram.attributes.precipitation": "Opady",
	"ui.card.meteogram.attributes.cloud_coverage": "Zachmurzenie",
	"ui.card.meteogram.attributes.weather_icons": "Pokaż ikony pogody",
	"ui.card.meteogram.attributes.wind": "Pokaż wiatr",
	"ui.card.meteogram.attributes.dense_icons": "Gęste ikony pogody (co godzinę)",
	"ui.card.meteogram.attributes.fill_container": "Wypełnij kontener",
	"ui.editor.meteogram.title": "Ustawienia karty Meteogram",
	"ui.editor.meteogram.title_label": "Tytuł",
	"ui.editor.meteogram.title_description": "Tytuł karty (opcjonalny, wyświetlany na górze karty)",
	"ui.editor.meteogram.weather_entity": "Encja pogodowa",
	"ui.editor.meteogram.choose_weather_entity": "Wybierz encję pogodową dla integracji Home Assistant lub wybierz 'None', aby użyć współrzędnych.",
	"ui.editor.meteogram.location_info": "Współrzędne lokalizacji będą używane do pobierania danych pogodowych bezpośrednio z API Met.no.",
	"ui.editor.meteogram.using_ha_location": "Domyślnie używana jest lokalizacja Home Assistant.",
	"ui.editor.meteogram.latitude": "Szerokość geograficzna",
	"ui.editor.meteogram.longitude": "Długość geograficzna",
	"ui.editor.meteogram.altitude": "Wysokość",
	"ui.editor.meteogram.optional": "Opcjonalne",
	"ui.editor.meteogram.default": "Domyślnie",
	"ui.editor.meteogram.leave_empty": "Pozostaw puste, aby użyć skonfigurowanej lokalizacji Home Assistant",
	"ui.editor.meteogram.display_options": "Opcje wyświetlania",
	"ui.editor.meteogram.display_mode": "Tryb wyświetlania",
	"ui.editor.meteogram.meteogram_length": "Długość meteogramu",
	"ui.editor.meteogram.hours_8": "8 godzin",
	"ui.editor.meteogram.hours_12": "12 godzin",
	"ui.editor.meteogram.hours_24": "24 godziny",
	"ui.editor.meteogram.hours_48": "48 godzin",
	"ui.editor.meteogram.hours_54": "54 godziny",
	"ui.editor.meteogram.hours_max": "Maksymalnie dostępne",
	"ui.editor.meteogram.choose_hours": "Wybierz ile godzin pokazać w meteogramie",
	"ui.editor.meteogram.attributes.cloud_coverage": "Pokaż zachmurzenie",
	"ui.editor.meteogram.attributes.air_pressure": "Pokaż ciśnienie",
	"ui.editor.meteogram.attributes.precipitation": "Pokaż opady",
	"ui.editor.meteogram.attributes.weather_icons": "Pokaż ikony pogody",
	"ui.editor.meteogram.attributes.wind": "Pokaż wiatr",
	"ui.editor.meteogram.attributes.dense_icons": "Gęste ikony pogody (co godzinę)",
	"ui.editor.meteogram.attributes.fill_container": "Wypełnij kontener"
};

var csLocale = {
	"ui.card.meteogram.attribution": "Data z",
	"ui.card.meteogram.status.cached": "uloženo v mezipaměti",
	"ui.card.meteogram.status.success": "úspěch",
	"ui.card.meteogram.status.failed": "selhalo",
	"ui.card.meteogram.status_panel": "Stavový panel",
	"ui.card.meteogram.status.expires_at": "Vyprší v",
	"ui.card.meteogram.status.last_render": "Poslední vykreslení",
	"ui.card.meteogram.status.last_fingerprint_miss": "Poslední chybějící otisk",
	"ui.card.meteogram.status.last_data_fetch": "Poslední načtení dat",
	"ui.card.meteogram.status.last_cached": "Naposledy uloženo",
	"ui.card.meteogram.status.api_success": "API úspěch",
	"ui.card.meteogram.error": "Meteorologická data nejsou k dispozici",
	"ui.card.meteogram.attributes.temperature": "Teplota",
	"ui.card.meteogram.attributes.air_pressure": "Tlak",
	"ui.card.meteogram.attributes.precipitation": "Srážky",
	"ui.card.meteogram.attributes.cloud_coverage": "Oblačnost",
	"ui.card.meteogram.attributes.weather_icons": "Zobrazit ikony počasí",
	"ui.card.meteogram.attributes.wind": "Zobrazit vítr",
	"ui.card.meteogram.attributes.dense_icons": "Husté ikony počasí (každou hodinu)",
	"ui.card.meteogram.attributes.fill_container": "Vyplnit kontejner",
	"ui.editor.meteogram.title": "Nastavení karty Meteogram",
	"ui.editor.meteogram.title_label": "Název",
	"ui.editor.meteogram.title_description": "Název karty (volitelné, zobrazuje se v horní části karty)",
	"ui.editor.meteogram.weather_entity": "Entita počasí",
	"ui.editor.meteogram.choose_weather_entity": "Vyberte entitu počasí pro integraci Home Assistant, nebo vyberte 'None' pro použití souřadnic.",
	"ui.editor.meteogram.location_info": "Souřadnice polohy budou použity pro získání meteorologických dat přímo z API Met.no.",
	"ui.editor.meteogram.using_ha_location": "Ve výchozím nastavení se používá poloha Home Assistant.",
	"ui.editor.meteogram.latitude": "Zeměpisná šířka",
	"ui.editor.meteogram.longitude": "Zeměpisná délka",
	"ui.editor.meteogram.altitude": "Nadmořská výška",
	"ui.editor.meteogram.optional": "Volitelné",
	"ui.editor.meteogram.default": "Výchozí",
	"ui.editor.meteogram.leave_empty": "Ponechte prázdné pro použití nakonfigurované polohy Home Assistant",
	"ui.editor.meteogram.display_options": "Možnosti zobrazení",
	"ui.editor.meteogram.display_mode": "Režim zobrazení",
	"ui.editor.meteogram.meteogram_length": "Délka meteogramu",
	"ui.editor.meteogram.hours_8": "8 hodin",
	"ui.editor.meteogram.hours_12": "12 hodin",
	"ui.editor.meteogram.hours_24": "24 hodin",
	"ui.editor.meteogram.hours_48": "48 hodin",
	"ui.editor.meteogram.hours_54": "54 hodin",
	"ui.editor.meteogram.hours_max": "Maximálně dostupné",
	"ui.editor.meteogram.choose_hours": "Vyberte, kolik hodin se má zobrazit v meteogramu",
	"ui.editor.meteogram.attributes.cloud_coverage": "Zobrazit oblačnost",
	"ui.editor.meteogram.attributes.air_pressure": "Zobrazit tlak",
	"ui.editor.meteogram.attributes.precipitation": "Zobrazit srážky",
	"ui.editor.meteogram.attributes.weather_icons": "Zobrazit ikony počasí",
	"ui.editor.meteogram.attributes.wind": "Zobrazit vítr",
	"ui.editor.meteogram.attributes.dense_icons": "Husté ikony počasí (každou hodinu)",
	"ui.editor.meteogram.attributes.fill_container": "Vyplnit kontejner"
};

// Array of supported locales and their language codes
const locales = [
    { code: "en", data: enLocale },
    { code: "nb", data: nbLocale },
    { code: "es", data: esLocale },
    { code: "it", data: itLocale },
    { code: "de", data: deLocale },
    { code: "fr", data: frLocale },
    { code: "hr", data: hrLocale },
    { code: "nl", data: nlLocale },
    { code: "pl", data: plLocale },
    { code: "cs", data: csLocale },
];
function trnslt(hass, key, fallback) {
    var _a;
    // Try hass.localize (used by HA frontend)
    if (hass && typeof hass.localize === "function") {
        const result = hass.localize(key);
        if (result && result !== key)
            return result;
    }
    // Try hass.resources (used by HA backend)
    if (hass && hass.resources && typeof hass.resources === "object") {
        const lang = hass.language || "en";
        const res = (_a = hass.resources[lang]) === null || _a === void 0 ? void 0 : _a[key];
        if (res)
            return res;
    }
    // Try local translation files
    const lang = (hass && hass.language) ? hass.language : "en";
    // Find the best matching locale by prefix
    const localeObj = locales.find(l => lang.toLowerCase().startsWith(l.code)) ||
        locales[0]; // Default to English if not found
    const localRes = localeObj.data[key];
    if (localRes)
        return localRes;
    // Return fallback if provided, otherwise the key
    return fallback !== undefined ? fallback : key;
}

let MeteogramCardEditor = class MeteogramCardEditor extends i {
    constructor() {
        super(...arguments);
        this._config = {};
        this._initialized = false;
        this._elements = new Map();
    }
    setConfig(config) {
        this._config = config || {};
        if (this._initialized) {
            this._updateValues();
        }
        else {
            this._initialize();
        }
        // Only emit minimal config if this is the initial setup (empty config)
        if (Object.keys(this._config).length === 0 || Object.keys(config).length === 0) {
            this._emitMinimalConfig();
        }
        else {
            // For subsequent loads/edits, emit the full config as-is
            this.dispatchEvent(new CustomEvent('config-changed', {
                detail: { config: { ...this._config } }
            }));
        }
    }
    _emitMinimalConfig() {
        const defaultConfig = {
            title: '',
            latitude: undefined,
            longitude: undefined,
            altitude: undefined,
            show_cloud_cover: true,
            show_pressure: true,
            show_precipitation: true, // treat true as default for minimalization
            show_weather_icons: true,
            show_wind: true,
            dense_weather_icons: true,
            meteogram_hours: '48h',
            styles: undefined,
            diagnostics: false,
            entity_id: undefined,
            focussed: false,
            display_mode: 'full',
            aspect_ratio: '16:9',
            layout_mode: 'sections',
        };
        const minimalConfig = {};
        Object.keys(this._config).forEach((key) => {
            const value = this._config[key];
            const def = defaultConfig[key];
            if (typeof def === 'undefined') {
                if (typeof value !== 'undefined')
                    minimalConfig[key] = value;
            }
            else if (value !== def) {
                minimalConfig[key] = value;
            }
        });
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: minimalConfig }
        }));
    }
    get config() {
        return this._config;
    }
    connectedCallback() {
        if (!this._initialized) {
            this._initialize();
        }
    }
    _initialize() {
        this.render();
        this._initialized = true;
        setTimeout(() => this._updateValues(), 0); // Wait for DOM to be ready
    }
    // Update only the values, not the entire DOM
    _updateValues() {
        var _a, _b, _c, _d, _e, _f;
        if (!this._initialized)
            return;
        // Helper to update only if value changed
        const setValue = (el, value, prop = 'value') => {
            if (!el)
                return;
            if (el[prop] !== value)
                el[prop] = value;
        };
        setValue(this._elements.get('title'), this._config.title || '');
        setValue(this._elements.get('latitude'), this._config.latitude !== undefined
            ? String(this._config.latitude)
            : (((_b = (_a = this.hass) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.latitude) !== undefined ? String(this.hass.config.latitude) : ''));
        setValue(this._elements.get('longitude'), this._config.longitude !== undefined
            ? String(this._config.longitude)
            : (((_d = (_c = this.hass) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.longitude) !== undefined ? String(this.hass.config.longitude) : ''));
        setValue(this._elements.get('altitude'), this._config.altitude !== undefined
            ? String(this._config.altitude)
            : (((_f = (_e = this.hass) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.altitude) !== undefined ? String(this.hass.config.altitude) : ''), 'value');
        setValue(this._elements.get('show_cloud_cover'), this._config.show_cloud_cover !== undefined ? this._config.show_cloud_cover : true, 'checked');
        setValue(this._elements.get('show_pressure'), this._config.show_pressure !== undefined ? this._config.show_pressure : true, 'checked');
        setValue(this._elements.get('show_precipitation'), this._config.show_precipitation !== undefined ? this._config.show_precipitation : true, 'checked');
        setValue(this._elements.get('show_weather_icons'), this._config.show_weather_icons !== undefined ? this._config.show_weather_icons : true, 'checked');
        setValue(this._elements.get('show_wind'), this._config.show_wind !== undefined ? this._config.show_wind : true, 'checked');
        setValue(this._elements.get('dense_weather_icons'), this._config.dense_weather_icons !== undefined ? this._config.dense_weather_icons : true, 'checked');
        setValue(this._elements.get('meteogram_hours'), this._config.meteogram_hours || '48h');
        setValue(this._elements.get('diagnostics'), this._config.diagnostics !== undefined ? this._config.diagnostics : false, 'checked');
        setValue(this._elements.get('entity_id'), this._config.entity_id || '');
        setValue(this._elements.get('focussed'), this._config.focussed !== undefined ? this._config.focussed : false, 'checked');
        setValue(this._elements.get('display_mode'), this._config.display_mode || 'full');
        setValue(this._elements.get('aspect_ratio'), this._config.aspect_ratio || '16:9');
    }
    render() {
        var _a, _b, _c, _d, _e, _f, _g;
        const hass = this.hass;
        const config = this._config;
        // Wait for both hass and config to be set before rendering
        if (!hass || !config) {
            this.innerHTML = '<ha-card><div style="padding:16px;">Loading Home Assistant context...</div></ha-card>';
            setTimeout(() => this.render(), 300); // Retry every 300ms until both are set
            return;
        }
        // Get default coordinates from Home Assistant config if available
        const defaultLat = (_b = (_a = hass === null || hass === void 0 ? void 0 : hass.config) === null || _a === void 0 ? void 0 : _a.latitude) !== null && _b !== void 0 ? _b : '';
        const defaultLon = (_d = (_c = hass === null || hass === void 0 ? void 0 : hass.config) === null || _c === void 0 ? void 0 : _c.longitude) !== null && _d !== void 0 ? _d : '';
        const defaultAlt = (_f = (_e = hass === null || hass === void 0 ? void 0 : hass.config) === null || _e === void 0 ? void 0 : _e.altitude) !== null && _f !== void 0 ? _f : '';
        // Get current toggle values or default to true
        const showCloudCover = this._config.show_cloud_cover !== undefined ? this._config.show_cloud_cover : true;
        const showPressure = this._config.show_pressure !== undefined ? this._config.show_pressure : true;
        const showWeatherIcons = this._config.show_weather_icons !== undefined ? this._config.show_weather_icons : true;
        const showWind = this._config.show_wind !== undefined ? this._config.show_wind : true;
        const denseWeatherIcons = this._config.dense_weather_icons !== undefined ? this._config.dense_weather_icons : true;
        const meteogramHours = this._config.meteogram_hours || "48h";
        const diagnostics = this._config.diagnostics !== undefined ? this._config.diagnostics : false;
        this._config.focussed !== undefined ? this._config.focussed : false;
        const displayMode = this._config.display_mode || 'full';
        const aspectRatio = this._config.aspect_ratio || "16:9";
        const div = document.createElement('div');
        const layoutMode = this._config.layout_mode || "sections";
        // Get all weather entities from hass
        const weatherEntities = hass && hass.states
            ? Object.keys(hass.states).filter(eid => eid.startsWith('weather.'))
            : [];
        // Add "none" option at the top
        // If entity_id is not set, default to 'none' (not first weather entity)
        const selectedEntity = (_g = this._config.entity_id) !== null && _g !== void 0 ? _g : 'none';
        const isWeatherEntitySelected = !!(selectedEntity && selectedEntity !== 'none');
        div.innerHTML = `
  <style>
    ha-card {
      padding: 16px;
    }
    .values {
      padding-left: 16px;
      margin: 8px 0;
    }
    .row {
      display: flex;
      margin-bottom: 12px;
      align-items: center;
    }
    ha-textfield {
      width: 100%;
    }
    .side-by-side {
      display: flex;
      gap: 12px;
    }
    .side-by-side > * {
      flex: 1;
    }
    h3 {
      font-size: 18px;
      color: var(--primary-text-color);
      font-weight: 500;
      margin-bottom: 12px;
      margin-top: 0;
    }
    .help-text {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      margin-top: 4px;
    }
    .info-text {
      color: var(--primary-text-color);
      opacity: 0.8;
      font-size: 0.9rem;
      font-style: italic;
      margin: 4px 0 16px 0;
    }
    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .toggle-label {
      flex-grow: 1;
    }
    .toggle-section {
      margin-top: 16px;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
  </style>
  <ha-card>
    <h3>${(hass === null || hass === void 0 ? void 0 : hass.localize) ? hass.localize("ui.editor.meteogram.title") : "Meteogram Card Settings"}</h3>
    <div class="values">
      <div class="row">
        <ha-textfield
          label="${(hass === null || hass === void 0 ? void 0 : hass.localize) ? hass.localize("ui.editor.meteogram.title_label") : "Title"}"
          id="title-input"
          .value="${this._config.title || ''}"
        ></ha-textfield>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.title_description", "Card title (optional, shown at the top of the card)")}</p>

      <div class="row">
        <label for="weather-entity-select" style="margin-right:8px;">${trnslt(hass, "ui.editor.meteogram.weather_entity", "Weather Entity")}</label>
        <select id="weather-entity-select">
          <option value="none" ${!isWeatherEntitySelected ? "selected" : ""}>None</option>
          ${weatherEntities.map(eid => `<option value="${eid}" ${selectedEntity === eid ? "selected" : ""}>${eid}</option>`).join('')}
        </select>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.choose_weather_entity", "Choose a weather entity for Home Assistant integration, or select 'None' to use coordinates.")}</p>

      <div class="info-text">
        ${(hass === null || hass === void 0 ? void 0 : hass.localize) ? hass.localize("ui.editor.meteogram.location_info") : "Location coordinates will be used to fetch weather data directly from Met.no API."}
        ${defaultLat ? trnslt(hass, "ui.editor.meteogram.using_ha_location", "Using Home Assistant's location by default.") : ""}
      </div>

      <div class="side-by-side">
        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.latitude", "Latitude")}"
          id="latitude-input"
          type="number"
          step="any"
          .value="${this._config.latitude !== undefined ? this._config.latitude : defaultLat}"
          placeholder="${defaultLat ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultLat}` : ""}"
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>

        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.longitude", "Longitude")}"
          id="longitude-input"
          type="number"
          step="any"
          .value="${this._config.longitude !== undefined ? this._config.longitude : defaultLon}"
          placeholder="${defaultLon ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultLon}` : ""}"
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>

        <ha-textfield
          label="${trnslt(hass, "ui.editor.meteogram.altitude", "Altitude")}"
          id="altitude-input"
          type="number"
          step="any"
          .value="${this._config.altitude !== undefined ? this._config.altitude : defaultAlt}"
          placeholder="${defaultAlt ? `${trnslt(hass, "ui.editor.meteogram.default", "Default")}: ${defaultAlt}` : trnslt(hass, "ui.editor.meteogram.optional", "Optional")}" 
          ${isWeatherEntitySelected ? "disabled" : ""}
        ></ha-textfield>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.leave_empty", "Leave empty to use Home Assistant's configured location")}</p>

      <div class="toggle-section">
        <h3>${trnslt(hass, "ui.editor.meteogram.display_options", "Display Options")}</h3>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.cloud_coverage", "Show Cloud Cover")}</div>
          <ha-switch
            id="show-cloud-cover"
            .checked="${showCloudCover}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.air_pressure", "Show Pressure")}</div>
          <ha-switch
            id="show-pressure"
            .checked="${showPressure}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.precipitation", "Show Precipitation (Rain & Snow)")}</div>
          <ha-switch
            id="show-precipitation"
            .checked="${this._config.show_precipitation !== undefined ? this._config.show_precipitation : true}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.weather_icons", "Show Weather Icons")}</div>
          <ha-switch
            id="show-weather-icons"
            .checked="${showWeatherIcons}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.wind", "Show Wind")}</div>
          <ha-switch
            id="show-wind"
            .checked="${showWind}"
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.attributes.dense_icons", "Dense Weather Icons (every hour)")}</div>
          <ha-switch
            id="dense-weather-icons"
            .checked="${denseWeatherIcons}"
          ></ha-switch>
        </div>
      
        <div class="toggle-row">
          <div class="toggle-label">${trnslt(hass, "ui.editor.meteogram.display_mode", "Display Mode")}</div>
          <select id="display-mode-select">
            <option value="full" ${displayMode === "full" ? "selected" : ""}>Full (all features)</option>
            <option value="core" ${displayMode === "core" ? "selected" : ""}>Core (dates & numbers only)</option>
            <option value="focussed" ${displayMode === "focussed" ? "selected" : ""}>Focussed (minimal)</option>
          </select>
        </div>
      </div>

      <div class="row">
        <label for="meteogram-hours-select" style="margin-right:8px;">${trnslt(hass, "ui.editor.meteogram.meteogram_length", "Meteogram Length")}</label>
        <select id="meteogram-hours-select">
          <option value="8" ${meteogramHours === "8h" || meteogramHours === 8 ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_8", "8 hours")}</option>
          <option value="12" ${meteogramHours === "12h" || meteogramHours === 12 ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_12", "12 hours")}</option>
          <option value="24" ${meteogramHours === "24h" || meteogramHours === 24 ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_24", "24 hours")}</option>
          <option value="48" ${meteogramHours === "48h" || meteogramHours === 48 ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_48", "48 hours")}</option>
          <option value="72" ${meteogramHours === 72 ? "selected" : ""}>72 hours</option>
          <option value="96" ${meteogramHours === 96 ? "selected" : ""}>96 hours</option>
          <option value="120" ${meteogramHours === 120 ? "selected" : ""}>120 hours</option>
          <option value="max" ${meteogramHours === "max" ? "selected" : ""}>${trnslt(hass, "ui.editor.meteogram.hours_max", "Max available")}</option>
          <option value="custom" ${typeof meteogramHours === 'number' && ![8, 12, 24, 48, 72, 96, 120].includes(meteogramHours) ? "selected" : ""}>Custom...</option>
        </select>
      </div>
      <div class="row custom-hours-row" style="display: ${typeof meteogramHours === 'number' && ![8, 12, 24, 48, 72, 96, 120].includes(meteogramHours) ? 'flex' : 'none'}; align-items: center; gap: 8px; margin-top: 8px;">
        <label for="custom-hours-input" style="margin-right:8px;">Custom hours:</label>
        <input type="number" id="custom-hours-input" min="1" max="999" step="1" 
               value="${typeof meteogramHours === 'number' ? meteogramHours : 48}" 
               style="width: 80px; padding: 4px;">
        <span style="color: var(--secondary-text-color); font-size: 0.9em;">hours</span>
      </div>
      <p class="help-text">${trnslt(hass, "ui.editor.meteogram.choose_hours", "Choose how many hours to show in the meteogram")}</p>

      ${["panel", "grid"].includes(layoutMode) ? `
      <div class="row">
        <label for="aspect-ratio-select" style="margin-right:8px;">Aspect Ratio</label>
        <select id="aspect-ratio-select">
          <option value="16:9" ${aspectRatio === "16:9" ? "selected" : ""}>16:9 (Widescreen)</option>
          <option value="4:3" ${aspectRatio === "4:3" ? "selected" : ""}>4:3 (Classic)</option>
          <option value="1:1" ${aspectRatio === "1:1" ? "selected" : ""}>1:1 (Square)</option>
          <option value="21:9" ${aspectRatio === "21:9" ? "selected" : ""}>21:9 (Ultra-wide)</option>
          <option value="3:2" ${aspectRatio === "3:2" ? "selected" : ""}>3:2</option>
          <option value="custom" ${!["16:9", "4:3", "1:1", "21:9", "3:2"].includes(aspectRatio) ? "selected" : ""}>Custom</option>
        </select>
        <input id="aspect-ratio-custom" type="text" placeholder="e.g. 1.6 or 5:3" style="margin-left:8px; width:90px;" value="${!["16:9", "4:3", "1:1", "21:9", "3:2"].includes(aspectRatio) ? aspectRatio : ''}" ${!["16:9", "4:3", "1:1", "21:9", "3:2"].includes(aspectRatio) ? '' : 'disabled'}>
      </div>
      <p class="help-text">Set the aspect ratio for the chart area. Use a ratio like 16:9, 4:3, 1:1, or a custom value (e.g. 1.6 or 5:3).</p>
      ` : ""}

      ${version.includes("beta") ? `
      <div class="toggle-section"></div>
        <div class="toggle-row">
          <div class="toggle-label">Diagnostics (debug logging)</div>
          <ha-switch
            id="diagnostics"
            .checked="${diagnostics}"
          ></ha-switch>
        </div>
      ` : ""}
      </div>
    </div>
  </ha-card>
`;
        // Clear previous content
        this.innerHTML = '';
        // Append new content
        this.appendChild(div);
        // Set up event listeners after DOM is updated
        setTimeout(() => {
            // Get and store references to all input elements with proper type casting
            const titleInput = this.querySelector('#title-input');
            if (titleInput) {
                titleInput.configValue = 'title';
                titleInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('title', titleInput);
            }
            const latInput = this.querySelector('#latitude-input');
            if (latInput) {
                latInput.configValue = 'latitude';
                latInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('latitude', latInput);
            }
            const lonInput = this.querySelector('#longitude-input');
            if (lonInput) {
                lonInput.configValue = 'longitude';
                lonInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('longitude', lonInput);
            }
            const altitudeInput = this.querySelector('#altitude-input');
            if (altitudeInput) {
                altitudeInput.configValue = 'altitude';
                altitudeInput.addEventListener('input', this._valueChanged.bind(this));
                this._elements.set('altitude', altitudeInput);
            }
            // Set up toggle switches
            const cloudCoverSwitch = this.querySelector('#show-cloud-cover');
            if (cloudCoverSwitch) {
                cloudCoverSwitch.configValue = 'show_cloud_cover';
                cloudCoverSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_cloud_cover', cloudCoverSwitch);
            }
            const pressureSwitch = this.querySelector('#show-pressure');
            if (pressureSwitch) {
                pressureSwitch.configValue = 'show_pressure';
                pressureSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_pressure', pressureSwitch);
            }
            const rainSwitch = this.querySelector('#show-precipitation');
            if (rainSwitch) {
                rainSwitch.configValue = 'show_precipitation';
                rainSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_precipitation', rainSwitch);
            }
            const weatherIconsSwitch = this.querySelector('#show-weather-icons');
            if (weatherIconsSwitch) {
                weatherIconsSwitch.configValue = 'show_weather_icons';
                weatherIconsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_weather_icons', weatherIconsSwitch);
            }
            const windSwitch = this.querySelector('#show-wind');
            if (windSwitch) {
                windSwitch.configValue = 'show_wind';
                windSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('show_wind', windSwitch);
            }
            const denseWeatherIconsSwitch = this.querySelector('#dense-weather-icons');
            if (denseWeatherIconsSwitch) {
                denseWeatherIconsSwitch.configValue = 'dense_weather_icons';
                denseWeatherIconsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('dense_weather_icons', denseWeatherIconsSwitch);
            }
            const meteogramHoursSelect = this.querySelector('#meteogram-hours-select');
            const customHoursRow = this.querySelector('.custom-hours-row');
            const customHoursInput = this.querySelector('#custom-hours-input');
            if (meteogramHoursSelect) {
                meteogramHoursSelect.configValue = 'meteogram_hours';
                meteogramHoursSelect.addEventListener('change', (ev) => {
                    const value = ev.target.value;
                    // Show/hide custom hours input
                    if (customHoursRow) {
                        customHoursRow.style.display = value === 'custom' ? 'flex' : 'none';
                    }
                    // If "custom" is selected, focus on the custom input and use its value
                    if (value === 'custom') {
                        if (customHoursInput) {
                            customHoursInput.focus();
                            // Use the custom input value
                            const customValue = parseInt(customHoursInput.value, 10);
                            if (!isNaN(customValue)) {
                                this._updateConfig('meteogram_hours', customValue);
                            }
                        }
                    }
                    else {
                        // Use the selected preset (convert to numeric or keep "max")
                        const configValue = value === 'max' ? 'max' : parseInt(value, 10);
                        this._updateConfig('meteogram_hours', configValue);
                    }
                });
                this._elements.set('meteogram_hours', meteogramHoursSelect);
            }
            if (customHoursInput) {
                customHoursInput.configValue = 'meteogram_hours';
                customHoursInput.addEventListener('input', (ev) => {
                    const value = parseInt(ev.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                        this._updateConfig('meteogram_hours', value);
                    }
                });
            }
            const diagnosticsSwitch = this.querySelector('#diagnostics');
            if (diagnosticsSwitch) {
                diagnosticsSwitch.configValue = 'diagnostics';
                diagnosticsSwitch.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('diagnostics', diagnosticsSwitch);
            }
            const weatherEntitySelect = this.querySelector('#weather-entity-select');
            if (weatherEntitySelect) {
                weatherEntitySelect.configValue = 'entity_id';
                weatherEntitySelect.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('entity_id', weatherEntitySelect);
            }
            const displayModeSelect = this.querySelector('#display-mode-select');
            if (displayModeSelect) {
                displayModeSelect.configValue = 'display_mode';
                displayModeSelect.addEventListener('change', this._valueChanged.bind(this));
                this._elements.set('display_mode', displayModeSelect);
            }
            const aspectRatioSelect = this.querySelector('#aspect-ratio-select');
            const aspectRatioCustom = this.querySelector('#aspect-ratio-custom');
            if (aspectRatioSelect) {
                aspectRatioSelect.configValue = 'aspect_ratio';
                aspectRatioSelect.addEventListener('change', () => {
                    if (aspectRatioSelect.value === 'custom') {
                        aspectRatioCustom.disabled = false;
                        aspectRatioCustom.focus();
                    }
                    else {
                        aspectRatioCustom.disabled = true;
                        this._config = { ...this._config, aspect_ratio: String(aspectRatioSelect.value) };
                        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
                    }
                });
                this._elements.set('aspect_ratio', aspectRatioSelect);
            }
            if (aspectRatioCustom) {
                aspectRatioCustom.configValue = 'aspect_ratio';
                aspectRatioCustom.addEventListener('input', () => {
                    if (aspectRatioSelect.value === 'custom') {
                        this._config = { ...this._config, aspect_ratio: String(aspectRatioCustom.value) };
                        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
                    }
                });
                this._elements.set('aspect_ratio_custom', aspectRatioCustom);
            }
            // Disable/enable lat/lon/altitude fields based on weather entity selection
            if (latInput)
                latInput.disabled = isWeatherEntitySelected;
            if (lonInput)
                lonInput.disabled = isWeatherEntitySelected;
            if (altitudeInput)
                altitudeInput.disabled = isWeatherEntitySelected;
            // Update values after setting up elements and listeners
            this._updateValues();
        }, 0);
    }
    // Add the missing _valueChanged method
    _valueChanged(ev) {
        var _a;
        const target = ev.target;
        if (!this._config || !target || !target.configValue)
            return;
        let newValue = target.value;
        // List of boolean config fields
        const boolFields = [
            'show_cloud_cover', 'show_pressure', 'show_precipitation', 'show_weather_icons',
            'show_wind', 'dense_weather_icons', 'diagnostics', 'focussed'
        ];
        // Handle different input types
        if (target.tagName === 'HA-SWITCH') {
            newValue = target.checked;
        }
        else if (target.type === 'number') {
            if (newValue === '') {
                newValue = undefined;
            }
            else {
                const numValue = parseFloat((_a = newValue === null || newValue === void 0 ? void 0 : newValue.toString()) !== null && _a !== void 0 ? _a : '');
                if (!isNaN(numValue)) {
                    newValue = numValue;
                }
            }
        }
        else if (newValue === '') {
            newValue = undefined;
        }
        if (boolFields.includes(target.configValue)) {
            if (newValue === "") {
                newValue = undefined;
            }
            else if (typeof newValue !== "boolean" && typeof newValue !== "undefined") {
                newValue = Boolean(newValue);
            }
        }
        // Special handling for weather entity selection
        if (target.configValue === 'entity_id') {
            if (newValue === 'none') {
                newValue = undefined;
            }
            setTimeout(() => {
                const latInput = this.querySelector('#latitude-input');
                const lonInput = this.querySelector('#longitude-input');
                const altitudeInput = this.querySelector('#altitude-input');
                const isWeatherEntitySelected = !!(newValue && newValue !== 'none');
                if (latInput)
                    latInput.disabled = isWeatherEntitySelected;
                if (lonInput)
                    lonInput.disabled = isWeatherEntitySelected;
                if (altitudeInput)
                    altitudeInput.disabled = isWeatherEntitySelected;
            }, 0);
        }
        // In _valueChanged, handle displayMode as a string
        if (target.configValue === 'display_mode') {
            const allowedModes = ['full', 'core', 'focussed'];
            const modeValue = allowedModes.includes(target.value) ? target.value : undefined;
            this._config = {
                ...this._config,
                display_mode: modeValue
            };
        }
        else {
            let configValue;
            if (boolFields.includes(target.configValue)) {
                if (typeof newValue === "undefined") {
                    configValue = undefined;
                }
                else {
                    configValue = Boolean(newValue);
                }
            }
            else {
                configValue = newValue;
            }
            if (target.configValue === 'show_precipitation') {
                // Only set show_precipitation if user has toggled it away from the default (true)
                if (configValue === false) {
                    this._config = {
                        ...this._config,
                        show_precipitation: false
                    };
                }
                else {
                    // Remove show_precipitation if true (default)
                    const { show_precipitation, ...rest } = this._config;
                    this._config = { ...rest };
                }
            }
            else {
                this._config = {
                    ...this._config,
                    [target.configValue]: configValue
                };
            }
        }
        // After initial setup, always emit the full config (all user-set options)
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: { ...this._config } }
        }));
    }
    // Ensure _updateConfig method exists and handles generic property updates:
    _updateConfig(property, value) {
        this._config = { ...this._config, [property]: value };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
    }
};
__decorate([
    n({ type: Object })
], MeteogramCardEditor.prototype, "_config", void 0);
__decorate([
    n({ type: Object })
], MeteogramCardEditor.prototype, "hass", void 0);
__decorate([
    r()
], MeteogramCardEditor.prototype, "_initialized", void 0);
MeteogramCardEditor = __decorate([
    t('meteogram-card-editor')
], MeteogramCardEditor);

// Helper to detect client name from user agent
function getClientName() {
    const ua = navigator.userAgent;
    if (/Home Assistant/.test(ua))
        return "HA Companion";
    if (/Edg/.test(ua))
        return "Edge";
    if (/Chrome/.test(ua))
        return "Chrome";
    if (/Android/.test(ua))
        return "Android";
    if (/iPhone|iPad|iPod/.test(ua))
        return "iOS";
    if (/Firefox/.test(ua))
        return "Firefox";
    return "Unknown";
}

class WeatherAPI {
    constructor(lat, lon, altitude, debug = false) {
        this.lastError = null;
        this.lastStatusCode = null;
        this._forecastData = null;
        this._expiresAt = null;
        this._fetchPromise = null;
        this._lastFetchTime = null; // Track last fetch timestamp
        this.lat = lat;
        this.lon = lon;
        this.debug = debug;
        if (Number.isFinite(altitude)) {
            this.altitude = altitude;
        }
    }
    _debugLog(...args) {
        if (this.debug) {
            console.debug(...args);
        }
    }
    // Getter for forecastData: checks expiry and refreshes if needed
    async getForecastData() {
        this._debugLog(`[weather-api] getForecastData called for lat=${this.lat}, lon=${this.lon}`);
        // If no data loaded, try to load from cache first
        if (!this._forecastData) {
            this.loadCacheFromStorage();
        }
        // If cache is valid, return it
        if (this._forecastData && this._expiresAt && Date.now() < this._expiresAt) {
            return this._forecastData;
        }
        // Only one fetch at a time, and throttle to 1 per 60 seconds
        const now = Date.now();
        if (this._lastFetchTime &&
            now - this._lastFetchTime < 60000) {
            // If there's an active fetch, wait for it
            if (this._fetchPromise) {
                await this._fetchPromise;
                return this._forecastData;
            }
            // If we're in throttle period but no active fetch, return cached data if available
            // This prevents the "retrying in 60 seconds" issue when fetch failed
            if (this._forecastData) {
                this._debugLog('[weather-api] Using expired cached data during throttle period');
                return this._forecastData;
            }
        }
        if (!this._fetchPromise) {
            this._fetchPromise = this._fetchWeatherDataFromAPI();
        }
        try {
            await this._fetchPromise;
        }
        finally {
            this._fetchPromise = null;
        }
        // Final safeguard: if we still don't have data, throw an error
        if (!this._forecastData) {
            throw new Error('Weather data fetch completed but no valid data was obtained');
        }
        return this._forecastData;
    }
    get expiresAt() {
        return this._expiresAt;
    }
    getDiagnosticText() {
        var _a;
        let diag = `<br><b>Weather API Error</b><br>`;
        if (this.lastError instanceof Error) {
            diag += `Error: <code>${this.lastError.message}</code><br>`;
        }
        else if (this.lastError !== undefined && this.lastError !== null) {
            diag += `Error: <code>${String(this.lastError)}</code><br>`;
        }
        diag += `Status: <code>${(_a = this.lastStatusCode) !== null && _a !== void 0 ? _a : ""}</code><br>`;
        diag += `Card version: <code>${version}</code><br>`;
        diag += `Client type: <code>${navigator.userAgent}</code><br>`;
        return diag;
    }
    getDiagnosticInfo() {
        var _a, _b;
        return {
            apiType: 'MET.no Weather API',
            hasData: !!this._forecastData,
            dataTimeLength: ((_b = (_a = this._forecastData) === null || _a === void 0 ? void 0 : _a.time) === null || _b === void 0 ? void 0 : _b.length) || 0,
            lastFetchTime: this._lastFetchTime ? new Date(this._lastFetchTime).toISOString() : 'never',
            lastFetchFormatted: this._lastFetchTime ? new Date(this._lastFetchTime).toLocaleString() : 'not yet fetched',
            dataAgeMinutes: this._lastFetchTime ? Math.round((Date.now() - this._lastFetchTime) / (60 * 1000)) : 'n/a',
            expiresAt: this._expiresAt,
            expiresAtFormatted: this._expiresAt ? new Date(this._expiresAt).toLocaleString() : 'not set',
            isExpired: this._expiresAt ? Date.now() > this._expiresAt : false,
            location: {
                lat: this.lat,
                lon: this.lon,
                altitude: this.altitude
            }
        };
    }
    // Helper to encode cache key as base64 of str(lat)+str(lon)+str(altitude)
    static encodeCacheKey(lat, lon, altitude) {
        let keyStr = String(lat) + "," + String(lon);
        if (typeof altitude === 'number' && !isNaN(altitude)) {
            keyStr += "," + String(altitude);
        }
        return btoa(keyStr);
    }
    // Clean up old cache entries (older than 24h) and validate data structures
    static cleanupOldCacheEntries() {
        try {
            const cacheStr = localStorage.getItem('metno-weather-cache');
            if (!cacheStr)
                return;
            const cacheObj = JSON.parse(cacheStr);
            if (!cacheObj["forecast-data"])
                return;
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
            let removedCount = 0;
            let invalidCount = 0;
            // Remove old entries and validate data structures
            for (const [key, entry] of Object.entries(cacheObj["forecast-data"])) {
                const entryData = entry;
                let shouldRemove = false;
                // Remove entries older than 24h past expiry
                if (now - entryData.expiresAt > twentyFourHours) {
                    shouldRemove = true;
                    removedCount++;
                }
                // Validate data structure
                else if (!entryData.data || typeof entryData.data !== 'object') {
                    shouldRemove = true;
                    invalidCount++;
                }
                // Check for missing required arrays
                else {
                    const missingArrays = requiredArrays.filter(prop => !Array.isArray(entryData.data[prop]));
                    if (missingArrays.length > 0) {
                        shouldRemove = true;
                        invalidCount++;
                    }
                }
                if (shouldRemove) {
                    delete cacheObj["forecast-data"][key];
                }
            }
            if (removedCount > 0 || invalidCount > 0) {
                localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
                // Note: This is a static method so we can't use instance _debugLog
                if (console.debug)
                    console.debug(`[WeatherAPI] Cleaned up ${removedCount} old and ${invalidCount} invalid cache entries from metno-weather-cache`);
            }
        }
        catch (e) {
            console.warn(`[WeatherAPI] Failed to cleanup cache entries, clearing entire cache:`, e);
            // Clear corrupted cache entirely
            try {
                localStorage.removeItem('metno-weather-cache');
                // Note: This is a static method so we can't use instance _debugLog
                if (console.debug)
                    console.debug(`[WeatherAPI] Cleared corrupted metno-weather-cache`);
            }
            catch (clearError) {
                console.error(`[WeatherAPI] Failed to clear corrupted cache:`, clearError);
            }
        }
    }
    // Save forecast data to localStorage
    saveCacheToStorage() {
        if (!this._forecastData || !this._expiresAt)
            return;
        // Clean up old entries before saving new ones
        WeatherAPI.cleanupOldCacheEntries();
        const key = WeatherAPI.encodeCacheKey(Number(this.lat.toFixed(4)), Number(this.lon.toFixed(4)), this.altitude !== undefined ? Number(this.altitude.toFixed(2)) : undefined);
        let cacheObj = {};
        const cacheStr = localStorage.getItem('metno-weather-cache');
        if (cacheStr) {
            try {
                cacheObj = JSON.parse(cacheStr);
            }
            catch {
                cacheObj = {};
            }
        }
        if (!cacheObj["forecast-data"])
            cacheObj["forecast-data"] = {};
        cacheObj["forecast-data"][key] = {
            expiresAt: this._expiresAt,
            data: this._forecastData
        };
        localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
    }
    // Load forecast data from localStorage
    loadCacheFromStorage() {
        var _a;
        const key = WeatherAPI.encodeCacheKey(Number(this.lat.toFixed(4)), Number(this.lon.toFixed(4)), this.altitude !== undefined ? Number(this.altitude.toFixed(2)) : undefined);
        let shouldCleanupCache = false;
        try {
            const cacheStr = localStorage.getItem('metno-weather-cache');
            if (cacheStr) {
                let cacheObj = {};
                try {
                    cacheObj = JSON.parse(cacheStr);
                }
                catch {
                    console.warn(`[WeatherAPI] Corrupted cache JSON, clearing metno-weather-cache`);
                    localStorage.removeItem('metno-weather-cache');
                    this._expiresAt = null;
                    this._forecastData = null;
                    return;
                }
                const entry = (_a = cacheObj["forecast-data"]) === null || _a === void 0 ? void 0 : _a[key];
                if (entry && entry.expiresAt && entry.data) {
                    // Check if cache entry is expired (older than 24h past expiresAt)
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    const now = Date.now();
                    if (now - entry.expiresAt > twentyFourHours) {
                        this._debugLog(`[WeatherAPI] Cached data for ${key} is too old (${Math.round((now - entry.expiresAt) / (60 * 60 * 1000))}h past expiry), removing from cache`);
                        if (!cacheObj["forecast-data"])
                            cacheObj["forecast-data"] = {};
                        delete cacheObj["forecast-data"][key];
                        shouldCleanupCache = true;
                        this._expiresAt = null;
                        this._forecastData = null;
                    }
                    else {
                        // Validate that cached data has all required array properties
                        const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
                        const missingArrays = requiredArrays.filter(prop => !Array.isArray(entry.data[prop]));
                        if (missingArrays.length > 0) {
                            console.warn(`[WeatherAPI] Cached data for ${key} is missing required arrays: ${missingArrays.join(', ')}, removing from cache`);
                            if (!cacheObj["forecast-data"])
                                cacheObj["forecast-data"] = {};
                            delete cacheObj["forecast-data"][key];
                            shouldCleanupCache = true;
                            this._expiresAt = null;
                            this._forecastData = null;
                        }
                        else {
                            this._expiresAt = entry.expiresAt;
                            // Restore Date objects in time array
                            if (Array.isArray(entry.data.time)) {
                                entry.data.time = entry.data.time.map((t) => typeof t === "string" ? new Date(t) : t);
                            }
                            this._forecastData = entry.data;
                        }
                    }
                    // Save cleaned cache back to localStorage if changes were made
                    if (shouldCleanupCache) {
                        localStorage.setItem('metno-weather-cache', JSON.stringify(cacheObj));
                        this._debugLog(`[WeatherAPI] Updated cache structure for ${key}`);
                    }
                }
                else {
                    this._expiresAt = null;
                    this._forecastData = null;
                }
            }
            else {
                this._expiresAt = null;
                this._forecastData = null;
            }
        }
        catch (e) {
            console.warn(`[WeatherAPI] Failed to load cache:`, e);
            // Clear corrupted cache entirely
            try {
                localStorage.removeItem('metno-weather-cache');
                console.warn(`[WeatherAPI] Cleared corrupted metno-weather-cache due to error`);
            }
            catch (cleanupError) {
                console.error(`[WeatherAPI] Failed to clear corrupted cache:`, cleanupError);
            }
            this._expiresAt = null;
            this._forecastData = null;
        }
    }
    // Make fetchWeatherDataFromAPI private and update usages
    async _fetchWeatherDataFromAPI() {
        // Throttle: if last fetch was less than 60s ago, skip fetch
        const now = Date.now();
        if (this._lastFetchTime && now - this._lastFetchTime < 60000) {
            // Already fetched recently, skip
            return;
        }
        this._lastFetchTime = now;
        const lat = this.lat;
        const lon = this.lon;
        let url = `https://aa015h6buqvih86i1.api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;
        if (Number.isFinite(this.altitude)) {
            url += `&altitude=${this.altitude}`;
        }
        let dedicatedForecastUrl = url;
        let urlToUse = dedicatedForecastUrl;
        let headers = {};
        this.lastStatusCode = null;
        this.lastError = null;
        try {
            headers = {
                'Origin': window.location.origin,
                'Accept': 'application/json'
            };
            // Always use dedicated forecast URL
            // log impending call to fetch
            this._debugLog(`[weather-api] Fetching weather data from ${urlToUse} with Origin ${headers['Origin']}`);
            WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT++;
            const response = await fetch(urlToUse, {
                headers,
                mode: 'cors',
                method: 'GET'
            });
            this.lastStatusCode = response.status;
            const expiresHeader = response.headers.get("Expires");
            // --- SPOOF: Always set expires to now + 3 minutes for testing ---
            // const spoofedExpires = new Date(Date.now() + 1 * 60 * 1000);
            // let expires: Date | null = spoofedExpires;
            // // If you want to log the spoof:
            // console.debug(`[weather-api] Spoofing expiresHeader to ${spoofedExpires.toISOString()}`);
            // --- END SPOOF ---
            // If you want to keep the original logic for reference, comment it out:
            let expires = null;
            if (expiresHeader) {
                const expiresDate = new Date(expiresHeader);
                if (!isNaN(expiresDate.getTime())) {
                    expires = expiresDate;
                }
            }
            if (this.lastStatusCode === 429) {
                const nextTry = expires ? expires.toLocaleTimeString() : "later";
                throw new Error(`Weather API throttling: Too many requests. Please wait until ${nextTry} before retrying.`);
            }
            if (this.lastStatusCode === 304) {
                throw new Error("API returned 304 but no cached data is available.");
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Weather API returned ${response.status}: ${response.statusText}\n${errorText}`);
            }
            const jsonData = await response.json();
            WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT++;
            // Parse and store forecast data
            this.assignMeteogramDataFromRaw(jsonData);
            this._expiresAt = expires ? expires.getTime() : null;
            this.saveCacheToStorage();
        }
        catch (error) {
            this.lastError = error;
            // Reset throttling on fetch failure to allow retry sooner
            this._lastFetchTime = null;
            const diag = this.getDiagnosticText() +
                `API URL: <code>${urlToUse}</code><br>` +
                `Origin header: <code>${headers['Origin']}</code><br>`;
            throw new Error(`<br>Failed to get weather data: ${error.message}\n<br>Check your network connection, browser console, and API accessibility.\n\n${diag}`);
        }
    }
    // assignMeteogramDataFromRaw now only sets _forecastData
    assignMeteogramDataFromRaw(rawData) {
        try {
            if (!rawData || !rawData.properties || !Array.isArray(rawData.properties.timeseries)) {
                throw new Error("Invalid raw data format from weather API");
            }
            const timeseries = rawData.properties.timeseries;
            const filtered = timeseries.filter((item) => {
                const time = new Date(item.time);
                return time.getMinutes() === 0;
            });
            const result = {
                time: [],
                temperature: [],
                rain: [],
                rainMin: [],
                rainMax: [],
                cloudCover: [],
                windSpeed: [],
                windGust: [],
                windDirection: [],
                symbolCode: [],
                pressure: [],
                units: undefined
            };
            result.fetchTimestamp = new Date().toISOString();
            filtered.forEach((item) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const time = new Date(item.time);
                const instant = item.data.instant.details;
                const next1h = (_a = item.data.next_1_hours) === null || _a === void 0 ? void 0 : _a.details;
                const next6h = (_b = item.data.next_6_hours) === null || _b === void 0 ? void 0 : _b.details;
                const next6hSummary = (_c = item.data.next_6_hours) === null || _c === void 0 ? void 0 : _c.summary;
                result.time.push(time);
                result.temperature.push((_d = instant.air_temperature) !== null && _d !== void 0 ? _d : null);
                result.cloudCover.push((_e = instant.cloud_area_fraction) !== null && _e !== void 0 ? _e : null);
                result.windSpeed.push((_f = instant.wind_speed) !== null && _f !== void 0 ? _f : null);
                result.windGust.push((_g = instant.wind_speed_of_gust) !== null && _g !== void 0 ? _g : null);
                result.windDirection.push((_h = instant.wind_from_direction) !== null && _h !== void 0 ? _h : null);
                result.pressure.push((_j = instant.air_pressure_at_sea_level) !== null && _j !== void 0 ? _j : null);
                if (next1h) {
                    // Only use actual min/max values if they exist, otherwise set to null
                    const rainAmountMax = next1h.precipitation_amount_max !== undefined ?
                        next1h.precipitation_amount_max : null;
                    const rainAmountMin = next1h.precipitation_amount_min !== undefined ?
                        next1h.precipitation_amount_min : null;
                    result.rainMin.push(rainAmountMin);
                    result.rainMax.push(rainAmountMax);
                    result.rain.push((_k = next1h.precipitation_amount) !== null && _k !== void 0 ? _k : null);
                    if ((_m = (_l = item.data.next_1_hours) === null || _l === void 0 ? void 0 : _l.summary) === null || _m === void 0 ? void 0 : _m.symbol_code) {
                        result.symbolCode.push(item.data.next_1_hours.summary.symbol_code);
                    }
                    else {
                        result.symbolCode.push('');
                    }
                }
                else if (next6h) {
                    // Use next_6_hours data if next_1_hours is missing
                    // Distribute 6h precipitation over 6 hours (average per hour)
                    const rain6h = next6h.precipitation_amount;
                    const rainPerHour = rain6h !== undefined ? rain6h / 6 : null;
                    result.rain.push(rainPerHour);
                    // 6h data doesn't have min/max ranges, so set to null
                    result.rainMin.push(null);
                    result.rainMax.push(null);
                    if (next6hSummary === null || next6hSummary === void 0 ? void 0 : next6hSummary.symbol_code) {
                        result.symbolCode.push(next6hSummary.symbol_code);
                    }
                    else {
                        result.symbolCode.push('');
                    }
                }
                else {
                    // No precipitation data available
                    result.rain.push(null);
                    result.rainMin.push(null);
                    result.rainMax.push(null);
                    result.symbolCode.push('');
                }
            });
            // Extract units from meta.units if available
            if (rawData.properties && rawData.properties.meta && rawData.properties.meta.units) {
                const metaUnits = rawData.properties.meta.units;
                result.units = {
                    temperature: metaUnits.air_temperature,
                    pressure: metaUnits.air_pressure_at_sea_level,
                    windSpeed: metaUnits.wind_speed,
                    precipitation: metaUnits.precipitation_amount,
                    cloudCover: metaUnits.cloud_area_fraction
                };
            }
            this._forecastData = result;
        }
        catch (err) {
            throw new Error("Failed to parse weather data: " + (err instanceof Error ? err.message : String(err)));
        }
    }
}
WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT = 0;
WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT = 0;

class WeatherEntityAPI {
    constructor(hass, entityId, cardInstance, from, debug = false) {
        var _a, _b;
        this._forecastData = null;
        this._lastDataFetch = null; // Timestamp of last data fetch
        this._unsubForecast = null;
        this._lastPauseTime = null; // Timestamp of last pause
        this._lastResumeTime = null; // Timestamp of last resume
        this._lastForecastFetch = null; // Timestamp of last forecast data received (subscription or service)
        this._debug = false; // Debug logging flag
        // Instrumentation: log caller stack and arguments
        this._debug = debug;
        this._debugLog(`[WeatherEntityAPI] from ${from} Constructor called for entityId: ${entityId}`);
        this.hass = hass;
        this.entityId = entityId;
        this._cardInstance = cardInstance;
        // Verify entity exists before setting up subscription
        if (!((_b = (_a = this.hass) === null || _a === void 0 ? void 0 : _a.states) === null || _b === void 0 ? void 0 : _b[this.entityId])) {
            console.warn(`[WeatherEntityAPI] ❌ Weather entity ${this.entityId} not found in hass.states`);
            return;
        }
        // In modern Home Assistant, forecast data ONLY comes from subscriptions
        // The entity.attributes.forecast property was removed in recent HA versions
        if (this.hass && this.entityId) {
            this._debugLog(`[WeatherEntityAPI] Setting up forecast subscription for ${this.entityId} (modern HA method)`);
            this.subscribeForecast((forecastArr) => {
                this._forecastData = this._parseForecastArray(forecastArr);
                this._lastDataFetch = Date.now(); // Update fetch timestamp
                this._lastForecastFetch = Date.now(); // Track forecast data reception
                // Force chart update using the specific card instance
                if (this._cardInstance && typeof this._cardInstance._scheduleDrawMeteogram === "function") {
                    this._cardInstance._scheduleDrawMeteogram("WeatherEntityAPI-forecast-update", true);
                }
            }).then(unsub => {
                this._unsubForecast = unsub;
                this._debugLog(`[WeatherEntityAPI] ✅ Forecast subscription established successfully for ${this.entityId}`);
            }).catch(error => {
                console.error(`[WeatherEntityAPI] ❌ Forecast subscription failed for ${this.entityId}:`, error);
                this._debugLog(`[WeatherEntityAPI] This may indicate an unsupported entity or HA version issue`);
            });
        }
    }
    // Debug helper method for conditional logging
    _debugLog(...args) {
        if (this._debug) {
            console.debug(...args);
        }
    }
    // Clean up old entity cache entries (older than 24h) and validate data structures
    static cleanupOldEntityCacheEntries(cache) {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        let removedCount = 0;
        let invalidCount = 0;
        const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
        for (const [entityId, entry] of Object.entries(cache)) {
            let shouldRemove = false;
            // Remove entries older than 24h
            if (now - entry.timestamp > twentyFourHours) {
                shouldRemove = true;
                removedCount++;
            }
            // Remove entries with invalid data structure
            else if (!entry.data || typeof entry.data !== 'object') {
                shouldRemove = true;
                invalidCount++;
                // Static method - check localStorage for debug flag
                if (localStorage.getItem('meteogram-debug') === 'true') {
                    console.debug(`[WeatherEntityAPI] Removing cache entry for ${entityId}: invalid data structure`);
                }
            }
            // Remove entries missing required arrays
            else {
                const missingArrays = requiredArrays.filter(prop => !Array.isArray(entry.data[prop]));
                if (missingArrays.length > 0) {
                    shouldRemove = true;
                    invalidCount++;
                    // Static method - check localStorage for debug flag
                    if (localStorage.getItem('meteogram-debug') === 'true') {
                        console.debug(`[WeatherEntityAPI] Removing cache entry for ${entityId}: missing arrays ${missingArrays.join(', ')}`);
                    }
                }
            }
            if (shouldRemove) {
                delete cache[entityId];
            }
        }
        if (removedCount > 0 || invalidCount > 0) {
            // Static method - check localStorage for debug flag
            if (localStorage.getItem('meteogram-debug') === 'true') {
                console.debug(`[WeatherEntityAPI] Cleaned up ${removedCount} old and ${invalidCount} invalid entity cache entries`);
            }
        }
    }
    // Diagnostic method to check entity and subscription status
    getDiagnosticInfo() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        // Use current hass from card instance, not the potentially stale stored hass
        const currentHass = ((_a = this._cardInstance) === null || _a === void 0 ? void 0 : _a.hass) || this.hass;
        const entity = (_b = currentHass === null || currentHass === void 0 ? void 0 : currentHass.states) === null || _b === void 0 ? void 0 : _b[this.entityId];
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        const expiresAt = this._lastDataFetch ? this._lastDataFetch + oneHour : null;
        const now = Date.now();
        // Analyze forecast timing details
        const forecastTimingInfo = ((_c = this._forecastData) === null || _c === void 0 ? void 0 : _c.time) ? {
            firstForecastTime: ((_d = this._forecastData.time[0]) === null || _d === void 0 ? void 0 : _d.toISOString()) || 'none',
            lastForecastTime: ((_e = this._forecastData.time[this._forecastData.time.length - 1]) === null || _e === void 0 ? void 0 : _e.toISOString()) || 'none',
            firstForecastAge: this._forecastData.time[0] ? Math.round((now - this._forecastData.time[0].getTime()) / (60 * 1000)) + ' minutes ago' : 'unknown',
            forecastSpanHours: this._forecastData.time.length > 1 ?
                Math.round((this._forecastData.time[this._forecastData.time.length - 1].getTime() - this._forecastData.time[0].getTime()) / (60 * 60 * 1000)) + ' hours' :
                '0 hours',
            hourlyIntervals: this._forecastData.time.length > 1 ?
                this._forecastData.time.slice(1, 3).map((time, i) => Math.round((time.getTime() - this._forecastData.time[i].getTime()) / (60 * 1000)) + ' min') : []
        } : null;
        return {
            entityId: this.entityId,
            entityExists: !!entity,
            entityState: entity === null || entity === void 0 ? void 0 : entity.state,
            entityLastChanged: entity === null || entity === void 0 ? void 0 : entity.last_changed,
            entityLastUpdated: entity === null || entity === void 0 ? void 0 : entity.last_updated,
            entityTimingAnalysis: entity ? {
                lastChangedFormatted: entity.last_changed ? new Date(entity.last_changed).toLocaleString() : 'never',
                lastUpdatedFormatted: entity.last_updated ? new Date(entity.last_updated).toLocaleString() : 'never',
                lastChangedAge: entity.last_changed ? Math.round((now - new Date(entity.last_changed).getTime()) / (60 * 1000)) + ' minutes ago' : 'unknown',
                lastUpdatedAge: entity.last_updated ? Math.round((now - new Date(entity.last_updated).getTime()) / (60 * 1000)) + ' minutes ago' : 'unknown',
                entityVsForecastAge: this._lastDataFetch && entity.last_updated ?
                    Math.round((new Date(entity.last_updated).getTime() - this._lastDataFetch) / (60 * 1000)) + ' minutes difference' : 'unknown'
            } : null,
            hourlyForecastData: {
                // In modern HA, forecast data comes only from subscriptions, not entity attributes
                processedLength: ((_g = (_f = this._forecastData) === null || _f === void 0 ? void 0 : _f.time) === null || _g === void 0 ? void 0 : _g.length) || 0,
                status: ((_j = (_h = this._forecastData) === null || _h === void 0 ? void 0 : _h.time) === null || _j === void 0 ? void 0 : _j.length)
                    ? `${this._forecastData.time.length} processed entries`
                    : 'waiting for subscription data',
                forecastTiming: forecastTimingInfo
            },
            hasSubscription: !!this._unsubForecast,
            subscriptionStatus: this._unsubForecast ? 'active' : 'paused/inactive',
            lastPauseTime: this._lastPauseTime ? new Date(this._lastPauseTime).toLocaleString() : 'never',
            lastResumeTime: this._lastResumeTime ? new Date(this._lastResumeTime).toLocaleString() : 'never',
            lastForecastFetch: this._lastForecastFetch ? new Date(this._lastForecastFetch).toLocaleString() : 'never',
            lastForecastFetchAge: this._lastForecastFetch ? Math.round((now - this._lastForecastFetch) / (60 * 1000)) + ' minutes ago' : 'never',
            hasConnection: !!((_k = this.hass) === null || _k === void 0 ? void 0 : _k.connection),
            inMemoryData: {
                hasData: !!this._forecastData,
                dataTimeLength: ((_m = (_l = this._forecastData) === null || _l === void 0 ? void 0 : _l.time) === null || _m === void 0 ? void 0 : _m.length) || 0,
                lastFetchTime: this._lastDataFetch ? new Date(this._lastDataFetch).toISOString() : 'never',
                lastFetchFormatted: this._lastDataFetch ? new Date(this._lastDataFetch).toLocaleString() : 'not yet fetched',
                dataAgeMinutes: this._lastDataFetch ? Math.round((Date.now() - this._lastDataFetch) / (60 * 1000)) : 'n/a',
                expiresAt: expiresAt,
                expiresAtFormatted: expiresAt ? new Date(expiresAt).toLocaleString() : 'not set',
                isExpired: expiresAt ? Date.now() > expiresAt : false,
                fetchTimestamp: ((_o = this._forecastData) === null || _o === void 0 ? void 0 : _o.fetchTimestamp) || 'none'
            }
        };
    }
    _parseForecastArray(forecast) {
        var _a;
        // Try to get units from the entity attributes if available (use current hass from card)
        let units = undefined;
        const currentHass = ((_a = this._cardInstance) === null || _a === void 0 ? void 0 : _a.hass) || this.hass;
        if (currentHass && this.entityId && currentHass.states && currentHass.states[this.entityId]) {
            const attrs = currentHass.states[this.entityId].attributes || {};
            units = {
                temperature: attrs.temperature_unit,
                pressure: attrs.pressure_unit,
                windSpeed: attrs.wind_speed_unit,
                precipitation: attrs.precipitation_unit || attrs.precipitation_unit || attrs.rain_unit,
                cloudCover: attrs.cloud_coverage_unit || '%'
            };
        }
        const result = {
            time: [],
            temperature: [],
            rain: [],
            rainMin: [],
            rainMax: [],
            cloudCover: [],
            windSpeed: [],
            windDirection: [],
            windGust: [],
            symbolCode: [],
            pressure: [],
            fetchTimestamp: new Date().toISOString(),
            units
        };
        forecast.forEach((item) => {
            var _a, _b, _c;
            result.time.push(new Date(item.datetime || item.time));
            result.temperature.push((_a = item.temperature) !== null && _a !== void 0 ? _a : null);
            result.rain.push((_b = item.precipitation) !== null && _b !== void 0 ? _b : null);
            // Only use actual min/max values if they exist, otherwise set to null
            result.rainMin.push('precipitation_min' in item && typeof item.precipitation_min === 'number' ? item.precipitation_min : null);
            result.rainMax.push('precipitation_max' in item && typeof item.precipitation_max === 'number' ? item.precipitation_max : null);
            // Always push values to maintain array consistency (use null if not present)
            result.cloudCover.push('cloud_coverage' in item && typeof item.cloud_coverage === 'number' ? item.cloud_coverage : null);
            result.windSpeed.push('wind_speed' in item && typeof item.wind_speed === 'number' ? item.wind_speed : null);
            result.windDirection.push('wind_bearing' in item && typeof item.wind_bearing === 'number' ? item.wind_bearing : null);
            // Handle wind gust with proper null handling
            if ('wind_gust' in item && typeof item.wind_gust === 'number') {
                result.windGust.push(item.wind_gust);
            }
            else if ('wind_gust_speed' in item && typeof item.wind_gust_speed === 'number') {
                result.windGust.push(item.wind_gust_speed);
            }
            else if ('wind_speed_gust' in item && typeof item.wind_speed_gust === 'number') {
                result.windGust.push(item.wind_speed_gust);
            }
            else if ('gust_speed' in item && typeof item.gust_speed === 'number') {
                result.windGust.push(item.gust_speed);
            }
            else {
                // No gust data available - push null instead of duplicating wind_speed
                result.windGust.push(null);
            }
            result.symbolCode.push((_c = item.condition) !== null && _c !== void 0 ? _c : "");
            // Map pressure attribute for renderer compatibility
            if ('pressure' in item && typeof item.pressure === 'number') {
                result.pressure.push(item.pressure);
            }
            else if ('pressure_mbar' in item && typeof item.pressure_mbar === 'number') {
                result.pressure.push(item.pressure_mbar);
            }
            else if ('pressure_hpa' in item && typeof item.pressure_hpa === 'number') {
                result.pressure.push(item.pressure_hpa);
            }
            else {
                result.pressure.push(null); // Maintain array consistency
            }
        });
        // Store the parsed forecast in localStorage using a shared cache object
        try {
            const cacheKey = 'meteogram-card-entity-weather-cache';
            let cache = {};
            const rawCache = localStorage.getItem(cacheKey);
            if (rawCache) {
                try {
                    const parsedCache = JSON.parse(rawCache);
                    // Handle both old format (direct ForecastData) and new format (with timestamp)
                    for (const [entityId, entry] of Object.entries(parsedCache)) {
                        if (entry && typeof entry === 'object' && 'timestamp' in entry && 'data' in entry) {
                            cache[entityId] = entry;
                        }
                        else {
                            // Old format - convert to new format with current timestamp
                            cache[entityId] = {
                                timestamp: Date.now(),
                                data: entry
                            };
                        }
                    }
                }
                catch (e) {
                    console.warn(`[WeatherEntityAPI] Failed to parse existing cache, starting fresh:`, e);
                    cache = {};
                }
            }
            // Clean up entries older than 24h before saving
            WeatherEntityAPI.cleanupOldEntityCacheEntries(cache);
            cache[this.entityId] = {
                timestamp: Date.now(),
                data: result
            };
            localStorage.setItem(cacheKey, JSON.stringify(cache));
        }
        catch (e) {
            console.warn(`[WeatherEntityAPI] Failed to store forecast for ${this.entityId} in localStorage:`, e);
        }
        return result;
    }
    // Note: In modern Home Assistant, forecast data comes from subscriptions only
    // The entity.attributes.forecast property doesn't exist in recent HA versions
    getForecast() {
        // This method returns the current/instantaneous forecast data
        // For hourly forecast data used by meteogram, use getForecastData() instead
        // In modern HA, forecast data only comes from subscriptions
        // Return whatever we have in memory from subscription updates
        return this._forecastData;
    }
    /**
     * Subscribe to forecast updates for the weather entity.
     * @param callback Called with the forecast array when updates arrive.
     * @returns Unsubscribe function.
     */
    subscribeForecast(callback) {
        var _a;
        this._debugLog(`[WeatherEntityAPI] 📡 Setting up subscription for entityId=${this.entityId}`);
        if (!((_a = this.hass) === null || _a === void 0 ? void 0 : _a.connection)) {
            console.warn(`[WeatherEntityAPI] ❌ Cannot subscribe: hass.connection not available for ${this.entityId}`);
            return Promise.resolve(() => { });
        }
        this._debugLog(`[WeatherEntityAPI] ✅ hass.connection available, creating subscription for ${this.entityId}`);
        const unsubPromise = this.hass.connection.subscribeMessage((event) => {
            if (Array.isArray(event.forecast)) {
                callback(event.forecast);
            }
            else {
                console.warn(`[WeatherEntityAPI] ❌ Invalid forecast data for ${this.entityId}:`, event);
            }
        }, {
            type: "weather/subscribe_forecast",
            entity_id: this.entityId,
            forecast_type: "hourly"
        });
        return unsubPromise;
    }
    /**
     * Get the latest ForecastData received from subscribeForecast.
     * If _forecastData is null, try to fill it from localStorage.
     */
    getForecastData() {
        this._debugLog(`[WeatherEntityAPI] getForecastData() called for ${this.entityId}`);
        // Check if we have data and if it's fresh (less than 1 hour old)
        const oneHour = 60 * 60 * 1000;
        const now = Date.now();
        if (this._forecastData && this._lastDataFetch && (now - this._lastDataFetch < oneHour)) {
            // Data is fresh, return it
            return this._forecastData;
        }
        // Data is stale or doesn't exist - in modern HA, we rely on subscriptions for fresh data
        // Clear stale data and fall back to cache while waiting for subscription updates
        if (this._lastDataFetch) {
            const ageMinutes = Math.round((now - this._lastDataFetch) / (60 * 1000));
            this._debugLog(`[WeatherEntityAPI] Data is stale for ${this.entityId} (${ageMinutes} min old), clearing and waiting for subscription update`);
        }
        else {
            this._debugLog(`[WeatherEntityAPI] No data for ${this.entityId}, waiting for subscription update`);
        }
        this._forecastData = null; // Clear stale data
        // Note: In modern HA, we can't fetch forecast directly from entity attributes
        // Fresh data will come from the subscription when HA sends updates
        // For now, we fall back to localStorage cache if available
        // Fresh fetch failed, try to load from localStorage cache as fallback
        let shouldCleanupCache = false;
        try {
            const cacheKey = 'meteogram-card-entity-weather-cache';
            const rawCache = localStorage.getItem(cacheKey);
            if (rawCache) {
                const cache = JSON.parse(rawCache);
                const stored = cache[this.entityId];
                if (stored) {
                    // Handle both old format (direct ForecastData) and new format (with timestamp)
                    let forecastData;
                    if (stored && typeof stored === 'object' && 'timestamp' in stored && 'data' in stored) {
                        // New format - check if not too old (24h)
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        if (Date.now() - stored.timestamp > twentyFourHours) {
                            this._debugLog(`[WeatherEntityAPI] Cached data for ${this.entityId} is too old (${Math.round((Date.now() - stored.timestamp) / (60 * 60 * 1000))}h), removing from cache`);
                            shouldCleanupCache = true;
                            delete cache[this.entityId];
                        }
                        else {
                            forecastData = stored.data;
                        }
                    }
                    else {
                        // Old format - convert to new format or remove if corrupted
                        if (stored && typeof stored === 'object') {
                            // Old format - use directly but consider it potentially stale
                            forecastData = stored;
                            this._debugLog(`[WeatherEntityAPI] Converting old format cache entry for ${this.entityId} to new format`);
                            shouldCleanupCache = true;
                            // Convert to new format
                            cache[this.entityId] = {
                                timestamp: Date.now() - (12 * 60 * 60 * 1000), // Mark as 12h old to trigger refresh soon
                                data: forecastData
                            };
                        }
                        else {
                            console.warn(`[WeatherEntityAPI] Corrupted cache entry for ${this.entityId}, removing from cache`);
                            shouldCleanupCache = true;
                            delete cache[this.entityId];
                        }
                    }
                    // Validate that cached data has all required array properties if we have forecastData
                    if (forecastData) {
                        const requiredArrays = ['time', 'temperature', 'rain', 'rainMin', 'rainMax', 'cloudCover', 'windSpeed', 'windGust', 'windDirection', 'symbolCode', 'pressure'];
                        const missingArrays = requiredArrays.filter(prop => !Array.isArray(forecastData[prop]));
                        if (missingArrays.length > 0) {
                            console.warn(`[WeatherEntityAPI] Cached data for ${this.entityId} is missing required arrays: ${missingArrays.join(', ')}, removing from cache`);
                            shouldCleanupCache = true;
                            delete cache[this.entityId];
                        }
                        else {
                            // Restore Date objects in time array
                            if (Array.isArray(forecastData.time)) {
                                forecastData.time = forecastData.time.map((t) => typeof t === "string" ? new Date(t) : t);
                            }
                            this._forecastData = forecastData;
                            // Save cache back to localStorage if we made changes
                            if (shouldCleanupCache) {
                                localStorage.setItem(cacheKey, JSON.stringify(cache));
                                this._debugLog(`[WeatherEntityAPI] Updated cache structure for ${this.entityId}`);
                            }
                            // console.debug(`[WeatherEntityAPI] Loaded forecast for ${this.entityId} from localStorage cache`, this._forecastData);
                            return this._forecastData;
                        }
                    }
                    // Save cache back to localStorage if we made changes (cleanup only)
                    if (shouldCleanupCache) {
                        localStorage.setItem(cacheKey, JSON.stringify(cache));
                        this._debugLog(`[WeatherEntityAPI] Cleaned up cache for ${this.entityId}`);
                    }
                }
            }
        }
        catch (e) {
            console.warn(`[WeatherEntityAPI] Failed to load forecast for ${this.entityId} from localStorage cache:`, e);
            // Clear corrupted cache entirely
            try {
                const cacheKey = 'meteogram-card-entity-weather-cache';
                localStorage.removeItem(cacheKey);
                console.warn(`[WeatherEntityAPI] Cleared corrupted cache due to parse error`);
            }
            catch (cleanupError) {
                console.error(`[WeatherEntityAPI] Failed to clear corrupted cache:`, cleanupError);
            }
        }
        return null;
    }
    /**
     * Pause the subscription (when tab becomes hidden)
     */
    pause(from) {
        if (this._unsubForecast) {
            try {
                this._debugLog(`[WeatherEntityAPI] from ${from} Pausing subscription for ${this.entityId}`);
                this._unsubForecast();
                this._unsubForecast = null;
                this._lastPauseTime = Date.now();
            }
            catch (err) {
                console.warn(`[WeatherEntityAPI] from ${from} Error pausing subscription for ${this.entityId}:`, err);
            }
        }
    }
    /**
     * Resume the subscription (when tab becomes visible) and check for fresh data
     */
    async resume(from) {
        this._debugLog(`[WeatherEntityAPI] from ${from} Resuming subscription for ${this.entityId}`);
        // First, check if we can get fresher data from the current hass state
        await this._checkAndUpdateFromHassState();
        // Re-establish subscription for future updates
        if (this.hass && this.entityId && !this._unsubForecast) {
            try {
                const unsubPromise = this.subscribeForecast((forecastArr) => {
                    this._forecastData = this._parseForecastArray(forecastArr);
                    this._lastDataFetch = Date.now();
                    this._lastForecastFetch = Date.now();
                    // Force chart update
                    if (this._cardInstance && typeof this._cardInstance._scheduleDrawMeteogram === "function") {
                        this._cardInstance._scheduleDrawMeteogram("WeatherEntityAPI-resume-update", true);
                    }
                });
                this._unsubForecast = await unsubPromise;
                this._lastResumeTime = Date.now();
                this._debugLog(`[WeatherEntityAPI] ✅ Subscription resumed successfully for ${this.entityId}`);
            }
            catch (error) {
                console.error(`[WeatherEntityAPI] ❌ Failed to resume subscription for ${this.entityId}:`, error);
            }
        }
    }
    /**
     * Check if hass state has fresher data than our cached data and get forecast freshness info
     */
    async _checkAndUpdateFromHassState() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this._debugLog(`[WeatherEntityAPI] 🔍 _checkAndUpdateFromHassState called for ${this.entityId}`);
        // Use current hass from card instance, not the potentially stale stored hass
        const currentHass = ((_a = this._cardInstance) === null || _a === void 0 ? void 0 : _a.hass) || this.hass;
        if (!((_b = currentHass === null || currentHass === void 0 ? void 0 : currentHass.states) === null || _b === void 0 ? void 0 : _b[this.entityId])) {
            this._debugLog(`[WeatherEntityAPI] ❌ Entity ${this.entityId} not found in current hass.states during resume check`);
            return;
        }
        const entity = currentHass.states[this.entityId];
        entity.last_updated ? new Date(entity.last_updated).getTime() : 0;
        entity.last_changed ? new Date(entity.last_changed).getTime() : 0;
        this._lastDataFetch || 0;
        // Always try to get fresh forecast data via service to check its freshness
        // regardless of entity update times, since forecast data freshness might be different
        this._debugLog(`[WeatherEntityAPI] 🚀 Calling get_forecasts service for ${this.entityId} to check forecast freshness...`);
        try {
            const serviceCallStart = Date.now();
            // Use the working method (direct WebSocket connection) 
            const result = await currentHass.connection.sendMessagePromise({
                type: 'call_service',
                domain: 'weather',
                service: 'get_forecasts',
                service_data: {
                    entity_id: this.entityId,
                    type: 'hourly'
                },
                return_response: true
            });
            // Handle the response structure correctly
            const responseData = (result === null || result === void 0 ? void 0 : result.response) || result;
            if (((_c = responseData === null || responseData === void 0 ? void 0 : responseData[this.entityId]) === null || _c === void 0 ? void 0 : _c.forecast) && Array.isArray(responseData[this.entityId].forecast)) {
                const forecastArray = responseData[this.entityId].forecast;
                const firstForecastTime = ((_d = forecastArray[0]) === null || _d === void 0 ? void 0 : _d.datetime) || ((_e = forecastArray[0]) === null || _e === void 0 ? void 0 : _e.time);
                const lastForecastTime = ((_f = forecastArray[forecastArray.length - 1]) === null || _f === void 0 ? void 0 : _f.datetime) || ((_g = forecastArray[forecastArray.length - 1]) === null || _g === void 0 ? void 0 : _g.time);
                this._forecastData = this._parseForecastArray(forecastArray);
                this._lastDataFetch = Date.now();
                this._lastForecastFetch = Date.now(); // Track forecast data from service call
                // Force chart update with fresh data using specific card instance
                if (this._cardInstance && typeof this._cardInstance._scheduleDrawMeteogram === "function") {
                    this._cardInstance._scheduleDrawMeteogram("WeatherEntityAPI-fresh-service-data", true);
                }
                else {
                    console.warn(`[WeatherEntityAPI] ⚠️ Could not trigger chart update - card instance not found or missing _scheduleDrawMeteogram method`);
                }
            }
            else {
                const responseData = (result === null || result === void 0 ? void 0 : result.response) || result;
                console.warn(`[WeatherEntityAPI] ❌ Service call succeeded but no valid forecast data returned for ${this.entityId}:`, {
                    resultStructure: result,
                    responseStructure: responseData,
                    hasEntityData: !!(responseData === null || responseData === void 0 ? void 0 : responseData[this.entityId]),
                    entityData: responseData === null || responseData === void 0 ? void 0 : responseData[this.entityId]
                });
            }
        }
        catch (error) {
            console.error(`[WeatherEntityAPI] ❌ get_forecasts service call failed for ${this.entityId}:`, {
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
                hassConnectionState: !!((_h = this.hass) === null || _h === void 0 ? void 0 : _h.connection),
                entityExists: !!((_k = (_j = this.hass) === null || _j === void 0 ? void 0 : _j.states) === null || _k === void 0 ? void 0 : _k[this.entityId])
            });
            // Fall back to existing cached data
        }
    }
    /**
     * Check if subscription is currently active
     */
    isSubscriptionActive() {
        return !!this._unsubForecast;
    }
    /**
     * Get a concise summary for browser console debugging
     * Call this from console: document.querySelector('meteogram-card').weatherEntityAPI.getFreshnessSummary()
     * Or for multiple cards, use: document.querySelectorAll('meteogram-card')[0].weatherEntityAPI.getFreshnessSummary()
     */
    getFreshnessSummary() {
        var _a, _b;
        const diag = this.getDiagnosticInfo();
        let summary = `\n=== METEOGRAM FORECAST FRESHNESS SUMMARY ===\n`;
        summary += `Entity: ${this.entityId}\n`;
        summary += `Status: ${diag.entityExists ? '✅ Found' : '❌ Missing'}\n`;
        summary += `Subscription: ${diag.subscriptionStatus === 'active' ? '🟢 Active' : '🔴 Paused/Inactive'}\n`;
        if (diag.entityTimingAnalysis) {
            summary += `\n📅 ENTITY TIMING:\n`;
            summary += `• Last Updated: ${diag.entityTimingAnalysis.lastUpdatedFormatted} (${diag.entityTimingAnalysis.lastUpdatedAge})\n`;
            summary += `• Last Changed: ${diag.entityTimingAnalysis.lastChangedFormatted} (${diag.entityTimingAnalysis.lastChangedAge})\n`;
        }
        if ((_a = diag.hourlyForecastData) === null || _a === void 0 ? void 0 : _a.forecastTiming) {
            const timing = diag.hourlyForecastData.forecastTiming;
            summary += `\n📊 FORECAST DATA:\n`;
            summary += `• First Forecast: ${timing.firstForecastTime} (${timing.firstForecastAge})\n`;
            summary += `• Last Forecast: ${timing.lastForecastTime}\n`;
            summary += `• Data Span: ${timing.forecastSpanHours}\n`;
            summary += `• Total Entries: ${diag.hourlyForecastData.processedLength}\n`;
            summary += `• Hourly Intervals: ${timing.hourlyIntervals.join(', ')}\n`;
        }
        else {
            summary += `\n📊 FORECAST DATA: ${diag.hourlyForecastData.status}\n`;
        }
        summary += `\n⏰ FRESHNESS:\n`;
        summary += `• Last Forecast Fetched: ${diag.lastForecastFetch || 'never'} ${diag.lastForecastFetchAge ? `(${diag.lastForecastFetchAge})` : ''}\n`;
        summary += `• Our Last Fetch: ${diag.inMemoryData.lastFetchFormatted}\n`;
        summary += `• Data Age: ${diag.inMemoryData.dataAgeMinutes} minutes\n`;
        summary += `• Expires At: ${diag.inMemoryData.expiresAtFormatted}\n`;
        summary += `• Is Expired: ${diag.inMemoryData.isExpired ? '❌ YES' : '✅ NO'}\n`;
        if ((_b = diag.entityTimingAnalysis) === null || _b === void 0 ? void 0 : _b.entityVsForecastAge) {
            summary += `• Entity vs Forecast Age Diff: ${diag.entityTimingAnalysis.entityVsForecastAge}\n`;
        }
        summary += `\n🔧 ACTIONS:\n`;
        summary += `• Test get_forecasts: weatherEntityAPI.testGetForecastsService()\n`;
        summary += `• Force resume: weatherEntityAPI.resume('manual-test')\n`;
        summary += `• Full diagnostics: weatherEntityAPI.getDiagnosticInfo()\n`;
        summary += `===============================================\n`;
        console.log(summary);
        return summary;
    }
    /**
     * Manual test method to call get_forecasts service and log detailed results
     * Call this from browser console to debug forecast data freshness
     */
    async testGetForecastsService() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        console.log(`[WeatherEntityAPI] 🧪 Manual test of get_forecasts service for ${this.entityId}`);
        const currentHass = ((_a = this._cardInstance) === null || _a === void 0 ? void 0 : _a.hass) || this.hass;
        if (!(currentHass === null || currentHass === void 0 ? void 0 : currentHass.connection)) {
            console.error(`[WeatherEntityAPI] ❌ No hass connection available`);
            return null;
        }
        try {
            const serviceCallStart = Date.now();
            // Use the working method (Method 3 - direct connection)
            const result = await currentHass.connection.sendMessagePromise({
                type: 'call_service',
                domain: 'weather',
                service: 'get_forecasts',
                service_data: {
                    entity_id: this.entityId,
                    type: 'hourly'
                },
                return_response: true
            });
            const serviceCallDuration = Date.now() - serviceCallStart;
            const analysis = {
                serviceCallDurationMs: serviceCallDuration,
                serviceCallTime: new Date().toISOString(),
                resultKeys: Object.keys(result || {}),
                hasEntityData: !!(result === null || result === void 0 ? void 0 : result[this.entityId]),
                fullResult: result
            };
            const responseData = (result === null || result === void 0 ? void 0 : result.response) || result;
            if (((_b = responseData === null || responseData === void 0 ? void 0 : responseData[this.entityId]) === null || _b === void 0 ? void 0 : _b.forecast) && Array.isArray(responseData[this.entityId].forecast)) {
                const forecast = responseData[this.entityId].forecast;
                const now = Date.now();
                analysis.forecastAnalysis = {
                    forecastLength: forecast.length,
                    firstItem: forecast[0],
                    lastItem: forecast[forecast.length - 1],
                    firstForecastTime: ((_c = forecast[0]) === null || _c === void 0 ? void 0 : _c.datetime) || ((_d = forecast[0]) === null || _d === void 0 ? void 0 : _d.time),
                    lastForecastTime: ((_e = forecast[forecast.length - 1]) === null || _e === void 0 ? void 0 : _e.datetime) || ((_f = forecast[forecast.length - 1]) === null || _f === void 0 ? void 0 : _f.time),
                    sampleItems: forecast.slice(0, 3),
                    timeSpread: forecast.length > 1 ? {
                        totalHours: Math.round((new Date(forecast[forecast.length - 1].datetime || forecast[forecast.length - 1].time).getTime()
                            - new Date(forecast[0].datetime || forecast[0].time).getTime()) / (60 * 60 * 1000)),
                        intervalBetweenFirst2: forecast.length > 1 ?
                            Math.round((new Date(forecast[1].datetime || forecast[1].time).getTime()
                                - new Date(forecast[0].datetime || forecast[0].time).getTime()) / (60 * 1000)) + ' minutes' : 'n/a'
                    } : null
                };
                // Compare with our current data
                analysis.comparisonWithCurrentData = {
                    currentDataLength: ((_h = (_g = this._forecastData) === null || _g === void 0 ? void 0 : _g.time) === null || _h === void 0 ? void 0 : _h.length) || 0,
                    currentFirstTime: ((_l = (_k = (_j = this._forecastData) === null || _j === void 0 ? void 0 : _j.time) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.toISOString()) || 'none',
                    newFirstTime: ((_m = forecast[0]) === null || _m === void 0 ? void 0 : _m.datetime) || ((_o = forecast[0]) === null || _o === void 0 ? void 0 : _o.time) || 'none',
                    dataMismatch: (((_q = (_p = this._forecastData) === null || _p === void 0 ? void 0 : _p.time) === null || _q === void 0 ? void 0 : _q.length) || 0) !== forecast.length ||
                        (((_t = (_s = (_r = this._forecastData) === null || _r === void 0 ? void 0 : _r.time) === null || _s === void 0 ? void 0 : _s[0]) === null || _t === void 0 ? void 0 : _t.toISOString()) || '') !== (((_u = forecast[0]) === null || _u === void 0 ? void 0 : _u.datetime) || ((_v = forecast[0]) === null || _v === void 0 ? void 0 : _v.time) || ''),
                    lastFetchAge: this._lastDataFetch ? Math.round((Date.now() - this._lastDataFetch) / (60 * 1000)) + ' minutes ago' : 'never'
                };
            }
            else {
                analysis.error = 'No valid forecast array in response';
            }
            console.log(`[WeatherEntityAPI] 🧪 get_forecasts test results:`, analysis);
            return analysis;
        }
        catch (error) {
            const errorAnalysis = {
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
                errorDetails: {
                    name: error === null || error === void 0 ? void 0 : error.name,
                    code: error === null || error === void 0 ? void 0 : error.code,
                    type: typeof error,
                    constructor: (_w = error === null || error === void 0 ? void 0 : error.constructor) === null || _w === void 0 ? void 0 : _w.name,
                    keys: error ? Object.keys(error) : []
                },
                hassState: {
                    hasConnection: !!(currentHass === null || currentHass === void 0 ? void 0 : currentHass.connection),
                    entityExists: !!((_x = currentHass === null || currentHass === void 0 ? void 0 : currentHass.states) === null || _x === void 0 ? void 0 : _x[this.entityId]),
                    entityState: (_z = (_y = currentHass === null || currentHass === void 0 ? void 0 : currentHass.states) === null || _y === void 0 ? void 0 : _y[this.entityId]) === null || _z === void 0 ? void 0 : _z.state,
                    entityAttributes: ((_1 = (_0 = currentHass === null || currentHass === void 0 ? void 0 : currentHass.states) === null || _0 === void 0 ? void 0 : _0[this.entityId]) === null || _1 === void 0 ? void 0 : _1.attributes) ? Object.keys(currentHass.states[this.entityId].attributes) : []
                }
            };
            console.error(`[WeatherEntityAPI] 🧪 get_forecasts test failed:`, errorAnalysis);
            console.error(`[WeatherEntityAPI] 🧪 Raw error object:`, error);
            // Try to stringify the error to see hidden properties
            try {
                console.error(`[WeatherEntityAPI] 🧪 Error JSON:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
            }
            catch (jsonError) {
                console.error(`[WeatherEntityAPI] 🧪 Could not stringify error:`, jsonError);
            }
            return errorAnalysis;
        }
    }
    /**
     * Destructor: Unsubscribe from forecast updates.
     */
    destroy(from) {
        if (this._unsubForecast) {
            try {
                this._unsubForecast();
                this._unsubForecast = null;
                this._debugLog(`[WeatherEntityAPI] from ${from} Destroyed subscription for ${this.entityId}`);
            }
            catch (err) {
                console.warn(`[WeatherEntityAPI] from ${from} Error during unsubscribe for ${this.entityId}:`, err);
            }
        }
    }
}
/**
 * Map HA weather entity 'condition' values to Met.no weather icon names, with day/night support.
 * Covers all standard and many custom HA conditions, and only uses day/night variants where they exist in Met.no.
 * @param condition The HA condition string
 * @param date The forecast time (Date)
 * @param isDaytime Boolean: true if day, false if night
 */
function mapHaConditionToMetnoSymbol(condition, date, isDaytime) {
    // Reference: https://github.com/metno/weathericons/tree/main/weather (README)
    // If isDaytime is undefined, fallback to 6:00-18:00 as day
    let day = isDaytime;
    if (day === undefined && date instanceof Date) {
        const hour = date.getHours();
        day = hour >= 6 && hour < 18;
    }
    // Only these icons have _day/_night variants in Met.no set
    const hasDayNight = new Set([
        'clearsky', 'partlycloudy', 'fair',
        'rainshowers', 'heavyrainshowers', 'lightrainshowers',
        'snowshowers', 'heavysnowshowers', 'lightsnowshowers',
        'sleetshowers', 'heavysleetshowers', 'lightsleetshowers',
        'rainshowersandthunder', 'heavyrainshowersandthunder', 'lightrainshowersandthunder',
        'snowshowersandthunder', 'heavysnowshowersandthunder', 'lightsnowshowersandthunder',
        'sleetshowersandthunder', 'heavysleetshowersandthunder', 'lightsleetshowersandthunder',
        'hailshowers', 'hailshowersandthunder',
        'rainshowerspolartwilight', 'snowshowerspolartwilight', 'sleetshowerspolartwilight', 'hailshowerspolartwilight',
        'rainshowersandthunderpolartwilight', 'snowshowersandthunderpolartwilight', 'sleetshowersandthunderpolartwilight', 'hailshowersandthunderpolartwilight',
        'clearsky_polartwilight', 'partlycloudy_polartwilight', 'fair_polartwilight'
    ]);
    // Helper to append _day/_night if needed
    const dn = (base) => (hasDayNight.has(base) && day !== undefined ? base + (day ? '_day' : '_night') : base);
    // Expanded mapping for all known HA conditions and common custom ones
    const mapping = {
        // Standard HA conditions
        "clear-night": () => "clearsky_night",
        "clear-day": () => "clearsky_day",
        "sunny": () => "clearsky_day",
        "cloudy": () => "cloudy",
        "overcast": () => "cloudy",
        "mostlycloudy": () => "cloudy",
        "partlycloudy": () => dn("partlycloudy"),
        "partly-sunny": () => dn("partlycloudy"),
        "partly-cloudy-night": () => "partlycloudy_night",
        "fog": () => "fog",
        "hail": () => "hail",
        "lightning": () => "thunderstorm",
        "lightning-rainy": () => dn("rainshowersandthunder"),
        "pouring": () => "heavyrain",
        "rainy": () => "rain",
        "drizzle": () => "lightrain",
        "freezing-rain": () => "sleet",
        "snowy": () => "snow",
        "snowy-rainy": () => "sleet",
        "windy": () => dn("fair"),
        "windy-variant": () => dn("fair"),
        "exceptional": () => "clearsky_day",
        // Extra/rare conditions
        "hot": () => "clearsky_day",
        "cold": () => day === false ? "clearsky_night" : "clearsky_day",
        // Direct Met.no symbol codes (for Met.no API users)
        "fair": () => dn("fair"),
        "rainshowers": () => dn("rainshowers"),
        "heavyrainshowers": () => dn("heavyrainshowers"),
        "lightrainshowers": () => dn("lightrainshowers"),
        "snowshowers": () => dn("snowshowers"),
        "heavysnowshowers": () => dn("heavysnowshowers"),
        "lightsnowshowers": () => dn("lightsnowshowers"),
        "sleetshowers": () => dn("sleetshowers"),
        "heavysleetshowers": () => dn("heavysleetshowers"),
        "lightsleetshowers": () => dn("lightsleetshowers"),
        "rainshowersandthunder": () => dn("rainshowersandthunder"),
        "heavyrainshowersandthunder": () => dn("heavyrainshowersandthunder"),
        "lightrainshowersandthunder": () => dn("lightrainshowersandthunder"),
        "snowshowersandthunder": () => dn("snowshowersandthunder"),
        "heavysnowshowersandthunder": () => dn("heavysnowshowersandthunder"),
        "lightsnowshowersandthunder": () => dn("lightsnowshowersandthunder"),
        "sleetshowersandthunder": () => dn("sleetshowersandthunder"),
        "heavysleetshowersandthunder": () => dn("heavysleetshowersandthunder"),
        "lightsleetshowersandthunder": () => dn("lightsleetshowersandthunder"),
        "hailshowers": () => dn("hailshowers"),
        "hailshowersandthunder": () => dn("hailshowersandthunder"),
        // Non-day/night Met.no codes
        "rain": () => "rain",
        "heavyrain": () => "heavyrain",
        "lightrain": () => "lightrain",
        "snow": () => "snow",
        "heavysnow": () => "heavysnow",
        "lightsnow": () => "lightsnow",
        "sleet": () => "sleet",
        "heavysleet": () => "heavysleet",
        "lightsleet": () => "lightsleet",
        "thunderstorm": () => "thunderstorm",
        "clearsky": () => dn("clearsky")
    };
    // Normalize condition to lowercase for mapping
    const cond = condition ? condition.toLowerCase() : "";
    const entry = mapping[cond];
    if (typeof entry === 'function')
        return entry(date, day);
    if (typeof entry === 'string')
        return entry;
    // Fallback: if condition ends with -night, use _night, if -day or -daytime, use _day
    if (cond.endsWith('-night'))
        return cond.replace('-night', '_night');
    if (cond.endsWith('-day') || cond.endsWith('-daytime'))
        return cond.replace(/-day(time)?$/, '_day');
    // Fallback: unknown condition, use clearsky_day or clearsky_night
    return day === false ? "clearsky_night" : "clearsky_day";
}

// Common unit conversion helpers for meteogram-card
// Based on Home Assistant conventions
function convertTemperature(value, from, to) {
    if (from === to)
        return value;
    if (to === "°F")
        return value * 9 / 5 + 32;
    console.warn(`[meteogram-card] Temperature conversion from ${from} to ${to} not implemented.`);
    return value;
}
function convertPressure(value, from, to) {
    if (from === to)
        return value;
    if (to === "inHg")
        return value * 0.029529983071445;
    console.warn(`[meteogram-card] Pressure conversion from ${from} to ${to} not implemented.`);
    return value;
}
function convertWindSpeed(value, from, to) {
    if (from === to)
        return value;
    if (from === "m/s" && to === "km/h")
        return value * 3.6;
    if (from === "km/h" && to === "m/s")
        return value / 3.6;
    if (from === "m/s" && to === "mph")
        return value * 2.2369362920544;
    if (from === "mph" && to === "m/s")
        return value / 2.2369362920544;
    if (from === "km/h" && to === "mph")
        return value * 0.62137119223733;
    if (from === "mph" && to === "km/h")
        return value / 0.62137119223733;
    // Knots conversions for wind barbs
    if (from === "m/s" && to === "kt")
        return value * 1.9438444924574;
    if (from === "kt" && to === "m/s")
        return value / 1.9438444924574;
    if (from === "km/h" && to === "kt")
        return value * 0.5399568034557;
    if (from === "kt" && to === "km/h")
        return value / 0.5399568034557;
    if (from === "mph" && to === "kt")
        return value * 0.8689762419006;
    if (from === "kt" && to === "mph")
        return value / 0.8689762419006;
    console.warn(`[meteogram-card] Wind speed conversion from ${from} to ${to} not implemented.`);
    return value;
}
function convertPrecipitation(value, from, to) {
    if (from === to)
        return value;
    if (to === "in")
        return value * 0.0393701;
    console.warn(`[meteogram-card] Precipitation conversion from ${from} to ${to} not implemented.`);
    return value;
}

const meteogramCardStyles = i$3 `
    :host {
        display: block;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
    }

    ha-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #222);
    }

    .card-header {
        padding: 16px 16px 0 16px;
        font-size: 1.25em;
        font-weight: 500;
        line-height: 1.2;
        color: var(--primary-text-color, #222);
    }

    .card-content {
        position: relative;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 0 16px 16px 16px;
        box-sizing: border-box;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
    }

    #chart {
        width: 100%;
        height: 100%;
        min-height: 180px;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
    }

    .error {
        color: var(--error-color, #b71c1c);
        padding: 16px;
    }

    .temp-line {
        stroke-width: 3;
        fill: none;
    }
    
    .pressure-line {
        /* Uses theme variable, fallback is blue for debug */
        stroke: var(--meteogram-pressure-line-color, blue);
        stroke-width: 4;
        stroke-dasharray: 3, 3;
        fill: none;
    }
    :host([dark]) .pressure-line {
        stroke: var(--meteogram-pressure-line-color, #90caf9);
    }

    .rain-bar {
        fill: var(--meteogram-rain-bar-color, deepskyblue);
        opacity: 0.8;
    }
    :host([dark]) .rain-bar {
        fill: var(--meteogram-rain-bar-color, deepskyblue);
    }

    .rain-max-bar {
        fill: var(--meteogram-rain-max-bar-color, #7fdbff);
        opacity: 0.5;
    }
    :host([dark]) .rain-max-bar {
        fill: var(--meteogram-rain-max-bar-color, #7fdbff);
    }

    .rain-label {
        font: var(--meteogram-label-font-size, 0.875rem) sans-serif;
        text-anchor: middle;
        font-weight: bold;
        fill: var(--meteogram-rain-label-color, #0058a3);
    }
    :host([dark]) .rain-label {
        fill: var(--meteogram-rain-label-color, #a3d8ff);
    }

    .rain-max-label {
        font: var(--meteogram-label-font-size, 0.875rem) sans-serif;
        text-anchor: middle;
        font-weight: bold;
        fill: var(--meteogram-rain-max-bar-color, #2693e6);
    }
    :host([dark]) .rain-max-label {
        fill: var(--meteogram-rain-max-bar-color, #2693e6);
    }

    .legend {
        font: var(--meteogram-legend-font-size) sans-serif;
        fill: var(--primary-text-color, #222);
    }
    :host([dark]) .legend {
        fill: var(--primary-text-color, #fff);
    }

    .legend-temp {
        fill: var(--meteogram-temp-line-color, orange);
    }
    :host([dark]) .legend-temp {
        fill: var(--meteogram-temp-line-color, orange);
    }

    .legend-pressure {
        fill: var(--meteogram-pressure-line-color, #90caf9);
    }
    :host([dark]) .legend-pressure {
        fill: var(--meteogram-pressure-line-color, #90caf9);
    }

    .legend-rain {
        fill: var(--meteogram-rain-bar-color, deepskyblue);
    }
    :host([dark]) .legend-rain {
        fill: var(--meteogram-rain-bar-color, deepskyblue);
    }

    .legend-cloud {
        fill: var(--meteogram-cloud-color, #b0bec5);
    }
    :host([dark]) .legend-cloud {
        fill: var(--meteogram-cloud-color, #eceff1);
    }
    .wind-barb {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
        stroke-width: 2;
        fill: none;
    }
    :host([dark]) .wind-barb {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
    }

    .wind-barb-feather {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
        stroke-width: 2;
    }
    :host([dark]) .wind-barb-feather {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
    }

    .wind-barb-half {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
        stroke-width: 2;
    }
    :host([dark]) .wind-barb-half {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
    }

    .wind-barb-calm {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
        fill: none;
    }
    :host([dark]) .wind-barb-calm {
        stroke: var(--meteogram-wind-barb-color, #1976d2);
    }

    .wind-barb-dot {
        fill: var(--meteogram-wind-barb-color, #1976d2);
    }
    :host([dark]) .wind-barb-dot {
        fill: var(--meteogram-wind-barb-color, #1976d2);
    }

    .top-date-label {
        font: var(--meteogram-label-font-size, 16px) sans-serif;
        fill: var(--primary-text-color, #222);
        font-weight: bold;
        dominant-baseline: hanging;
    }
    :host([dark]) .top-date-label {
        fill: var(--primary-text-color, #fff);
    }

    .bottom-hour-label {
        font: var(--meteogram-label-font-size, 0.875rem) sans-serif;
        fill: var(--meteogram-timescale-color, #ffb300);
    }
    :host([dark]) .bottom-hour-label {
        fill: var(--meteogram-timescale-color, #ffd54f);
    }

    .day-bg {
        fill: transparent !important;
        opacity: 0;
        pointer-events: none;
    }

    .wind-band-bg {
        fill: transparent;
    }

    /* .attribution is not used, move its styles to .attribution-icon-wrapper for correct layout */
    .attribution-icon-wrapper {
        position: absolute;
        top: 12px;
        right: 24px;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 32px;
        width: 32px;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        text-align: right;
        background: rgba(255, 255, 255, 0.7);
        padding: 2px 8px;
        border-radius: 6px;
        pointer-events: auto;
    }
    :host([dark]) .attribution-icon-wrapper {
        background: transparent;
    }

    /* Tick text font size for axes */

    .temperature-axis .tick text,
    .pressure-axis .tick text {
        font-size: var(--meteogram-tick-font-size);
        fill: var(--primary-text-color, #222);
    }

    .cloud-area {
        fill: var(--meteogram-cloud-color, #b0bec5);
        opacity: 0.42;
    }
    :host([dark]) .cloud-area {
        fill: var(--meteogram-cloud-color, #eceff1);
        opacity: 0.55;
    }

    .axis-label {
        font: var(--meteogram-label-font-size, 14px) sans-serif;
        fill: var(--meteogram-axis-label-color, #000);
    }
    :host([dark]) .axis-label {
        fill: var(--meteogram-axis-label-color, #fff);
    }

    .grid line,
    .xgrid line,
    .wind-band-grid,
    .twentyfourh-line,
    .twentyfourh-line-wind,
    .day-tic,
    .temperature-axis path,
    .pressure-axis path,
    .wind-band-outline {
        stroke: var(--meteogram-grid-color, #b8c4d9);
    }
    :host([dark]) .grid line,
    :host([dark]) .xgrid line,
    :host([dark]) .wind-band-grid,
    :host([dark]) .twentyfourh-line,
    :host([dark]) .twentyfourh-line-wind,
    :host([dark]) .day-tic,
    :host([dark]) .temperature-axis path,
    :host([dark]) .pressure-axis path,
    :host([dark]) .wind-band-outline {
        stroke: var(--meteogram-grid-color, #444);
    }
    .wind-band-grid {
        stroke-width: 1;
    }
    .twentyfourh-line, .day-tic {
        stroke-width: 3;
        stroke-dasharray: 6, 5;
        opacity: 0.7;
    }
    .twentyfourh-line-wind {
        stroke-width: 2.5;
        stroke-dasharray: 6, 5;
        opacity: 0.5;
    }


    .attribution-icon-wrapper {
        position: absolute;
        top: 12px;
        right: 24px;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 32px;
        width: 32px;
    }
    .attribution-icon {
        cursor: pointer;
        position: relative;
        display: inline-block;
        outline: none;
    }
    .attribution-tooltip {
        display: none;
        position: absolute;
        top: 120%;
        right: 0;
        background: rgba(255,255,255,0.98);
        color: #222;
        border: 1px solid #bbb;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        padding: 8px 12px;
        min-width: 220px;
        max-width: 340px;
        font-size: 0.97em;
        z-index: 10;
        white-space: normal;
        pointer-events: none;
    }
    .attribution-icon:focus .attribution-tooltip,
    .attribution-icon:hover .attribution-tooltip,
    .attribution-tooltip.open {
        display: block;
        pointer-events: auto;
    }
`;

// meteogram-chart.ts
// Handles all SVG/D3 chart rendering for MeteogramCard
// Make the mapping function available globally for chart rendering
if (typeof window !== "undefined") {
    window.mapHaConditionToMetnoSymbol = mapHaConditionToMetnoSymbol;
}
class MeteogramChart {
    /**
     * Draw weather icons at each time step
     */
    drawWeatherIcons(chart, symbolCode, temperatureConverted, x, yTemp, data, N) {
        // If denseWeatherIcons is true, show all icons (interval 1)
        // Otherwise, space icons so they don't overlap (e.g., 44px per icon)
        const minIconSpacing = 44; // px, icon is 40px wide
        const chartWidth = this.card._chartWidth || 400;
        const maxIcons = Math.floor(chartWidth / minIconSpacing);
        const iconInterval = this.card.denseWeatherIcons
            ? 1
            : Math.max(1, Math.ceil(N / maxIcons));
        chart.selectAll(".weather-icon")
            .data(symbolCode)
            .enter()
            .append("foreignObject")
            .attr("class", "weather-icon")
            .attr("x", (_, i) => x(i) - 20)
            .attr("y", (_, i) => {
            const temp = temperatureConverted[i];
            return temp !== null ? yTemp(temp) - 40 : -999;
        })
            .attr("width", 40)
            .attr("height", 40)
            .attr("opacity", (_, i) => (temperatureConverted[i] !== null && i % iconInterval === 0) ? 1 : 0)
            .each((d, i, nodes) => {
            if (i % iconInterval !== 0)
                return;
            const node = nodes[i];
            if (!d)
                return;
            let iconName = d;
            if (this.card.entityId && this.card.entityId !== 'none' && this.card._weatherEntityApiInstance) {
                const forecastTime = data.time[i];
                const isDay = this.card.isDaytimeAt(forecastTime);
                iconName = window.mapHaConditionToMetnoSymbol
                    ? window.mapHaConditionToMetnoSymbol(d, forecastTime, isDay)
                    : d;
            }
            iconName = iconName
                .replace(/^lightssleet/, 'lightsleet')
                .replace(/^lightssnow/, 'lightsnow')
                .replace(/^lightrainshowers$/, 'lightrainshowersday')
                .replace(/^rainshowers$/, 'rainshowersday')
                .replace(/^heavyrainshowers$/, 'heavyrainshowersday');
            if (this.card.getIconSVG) {
                this.card.getIconSVG(iconName).then((svgContent) => {
                    if (svgContent) {
                        const div = document.createElement('div');
                        div.style.width = '40px';
                        div.style.height = '40px';
                        div.innerHTML = svgContent;
                        node.appendChild(div);
                    }
                });
            }
        });
    }
    constructor(cardInstance) {
        this.card = cardInstance;
    }
    /**
     * Ensures D3.js is loaded globally (window.d3). Returns a promise that resolves when D3 is available.
     */
    async ensureD3Loaded() {
        if (window.d3)
            return;
        // Check if a script is already loading
        if (window._meteogramD3LoadingPromise) {
            await window._meteogramD3LoadingPromise;
            return;
        }
        // Otherwise, load D3 dynamically
        window._meteogramD3LoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            script.async = true;
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load D3.js library'));
            };
            document.head.appendChild(script);
        });
        await window._meteogramD3LoadingPromise;
    }
    drawGridOutline(chart) {
        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", this.card._chartWidth)
            .attr("y1", 0).attr("y2", 0)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);
        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", this.card._chartWidth)
            .attr("y1", this.card._chartHeight).attr("y2", this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)");
        chart.append("line")
            .attr("class", "line")
            .attr("x1", this.card._chartWidth).attr("x2", this.card._chartWidth)
            .attr("y1", 0).attr("y2", this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);
        chart.append("line")
            .attr("class", "line")
            .attr("x1", 0).attr("x2", 0)
            .attr("y1", 0).attr("y2", this.card._chartHeight)
            .attr("stroke", "var(--meteogram-grid-color, #e0e0e0)")
            .attr("stroke-width", 3);
    }
    drawBottomHourLabels(svg, time, margin, x, windBandHeight, width) {
        const hourLabelY = margin.top + this.card._chartHeight + windBandHeight + 15;
        svg.selectAll(".bottom-hour-label")
            .data(time)
            .enter()
            .append("text")
            .attr("class", "bottom-hour-label")
            .attr("x", (_, i) => margin.left + x(i))
            .attr("y", hourLabelY)
            .attr("text-anchor", "middle")
            .text((d, i) => {
            const haLocale = this.card.getHaLocale();
            const hour = d.toLocaleTimeString(haLocale, { hour: "2-digit", hour12: false });
            if (width < 400) {
                return i % 6 === 0 ? hour : "";
            }
            else if (width > 800) {
                return i % 2 === 0 ? hour : "";
            }
            else {
                return i % 3 === 0 ? hour : "";
            }
        });
    }
    drawTemperatureLine(chart, temperature, x, yTemp, legendX, legendY) {
        const d3 = window.d3;
        // Create a gradient that transitions from blue (cold/below freezing) to red (warm/above freezing)
        // Use userSpaceOnUse so we can position gradient stops at exact Y coordinates
        const gradientId = `temp-gradient-${Math.random().toString(36).substr(2, 9)}`;
        this.card._debugLog(`🎨 Creating temperature gradient with ID: ${gradientId}`);
        const defs = chart.append("defs");
        // Get the temperature domain and calculate actual Y positions
        const tempDomain = yTemp.domain(); // [min, max] in temperature units
        const minTemp = tempDomain[0];
        const maxTemp = tempDomain[1];
        const minTempY = yTemp(minTemp); // Bottom of temperature range
        const maxTempY = yTemp(maxTemp); // Top of temperature range
        this.card._debugLog(`🎨 Temperature domain: [${minTemp.toFixed(1)}°, ${maxTemp.toFixed(1)}°]`);
        this.card._debugLog(`🎨 Temperature Y positions: max temp ${maxTemp.toFixed(1)}° at Y=${maxTempY.toFixed(1)}px, min temp ${minTemp.toFixed(1)}° at Y=${minTempY.toFixed(1)}px`);
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse") // Use absolute SVG coordinates
            .attr("x1", 0)
            .attr("y1", maxTempY) // Y position of warmest temperature
            .attr("x2", 0)
            .attr("y2", minTempY); // Y position of coldest temperature
        // Calculate the Y position of 0°C
        const freezingPoint = 0;
        const freezingYPos = yTemp(freezingPoint);
        const gradientRange = minTempY - maxTempY; // Total Y distance of gradient
        this.card._debugLog(`🎨 Freezing point (0°C) Y position: ${freezingYPos.toFixed(1)}px, gradient range: ${gradientRange.toFixed(1)}px`);
        // Helper function to calculate offset percentage within the gradient
        const calcOffset = (yPos) => {
            return ((yPos - maxTempY) / gradientRange) * 100;
        };
        // Create gradient stops
        const gradientStops = [];
        // If freezing point is below the visible range (all temps above freezing)
        if (minTemp > freezingPoint) {
            this.card._debugLog(`🎨 All temperatures above freezing (min: ${minTemp.toFixed(1)}°C) - using warm colors only`);
            // Warm colors: orange at coolest (still above 0°C) to deep red at warmest
            gradientStops.push({ temp: maxTemp, offset: 0, color: maxTemp >= 20 ? "#cc0000" : "#ff3300" });
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", maxTemp >= 20 ? "#cc0000" : "#ff3300");
            // Add 20°C transition if in range
            if (maxTemp > 20 && minTemp < 20) {
                const temp20Y = yTemp(20);
                const offset20 = calcOffset(temp20Y);
                gradientStops.push({ temp: 20, offset: offset20, color: "#cc0000" });
                gradient.append("stop")
                    .attr("offset", `${offset20.toFixed(1)}%`)
                    .attr("stop-color", "#cc0000");
            }
            gradientStops.push({ temp: minTemp, offset: 100, color: "#ff9933" });
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ff9933");
        }
        // If freezing point is above the visible range (all temps below freezing)
        else if (maxTemp < freezingPoint) {
            this.card._debugLog(`🎨 All temperatures below freezing (max: ${maxTemp.toFixed(1)}°C) - using cold colors only`);
            // Cold colors: light blue at warmest (still below 0°C) to deep blue at coldest
            gradientStops.push({ temp: maxTemp, offset: 0, color: "#66b3ff" });
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#66b3ff");
            // Add -5°C transition if in range
            if (maxTemp > -5 && minTemp < -5) {
                const tempMinus5Y = yTemp(-5);
                const offsetMinus5 = calcOffset(tempMinus5Y);
                gradientStops.push({ temp: -5, offset: offsetMinus5, color: "#0066cc" });
                gradient.append("stop")
                    .attr("offset", `${offsetMinus5.toFixed(1)}%`)
                    .attr("stop-color", "#0066cc");
            }
            gradientStops.push({ temp: minTemp, offset: 100, color: minTemp <= -5 ? "#003d7a" : "#0066cc" });
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", minTemp <= -5 ? "#003d7a" : "#0066cc");
        }
        // Freezing point is within the visible range - transition AT 0°C
        else {
            this.card._debugLog(`🎨 Freezing point within range - transition at 0°C (Y=${freezingYPos.toFixed(1)}px)`);
            const freezingOffset = calcOffset(freezingYPos);
            // Warmest temperature - check if >= 20°C for deep red
            const warmestColor = maxTemp >= 20 ? "#cc0000" : "#ff3300";
            gradientStops.push({ temp: maxTemp, offset: 0, color: warmestColor });
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", warmestColor);
            // Add 20°C deep red transition if in range
            if (maxTemp > 20 && 20 > freezingPoint) {
                const temp20Y = yTemp(20);
                const offset20 = calcOffset(temp20Y);
                gradientStops.push({ temp: 20, offset: offset20, color: "#cc0000" });
                gradient.append("stop")
                    .attr("offset", `${offset20.toFixed(1)}%`)
                    .attr("stop-color", "#cc0000");
                this.card._debugLog(`🎨 Deep red transition at 20°C (${offset20.toFixed(1)}%)`);
            }
            // Add 10°C orange-red transition if in range
            if (maxTemp > 10 && minTemp < 10 && 10 > freezingPoint) {
                const temp10Y = yTemp(10);
                const offset10 = calcOffset(temp10Y);
                gradientStops.push({ temp: 10, offset: offset10, color: "#ff6600" });
                gradient.append("stop")
                    .attr("offset", `${offset10.toFixed(1)}%`)
                    .attr("stop-color", "#ff6600");
                this.card._debugLog(`🎨 Orange-red transition at 10°C (${offset10.toFixed(1)}%)`);
            }
            // At freezing point from above: light orange (warm side of transition)
            gradientStops.push({ temp: freezingPoint, offset: freezingOffset, color: "#ff9933" });
            gradient.append("stop")
                .attr("offset", `${freezingOffset.toFixed(1)}%`)
                .attr("stop-color", "#ff9933");
            this.card._debugLog(`🎨 Freezing point (warm side) at 0°C: light orange at ${freezingOffset.toFixed(1)}%`);
            // At freezing point from below: light blue (cold side of transition)
            gradientStops.push({ temp: freezingPoint, offset: freezingOffset, color: "#66b3ff" });
            gradient.append("stop")
                .attr("offset", `${freezingOffset.toFixed(1)}%`)
                .attr("stop-color", "#66b3ff");
            this.card._debugLog(`🎨 Freezing point (cold side) at 0°C: light blue at ${freezingOffset.toFixed(1)}%`);
            // Add -5°C deep blue transition if in range
            if (minTemp < -5 && maxTemp > -5 && -5 < freezingPoint) {
                const tempMinus5Y = yTemp(-5);
                const offsetMinus5 = calcOffset(tempMinus5Y);
                gradientStops.push({ temp: -5, offset: offsetMinus5, color: "#0066cc" });
                gradient.append("stop")
                    .attr("offset", `${offsetMinus5.toFixed(1)}%`)
                    .attr("stop-color", "#0066cc");
                this.card._debugLog(`🎨 Deep blue transition at -5°C (${offsetMinus5.toFixed(1)}%)`);
            }
            // Coldest temperature - check if <= -5°C for very deep blue
            const coldestColor = minTemp <= -5 ? "#003d7a" : "#0066cc";
            gradientStops.push({ temp: minTemp, offset: 100, color: coldestColor });
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", coldestColor);
        }
        this.card._debugLog(`🎨 Gradient stops created (${gradientStops.length} stops):`, gradientStops);
        const line = d3.line()
            .defined((d) => d !== null)
            .x((_, i) => x(i))
            .y((_, i) => temperature[i] !== null ? yTemp(temperature[i]) : 0)
            .curve(d3.curveMonotoneX);
        this.card._debugLog(`🎨 Applying gradient to temperature line with stroke: url(#${gradientId})`);
        // Check if user has set a custom color that would override the gradient
        const tempLineColorVar = getComputedStyle(this.card).getPropertyValue('--meteogram-temp-line-color');
        const hasCustomColor = tempLineColorVar && tempLineColorVar.trim();
        if (hasCustomColor) {
            this.card._debugLog(`⚠️ CSS variable --meteogram-temp-line-color is set to "${tempLineColorVar.trim()}" - using custom color instead of gradient`);
        }
        else {
            this.card._debugLog(`✅ No custom --meteogram-temp-line-color set, using gradient`);
        }
        const tempPath = chart.append("path")
            .datum(temperature)
            .attr("class", "temp-line")
            .attr("d", line);
        // Apply either custom color or gradient
        if (hasCustomColor) {
            tempPath.style("stroke", tempLineColorVar.trim());
        }
        else {
            tempPath.attr("stroke", `url(#${gradientId})`);
        }
        // Verify the gradient was added to the DOM
        const gradientElement = chart.select(`#${gradientId}`);
        if (gradientElement.empty()) {
            this.card._debugLog(`⚠️ WARNING: Gradient element #${gradientId} not found in DOM!`);
        }
        else {
            this.card._debugLog(`✅ Gradient element #${gradientId} successfully added to DOM`);
            const stops = gradientElement.selectAll('stop');
            this.card._debugLog(`✅ Gradient has ${stops.size()} stops`);
        }
        // Always draw axis label (if not in focussed mode)
        if (!this.card.focussed && this.card.displayMode !== "core") {
            chart.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${-this.card._margin.left + 20},${yTemp.range()[0] / 2}) rotate(-90)`)
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.temperature", "Temperature") + " (" + this.card._tempUnit + ")");
        }
        // Draw colored top legend if coordinates are provided
        if (legendX !== undefined && legendY !== undefined) {
            chart.append("text")
                .attr("class", "legend legend-temp")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.temperature", "Temperature") + " (" + this.card._tempUnit + ")");
        }
    }
    drawChartGrid(svg, chart, d3, x, yTemp, N, margin, dayStarts) {
        // Day boundary ticks (top short ticks)
        const tickLength = 12; // Short tick length above the top line
        svg.selectAll(".day-tic")
            .data(dayStarts)
            .enter()
            .append("line")
            .attr("class", "day-tic")
            .attr("x1", (d) => margin.left + x(d))
            .attr("x2", (d) => margin.left + x(d))
            .attr("y1", margin.top - tickLength)
            .attr("y2", this.card._chartHeight + margin.top)
            .attr("stroke", "#1a237e")
            .attr("stroke-width", 3)
            .attr("opacity", 0.6);
        // Always add temperature Y axis (left side)
        chart.append("g")
            .attr("class", "temperature-axis")
            .call(window.d3.axisLeft(yTemp)
            .tickFormat((d) => `${d}`));
        // Add temperature Y axis for horizontal grid lines (no numbers)
        chart.append("g")
            .attr("class", "grid")
            .call(window.d3.axisLeft(yTemp)
            .tickSize(-this.card._chartWidth)
            .tickFormat(() => ""));
        // Add vertical gridlines
        chart.append("g")
            .attr("class", "xgrid")
            .selectAll("line")
            .data(d3.range(N))
            .enter().append("line")
            .attr("x1", (i) => x(i))
            .attr("x2", (i) => x(i))
            .attr("y1", 0)
            .attr("y2", this.card._chartHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1);
    }
    drawRainBars(chart, rain, rainMax, N, x, yPrecip, dx, legendX, legendY) {
        const barWidth = dx * 0.8;
        // Only draw rainMax bars if precipitation min/max data is available
        if (this.card._dataAvailability.precipitationMinMax) {
            // Draw the max rain range bars first (only for non-null values)
            const rainMaxData = rainMax.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
            chart.selectAll(".rain-max-bar")
                .data(rainMaxData)
                .enter()
                .append("rect")
                .attr("class", "rain-max-bar")
                .attr("x", (d) => x(d.index) + dx / 2 - barWidth / 2)
                .attr("y", (d) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7; // Minimum height of 2px for visibility
                return yPrecip(0) - scaledH;
            })
                .attr("width", barWidth)
                .attr("height", (d) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                return h < 2 && d.value > 0 ? 2 : h * 0.7;
            })
                .attr("fill", "currentColor");
        }
        // Draw main rain bars (foreground, deeper blue) - filter out null values
        const rainBarData = rain.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
        chart.selectAll(".rain-bar")
            .data(rainBarData)
            .enter().append("rect")
            .attr("class", "rain-bar")
            .attr("x", (d) => x(d.index) + dx / 2 - barWidth / 2)
            .attr("y", (d) => {
            const h = this.card._chartHeight - yPrecip(d.value);
            const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
            return yPrecip(0) - scaledH;
        })
            .attr("width", barWidth)
            .attr("height", (d) => {
            const h = this.card._chartHeight - yPrecip(d.value);
            return h < 2 && d.value > 0 ? 2 : h * 0.7;
        })
            .attr("fill", "currentColor");
        // Add main rain labels (show if rain > 0) - filter out null values
        const rainLabelData = rain.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null && d.value > 0);
        chart.selectAll(".rain-label")
            .data(rainLabelData)
            .enter()
            .append("text")
            .attr("class", "rain-label")
            .attr("x", (d) => x(d.index) + dx / 2)
            .attr("y", (d) => {
            const h = this.card._chartHeight - yPrecip(d.value);
            const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
            return yPrecip(0) - scaledH - 4; // 4px above the top of the bar
        })
            .text((d) => {
            if (d.value <= 0)
                return "";
            return d.value < 1 ? d.value.toFixed(1) : d.value.toFixed(0);
        })
            .attr("opacity", (d) => d.value > 0 ? 1 : 0);
        // Add max rain labels (only if precipitation min/max data is available)
        if (this.card._dataAvailability.precipitationMinMax) {
            const rainMaxLabelData = rainMax.slice(0, N - 1).map((d, i) => ({ value: d, index: i })).filter(d => d.value !== null);
            chart.selectAll(".rain-max-label")
                .data(rainMaxLabelData)
                .enter()
                .append("text")
                .attr("class", "rain-max-label")
                .attr("x", (d) => x(d.index) + dx / 2)
                .attr("y", (d) => {
                const h = this.card._chartHeight - yPrecip(d.value);
                const scaledH = h < 2 && d.value > 0 ? 2 : h * 0.7;
                return yPrecip(0) - scaledH - 18; // 18px above the top of the max bar
            })
                .text((d) => {
                var _a;
                const rainValue = (_a = rain === null || rain === void 0 ? void 0 : rain[d.index]) !== null && _a !== void 0 ? _a : 0;
                if (d.value <= rainValue)
                    return "";
                return d.value < 1 ? d.value.toFixed(1) : d.value.toFixed(0);
            })
                .attr("opacity", (d) => {
                var _a;
                const rainValue = (_a = rain === null || rain === void 0 ? void 0 : rain[d.index]) !== null && _a !== void 0 ? _a : 0;
                return (d.value > rainValue) ? 1 : 0;
            });
        }
        // Add precipitation legend if coordinates are provided
        if (legendX !== undefined && legendY !== undefined) {
            const precipUnit = this.card.getSystemPrecipitationUnit();
            chart.append("text")
                .attr("class", "legend legend-rain")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.precipitation", "Precipitation") + ` (${precipUnit})`);
        }
    }
    /**
    * Draw date labels at the top of the chart
    */
    drawDateLabels(svg, time, dayStarts, margin, x, chartWidth, dateLabelY) {
        if (!this.card.focussed) {
            svg.selectAll(".top-date-label")
                .data(dayStarts)
                .enter()
                .append("text")
                .attr("class", "top-date-label")
                .attr("x", (d, i) => {
                // Ensure last label does not go outside chart area
                const rawX = margin.left + x(d);
                if (i === dayStarts.length - 1) {
                    // Cap to chart right edge minus a small margin
                    return Math.min(rawX, margin.left + chartWidth - 80);
                }
                return rawX;
            })
                .attr("y", dateLabelY)
                .attr("text-anchor", "start")
                .attr("opacity", (d, i) => {
                // Check if there's enough space for this label
                if (i === dayStarts.length - 1)
                    return 1; // Always show the last day
                const thisLabelPos = margin.left + x(d);
                const nextLabelPos = margin.left + x(dayStarts[i + 1]);
                const minSpaceNeeded = 100; // Minimum pixels needed between labels
                // If not enough space between this and next label, hide this one
                return nextLabelPos - thisLabelPos < minSpaceNeeded ? 0 : 1;
            })
                .text((d) => {
                const dt = time[d];
                // Use HA locale for date formatting
                const haLocale = this.card.getHaLocale();
                return dt.toLocaleDateString(haLocale, { weekday: "short", day: "2-digit", month: "short" });
            });
        }
    }
    drawCloudBand(chart, cloudCover, N, x, legendX, legendY) {
        const d3 = window.d3;
        // Filter out nulls for cloudCover array
        const cloudFiltered = cloudCover.map(c => c !== null && c !== void 0 ? c : 0);
        const bandTop = this.card._chartHeight * 0.01;
        const bandHeight = this.card._chartHeight * 0.20;
        const cloudBandPoints = [];
        for (let i = 0; i < N; i++) {
            cloudBandPoints.push([x(i), bandTop + (bandHeight / 2) * (1 - cloudFiltered[i] / 100)]);
        }
        for (let i = N - 1; i >= 0; i--) {
            cloudBandPoints.push([x(i), bandTop + (bandHeight / 2) * (1 + cloudFiltered[i] / 100)]);
        }
        chart.append("path")
            .attr("class", "cloud-area")
            .attr("d", d3.line()
            .x((d) => d[0])
            .y((d) => d[1])
            .curve(d3.curveLinearClosed)(cloudBandPoints));
        // Render legend if legendX and legendY are provided
        if (legendX !== undefined && legendY !== undefined) {
            chart.append("text")
                .attr("class", "legend legend-cloud")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.cloud_coverage", "Cloud Cover") + ` (%)`);
        }
    }
    drawPressureLine(chart, pressure, x, yPressure, legendX, legendY) {
        const d3 = window.d3;
        //
        const pressureLine = d3.line()
            .defined((d) => d !== null && typeof d === "number" && !isNaN(d))
            .x((_, i) => x(i))
            .y((d) => yPressure(d));
        chart.append("path")
            .datum(pressure)
            .attr("class", "pressure-line")
            .attr("d", pressureLine)
            .attr("fill", "none"); // Ensure no area fill, let CSS handle stroke
        // Draw right-side pressure axis
        const pressureDomain = yPressure.domain();
        const minPressure = Math.ceil(pressureDomain[0] / 10) * 10; // Round to nearest 10
        const maxPressure = Math.floor(pressureDomain[1] / 10) * 10; // Round to nearest 10
        const pressureTicks = [];
        for (let p = minPressure; p <= maxPressure; p += 10) { // Increment by 10 instead of 1
            pressureTicks.push(p);
        }
        chart.append("g")
            .attr("class", "pressure-axis")
            .attr("transform", `translate(${this.card._chartWidth}, 0)`)
            .call(d3.axisRight(yPressure)
            .tickValues(pressureTicks)
            .tickFormat(d3.format('d')));
        // Always draw axis label (if not in focussed mode)
        if (!this.card.focussed && this.card.displayMode !== "core") {
            chart.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${this.card._chartWidth + this.card._margin.right - 20},${yPressure.range()[0] / 2}) rotate(90)`)
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.air_pressure", "Pressure") + " (" + this.card._pressureUnit + ")");
        }
        // Draw colored top legend if coordinates are provided
        if (legendX !== undefined && legendY !== undefined) {
            chart.append("text")
                .attr("class", "legend legend-pressure")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("text-anchor", "start")
                .text(trnslt(this.card.hass, "ui.card.meteogram.attributes.air_pressure", "Pressure") + " (" + this.card._pressureUnit + ")");
        }
    }
    /**
     * Draw wind band (barbs, grid, background, border)
     */
    drawWindBand(svg, x, windBandHeight, margin, width, N, time, windSpeed, windGust, windDirection, windSpeedUnit) {
        const d3 = window.d3;
        const windBandYOffset = margin.top + this.card._chartHeight;
        const windBand = svg.append('g')
            .attr('transform', `translate(${margin.left},${windBandYOffset})`);
        // Even hour grid lines
        const twoHourIdx = [];
        for (let i = 0; i < N; i++) {
            if (time[i].getHours() % 2 === 0)
                twoHourIdx.push(i);
        }
        windBand.selectAll(".wind-band-grid")
            .data(twoHourIdx)
            .enter()
            .append("line")
            .attr("class", "wind-band-grid")
            .attr("x1", (i) => x(i))
            .attr("x2", (i) => x(i))
            .attr("y1", 0)
            .attr("y2", windBandHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1);
        // Wind band border (outline)
        windBand.append("rect")
            .attr("class", "wind-band-outline")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.card._chartWidth)
            .attr("height", windBandHeight)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 2)
            .attr("fill", "none");
        windBand.append("rect")
            .attr("class", "wind-band-bg")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.card._chartWidth)
            .attr("height", windBandHeight);
        // Day change lines in wind band
        const dayChangeIdx = [];
        for (let i = 1; i < N; i++) {
            if (time[i].getDate() !== time[i - 1].getDate())
                dayChangeIdx.push(i);
        }
        windBand.selectAll(".twentyfourh-line-wind")
            .data(dayChangeIdx)
            .enter()
            .append("line")
            .attr("class", "twentyfourh-line-wind")
            .attr("x1", (i) => x(i))
            .attr("x2", (i) => x(i))
            .attr("y1", 0)
            .attr("y2", windBandHeight);
        // Detect where data transitions from hourly to 6-hourly
        // Check intervals throughout the dataset
        const intervals = [];
        for (let i = 1; i < N; i++) {
            const intervalHours = (time[i].getTime() - time[i - 1].getTime()) / (1000 * 60 * 60);
            intervals.push(intervalHours);
        }
        // Find where transition happens (interval jumps from ~1h to 6h)
        let transitionIdx = N; // Default: no transition
        for (let i = 1; i < intervals.length; i++) {
            if (intervals[i - 1] < 3 && intervals[i] >= 4) {
                transitionIdx = i;
                break;
            }
        }
        // For hourly section: use even hours, place barbs between them
        const highResIndices = [];
        for (let i = 0; i < Math.min(transitionIdx, N); i++) {
            if (time[i].getHours() % 2 === 0)
                highResIndices.push(i);
        }
        // For 6-hourly section: use all data points directly
        const lowResIndices = [];
        for (let i = transitionIdx; i < N; i++) {
            lowResIndices.push(i);
        }
        // Create wind length scale once for all barbs
        const minBarbLen = width < 400 ? 18 : 23;
        const maxBarbLen = width < 400 ? 30 : 38;
        const windLenScale = d3.scaleLinear()
            .domain([0, Math.max(15, d3.max(windSpeed.filter(v => typeof v === 'number' && !isNaN(v))) || 20)])
            .range([minBarbLen, maxBarbLen]);
        // Now place wind barbs 
        const windBarbY = windBandHeight / 2;
        // Draw high-resolution barbs (between even hours)
        for (let idx = 0; idx < highResIndices.length - 1; idx++) {
            const startIdx = highResIndices[idx];
            const endIdx = highResIndices[idx + 1];
            if (width < 400 && idx % 2 !== 0)
                continue;
            const centerX = (x(startIdx) + x(endIdx)) / 2;
            const dataIdx = Math.floor((startIdx + endIdx) / 2);
            const speed = windSpeed[dataIdx];
            const gust = windGust[dataIdx];
            const dir = windDirection[dataIdx];
            if (typeof speed !== 'number' || typeof dir !== 'number' || isNaN(speed) || isNaN(dir))
                continue;
            // Convert wind speeds to knots for proper wind barb calculation
            const speedInKnots = convertWindSpeed(speed, windSpeedUnit, "kt");
            const gustInKnots = typeof gust === 'number' && !isNaN(gust) ? convertWindSpeed(gust, windSpeedUnit, "kt") : null;
            const barbLen = windLenScale(speed);
            this.drawWindBarb(windBand, centerX, windBarbY, speedInKnots, gustInKnots, dir, barbLen, width < 400 ? 0.7 : 0.8);
        }
        // Draw low-resolution barbs (every other point for 6-hourly data = 12-hour intervals)
        for (let i = 0; i < lowResIndices.length; i++) {
            const dataIdx = lowResIndices[i];
            // For 6-hourly data, show every other point (12-hour intervals)
            // This is timezone-agnostic and adapts to when the data starts
            if (i % 2 !== 0)
                continue;
            if (width < 400 && i % 4 !== 0)
                continue; // On narrow screens, show every 24 hours (every 4th 6-hourly point)
            const speed = windSpeed[dataIdx];
            const gust = windGust[dataIdx];
            const dir = windDirection[dataIdx];
            if (typeof speed !== 'number' || typeof dir !== 'number' || isNaN(speed) || isNaN(dir))
                continue;
            // Convert wind speeds to knots for proper wind barb calculation
            const speedInKnots = convertWindSpeed(speed, windSpeedUnit, "kt");
            const gustInKnots = typeof gust === 'number' && !isNaN(gust) ? convertWindSpeed(gust, windSpeedUnit, "kt") : null;
            const barbLen = windLenScale(speed);
            this.drawWindBarb(windBand, x(dataIdx), windBarbY, speedInKnots, gustInKnots, dir, barbLen, width < 400 ? 0.7 : 0.8);
        }
    }
    /**
     * Draw a wind barb at the given position
     */
    drawWindBarb(g, x, y, speed, gust, dirDeg, len, scale = 0.8) {
        const featherLong = 12;
        const featherShort = 6;
        const featherYOffset = 3;
        const barbGroup = g.append("g")
            .attr("transform", `translate(${x},${y}) rotate(${(dirDeg) % 360}) scale(${scale})`);
        const y0 = -len / 2, y1 = +len / 2;
        if (speed < 2) {
            barbGroup.append("circle")
                .attr("class", "wind-barb-calm")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 4);
            return;
        }
        barbGroup.append("line")
            .attr("class", "wind-barb")
            .attr("x1", 0).attr("y1", y0)
            .attr("x2", 0).attr("y2", y1);
        barbGroup.append("circle")
            .attr("class", "wind-barb-dot")
            .attr("cx", 0)
            .attr("cy", y1)
            .attr("r", 4);
        let v = speed, wy = y0, step = 7;
        // Calculate pennants (50 knots each), then full feathers (10 knots), then half feathers (5 knots)
        let n50 = Math.floor(v / 50);
        v -= n50 * 50;
        let n10 = Math.floor(v / 10);
        v -= n10 * 10;
        let n5 = Math.floor(v / 5);
        v -= n5 * 5;
        // Draw pennants (triangles) for 50 knot increments
        for (let i = 0; i < n50; i++, wy += step * 1.5) {
            const pennantHeight = 10;
            const pennantWidth = featherLong;
            barbGroup.append("polygon")
                .attr("class", "wind-barb-pennant")
                .attr("points", `0,${wy} ${pennantWidth},${wy + featherYOffset} 0,${wy + pennantHeight}`)
                .attr("fill", "currentColor")
                .attr("stroke", "currentColor")
                .attr("stroke-width", 1);
        }
        // Draw full feathers for 10 knot increments
        for (let i = 0; i < n10; i++, wy += step) {
            barbGroup.append("line")
                .attr("class", "wind-barb-feather")
                .attr("x1", 0).attr("y1", wy)
                .attr("x2", featherLong).attr("y2", wy + featherYOffset)
                .attr("stroke-width", 2);
        }
        // Draw half feathers for 5 knot increments
        for (let i = 0; i < n5; i++, wy += step) {
            barbGroup.append("line")
                .attr("class", "wind-barb-half")
                .attr("x1", 0).attr("y1", wy)
                .attr("x2", featherShort).attr("y2", wy + featherYOffset / 1.5)
                .attr("stroke-width", 2);
        }
        // Draw gust feathers on the opposite side (left side) in yellow/orange
        // Only show gusts if they are greater than sustained wind speed
        if (typeof gust === 'number' && !isNaN(gust) && gust > speed) {
            let gustWy = y0;
            let gustV = gust; // Show absolute gust speed, not difference
            const gustStep = 7;
            // Calculate gust pennants, feathers, and half-feathers (showing absolute gust speed)
            let gustN50 = Math.floor(gustV / 50);
            gustV -= gustN50 * 50;
            let gustN10 = Math.floor(gustV / 10);
            gustV -= gustN10 * 10;
            let gustN5 = Math.floor(gustV / 5);
            // Draw gust pennants on the left side for 50 knot increments
            for (let i = 0; i < gustN50; i++, gustWy += gustStep * 1.5) {
                const pennantHeight = 10;
                const pennantWidth = -featherLong; // Negative for left side
                barbGroup.append("polygon")
                    .attr("class", "wind-barb-gust-pennant")
                    .attr("points", `0,${gustWy} ${pennantWidth},${gustWy + featherYOffset} 0,${gustWy + pennantHeight}`)
                    .attr("fill", "#FF8C00")
                    .attr("stroke", "#FF8C00")
                    .attr("stroke-width", 1);
            }
            // Draw gust feathers on the left side (negative x values)
            for (let i = 0; i < gustN10; i++, gustWy += gustStep) {
                barbGroup.append("line")
                    .attr("class", "wind-barb-gust-feather")
                    .attr("x1", 0).attr("y1", gustWy)
                    .attr("x2", -featherLong).attr("y2", gustWy + featherYOffset)
                    .attr("stroke", "#FF8C00") // Orange color for gusts
                    .attr("stroke-width", 2);
            }
            for (let i = 0; i < gustN5; i++, gustWy += gustStep) {
                barbGroup.append("line")
                    .attr("class", "wind-barb-gust-half")
                    .attr("x1", 0).attr("y1", gustWy)
                    .attr("x2", -featherShort).attr("y2", gustWy + featherYOffset / 1.5)
                    .attr("stroke", "#FFA500") // Slightly lighter orange for half-feathers
                    .attr("stroke-width", 2);
            }
        }
    }
}

var MeteogramCard_1;
let MeteogramCard = MeteogramCard_1 = class MeteogramCard extends i {
    // Getter for precipitation display (replaces showRain)
    get showPrecipitation() {
        // Prefer config property if present, else default to true
        return this.show_precipitation !== undefined
            ? this.show_precipitation
            : true;
    }
    constructor() {
        super();
        this._chartRenderer = null;
        // Store missing keys for diagnostics/info panel
        this._missingForecastKeys = [];
        this._availableHours = "unknown";
        this.title = "";
        // Add new configuration properties with default values
        this.showCloudCover = true;
        this.showPressure = true;
        this.showWeatherIcons = true;
        this.showWind = true;
        this.denseWeatherIcons = true; // NEW: icon density config
        this.meteogramHours = "48h"; // Default is now 48h
        this.styles = {}; // NEW: styles override
        this.diagnostics = DIAGNOSTICS_DEFAULT; // Initialize here
        this.debug = false; // Debug logging (undocumented)
        this.focussed = false; // NEW: Focussed mode
        this.displayMode = "full";
        this.aspectRatio = "16:9"; // NEW: aspect ratio config, default 16:9
        this.layoutMode = undefined;
        this.chartLoaded = false;
        this.meteogramError = "";
        this.errorCount = 0;
        this.lastErrorTime = 0;
        this._drawCallIndex = 0;
        this._weatherRetryTimeout = 0;
        this._weatherRefreshTimeout = 0;
        this._chartRenderInProgress = false;
        this._pendingRender = false;
        this._lastApiSuccess = false;
        this._margin = { top: 32, right: 48, bottom: 32, left: 48 };
        this._chartWidth = 0;
        this._chartHeight = 0;
        this.iconCache = new Map();
        this.iconBasePath = "https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/svg/";
        // Keep reference to the D3 selection to clean it up properly
        this.svg = null;
        // Track element size for resize detection
        this._resizeObserver = null;
        this._lastWidth = 0;
        this._lastHeight = 0;
        this._lastResizeTime = 0; // <-- Add this missing property
        this._resizeEndTimer = null; // Timer for detecting end of resize
        this._lastRenderedWidth = 0; // Track last rendered chart width
        this._lastRenderedHeight = 0; // Track last rendered chart height
        // Intersection observer for visibility detection
        this._intersectionObserver = null;
        // Mutation observer for detecting DOM changes
        this._mutationObserver = null;
        // Keep track of update cycles
        this._isInitialized = false;
        // Keep track of last rendered data to avoid unnecessary redraws
        this._lastRenderedData = null;
        // Change these from static to instance properties
        this.apiExpiresAt = null;
        this.apiLastModified = null;
        this.weatherDataPromise = null;
        // Add WeatherAPI instance as a class variable
        this._weatherApiInstance = null;
        // Add WeatherEntityAPI instance as a class variable
        this._weatherEntityApiInstance = null;
        // Add these properties for throttling
        this._redrawScheduled = false;
        this._lastDrawScheduleTime = 0;
        this._drawThrottleMs = 200;
        this._lastWeatherData = null;
        // Store the current units for each parameter
        this._currentUnits = {};
        // Track data availability for forecast elements
        this._dataAvailability = {
            wind: false,
            pressure: false,
            cloudCover: false,
            precipitation: false,
            precipitationMinMax: false,
            temperature: false,
            windGust: false,
        };
        // Add unit system class variables
        this._tempUnit = "°C";
        this._pressureUnit = "hPa";
        this._windSpeedUnit = "m/s";
        this._precipUnit = "mm";
        // Status panel properties
        this._statusExpiresAt = "";
        this._statusLastRender = "";
        this._statusLastFetch = "";
        this._statusApiSuccess = null;
        // Tooltip open state
        this.attributionTooltipOpen = false;
        // Store entity attribution if using weather entity
        this.entityAttribution = null;
        // --- Add missing _onAttributionIconClick and _onDocumentClick handlers ---
        this._onAttributionIconClick = (e) => {
            e.stopPropagation();
            this.attributionTooltipOpen = !this.attributionTooltipOpen;
        };
        this._onDocumentClick = (e) => {
            var _a;
            if (!this.attributionTooltipOpen)
                return;
            const path = e.composedPath ? e.composedPath() : e.path || [];
            const icon = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector(".attribution-icon");
            if (icon && path.includes(icon))
                return;
            this.attributionTooltipOpen = false;
        };
        // Handle document visibility changes (browser tab switching)
        this._onVisibilityChange = () => {
            if (document.hidden) {
                // Tab became hidden - pause subscription to save resources
                this._pauseWeatherSubscription("tab hidden");
            }
            else if (this.isConnected) {
                // Tab became visible - resume subscription and check for fresh data
                this._resumeWeatherSubscription("tab visible").then(() => {
                    this._handleVisibilityChange();
                });
            }
        };
        // Handle Home Assistant location/page changes
        this._onLocationChanged = () => {
            // Small delay to let the DOM update
            setTimeout(() => {
                if (this.isConnected && this._isElementVisible()) {
                    this._handleVisibilityChange();
                }
            }, 100);
        };
        // Add orientation change handler
        this._onOrientationChange = () => {
            // Always schedule a redraw on orientation change
            this._scheduleDrawMeteogram("orientationchange", true);
        };
        // Clean up old cache entries on card initialization (run once per page load)
        this.schedulePeriodicCacheCleanup();
        this.title = "";
        this.latitude = undefined;
        this.longitude = undefined;
        this.showCloudCover = true;
        this.showPressure = true;
        this.showWeatherIcons = true;
        this.showWind = true;
        this.denseWeatherIcons = true;
        this.meteogramHours = "48h";
    }
    /**
     * Parse meteogram_hours config to get desired hours
     * Supports both legacy string format ("48h") and new numeric format (120)
     * Returns the target hours value (not data points)
     */
    parseHoursConfig(config) {
        const value = config || "48h";
        // Handle numeric format (new)
        if (typeof value === 'number') {
            return Math.max(1, value);
        }
        // Handle string format (legacy)
        if (value === "max") {
            return "max";
        }
        // Parse legacy "XXh" format or plain numbers as strings
        const match = value.match(/^(\d+)h?$/);
        if (match) {
            return parseInt(match[1], 10);
        }
        // Fallback
        this._debugLog('⚠️ Invalid meteogram_hours value, using default 48h');
        return 48;
    }
    /**
     * Calculate how many data points are needed to cover the requested hours
     * Handles mixed-resolution data (hourly then 6-hourly)
     * Rounds up to include the timeslot containing the target end time
     */
    getDataPointsForHours(targetHours, timeArray) {
        if (targetHours === "max" || timeArray.length === 0) {
            return timeArray.length;
        }
        const startTime = timeArray[0].getTime();
        const targetEndTime = startTime + (targetHours * 60 * 60 * 1000);
        // Find the first data point that reaches or exceeds the target hours
        // This ensures we include the complete timeslot containing the end point
        for (let i = 0; i < timeArray.length; i++) {
            if (timeArray[i].getTime() >= targetEndTime) {
                return i + 1; // Include this timeslot
            }
        }
        // If target hours exceeds available data, return all points
        return timeArray.length;
    }
    // Public getter for console debugging access
    get weatherEntityAPI() {
        return this._weatherEntityApiInstance;
    }
    // Debug helper method for console access
    debugMeteogram() {
        console.log("=== METEOGRAM CARD DEBUG ===");
        console.log("Entity ID:", this.entityId);
        console.log("Weather Entity API Instance:", !!this._weatherEntityApiInstance);
        console.log("Weather API Instance:", !!this._weatherApiInstance);
        console.log("Card Configuration:", {
            entityId: this.entityId,
            latitude: this.latitude,
            longitude: this.longitude,
            diagnostics: this.diagnostics,
            usingEntity: !!this.entityId && this.entityId !== "none",
            usingDirectAPI: !!(this.latitude && this.longitude),
        });
        if (this._weatherEntityApiInstance) {
            console.log("Weather Entity API available - use: card.weatherEntityAPI.getFreshnessSummary()");
            return this._weatherEntityApiInstance.getFreshnessSummary();
        }
        else if (this._weatherApiInstance) {
            console.log("Using Met.no API directly - Entity API not available");
            console.log("API Instance:", this._weatherApiInstance);
            return "Using Met.no API directly - no entity debugging available";
        }
        else {
            console.log("No weather instances available - card may not be initialized");
            return "Card not fully initialized";
        }
    }
    // Debug helper method for conditional logging
    _debugLog(...args) {
        if (this.debug) {
            console.debug(...args);
        }
    }
    // Add a method to fetch icons
    async getIconSVG(iconName) {
        // Return from cache if available
        if (this.iconCache.has(iconName)) {
            return this.iconCache.get(iconName);
        }
        try {
            // Add a console log to debug the URL
            const iconUrl = `${this.iconBasePath}${iconName}.svg`;
            // Fetch from GitHub
            const response = await fetch(iconUrl);
            if (!response.ok) {
                // Fallback: if iconName ends with _day or _night, try base icon
                if (iconName.endsWith("_day") || iconName.endsWith("_night")) {
                    const baseIcon = iconName.replace(/_(day|night)$/, "");
                    const fallbackUrl = `${this.iconBasePath}${baseIcon}.svg`;
                    const fallbackResponse = await fetch(fallbackUrl);
                    if (fallbackResponse.ok) {
                        const svgText = await fallbackResponse.text();
                        if (svgText.includes("<svg") && svgText.length > 20) {
                            this.iconCache.set(baseIcon, svgText);
                            return svgText;
                        }
                    }
                }
                console.warn(`Failed to load icon: ${iconName}, status: ${response.status}`);
                return "";
            }
            const svgText = await response.text();
            // Basic validation that we got SVG content
            if (!svgText.includes("<svg") || svgText.length < 20) {
                console.warn(`Invalid SVG content for ${iconName}`);
                return "";
            }
            // Store in cache
            this.iconCache.set(iconName, svgText);
            return svgText;
        }
        catch (error) {
            console.error(`Error loading icon ${iconName}:`, error);
            return ""; // Return empty SVG on error
        }
    }
    // Helper to schedule a meteogram draw if not already scheduled
    _scheduleDrawMeteogram(source = "unknown", force = false) {
        const now = Date.now();
        this._drawCallIndex++;
        const callerId = `${source}#${this._drawCallIndex}`;
        this._debugLog(`[${CARD_NAME}] _scheduleDrawMeteogram called from: ${callerId}`);
        // Only skip if not forced
        if (!force &&
            (this._redrawScheduled ||
                now - this._lastDrawScheduleTime < this._drawThrottleMs)) {
            this._debugLog(`[${CARD_NAME}] _scheduleDrawMeteogram: redraw already scheduled or throttled, skipping.`);
            return;
        }
        this._redrawScheduled = true;
        this._lastDrawScheduleTime = now;
        setTimeout(() => {
            this._redrawScheduled = false;
            this._lastDrawScheduleTime = Date.now();
            this._drawMeteogram(callerId);
        }, 50);
    }
    // Required for Home Assistant
    setConfig(config) {
        var _a;
        // --- MIGRATION LOGIC FOR FOCUSSED/DISPLAYMODE ---
        let migratedDisplayMode = "full";
        // Change to use config.display_mode instead of config.displayMode
        if (typeof config.display_mode === "string") {
            migratedDisplayMode = config.display_mode;
        }
        else if (typeof config.focussed === "boolean") {
            migratedDisplayMode = config.focussed ? "focussed" : "full";
        }
        // Truncate to 4 decimals for comparison
        const configLat = config.latitude !== undefined
            ? parseFloat(Number(config.latitude).toFixed(4))
            : undefined;
        const configLon = config.longitude !== undefined
            ? parseFloat(Number(config.longitude).toFixed(4))
            : undefined;
        this.latitude !== undefined
            ? parseFloat(Number(this.latitude).toFixed(4))
            : undefined;
        this.longitude !== undefined
            ? parseFloat(Number(this.longitude).toFixed(4))
            : undefined;
        if (config.title)
            this.title = config.title;
        if (config.latitude !== undefined)
            this.latitude = configLat;
        if (config.longitude !== undefined)
            this.longitude = configLon;
        if (Number.isFinite(config.altitude)) {
            this.altitude = config.altitude;
        }
        else {
            this.altitude = undefined;
        }
        this.showCloudCover =
            config.show_cloud_cover !== undefined ? config.show_cloud_cover : true;
        this.showPressure =
            config.show_pressure !== undefined ? config.show_pressure : true;
        this.showWeatherIcons =
            config.show_weather_icons !== undefined
                ? config.show_weather_icons
                : true;
        this.showWind = config.show_wind !== undefined ? config.show_wind : true;
        this.denseWeatherIcons =
            config.dense_weather_icons !== undefined
                ? config.dense_weather_icons
                : true;
        this.meteogramHours = config.meteogram_hours || "48h";
        this.styles = config.styles || {};
        // Add diagnostics option
        this.diagnostics =
            config.diagnostics !== undefined
                ? config.diagnostics
                : DIAGNOSTICS_DEFAULT;
        // Add debug option (undocumented)
        this.debug = config.debug !== undefined ? config.debug : false;
        // Set entityId from config
        this.entityId = config.entity_id || undefined;
        // Ensure boolean for focussed mode
        this.focussed = migratedDisplayMode === "focussed";
        // Set displayMode from config (now migrated from display_mode)
        this.displayMode = migratedDisplayMode;
        this.aspectRatio = config.aspect_ratio || "16:9";
        // Add support for layoutMode
        this.layoutMode = (_a = config.layout_mode) !== null && _a !== void 0 ? _a : "sections";
        // Initialize units whenever hass config changes
        if (this.hass) {
            this._initializeUnits();
        }
        // Track previous entityId
        const prevEntityId = this.entityId;
        const newEntityId = config.entity_id || undefined;
        const entityIdChanged = prevEntityId !== newEntityId;
        // Update entityId
        this.entityId = newEntityId;
        // Handle WeatherEntityAPI lifecycle based on entityId changes
        if (entityIdChanged) {
            if (prevEntityId != null) {
                // Was set, now changed: destroy old
                if (this._weatherEntityApiInstance) {
                    this._weatherEntityApiInstance.destroy("entityId changed");
                    this._weatherEntityApiInstance = null;
                }
            }
            if (newEntityId) {
                // now set: construct new API
                if (this.hass) {
                    this._debugLog(`[${CARD_NAME}] setConfig Initializing WeatherEntityAPI for entity: ${this.entityId}`, this.hass);
                    this._weatherEntityApiInstance = new WeatherEntityAPI(this.hass, newEntityId, this, "setConfig", this.debug);
                }
            } // else remains null
        }
    }
    // Required for HA visual editor support
    static getConfigElement() {
        // Pre-initialize the editor component for faster display
        const editor = document.createElement("meteogram-card-editor");
        // Create a basic config to start with
        editor.setConfig({
            show_cloud_cover: true,
            show_pressure: true,
            show_precipitation: true, // Use new option
            show_weather_icons: true,
            show_wind: true,
            dense_weather_icons: true,
            meteogram_hours: "48h",
            diagnostics: DIAGNOSTICS_DEFAULT, // Default to DIAGNOSTICS_DEFAULT
            debug: false, // Debug logging (undocumented)
        });
        return editor;
    }
    // Define card configuration type
    static getStubConfig() {
        return {
            title: "Weather Forecast",
            show_cloud_cover: true,
            show_pressure: true,
            show_precipitation: true, // Use new option
            show_weather_icons: true,
            show_wind: true,
            dense_weather_icons: true,
            meteogram_hours: "48h",
            diagnostics: DIAGNOSTICS_DEFAULT, // Default to DIAGNOSTICS_DEFAULT
            debug: false, // Debug logging (undocumented)
            altitude: undefined, // Optional altitude for WeatherAPI
            // Coordinates will be fetched from HA configuration
        };
    }
    // According to the boilerplate, add getCardSize for panel mode
    getCardSize() {
        return 9; // Returns a height in units of 50 pixels
    }
    // The rules for sizing your card in the grid in sections view
    getGridOptions() {
        return {
            rows: 8,
            columns: "full",
            min_rows: 4,
            max_rows: 8,
        };
    }
    // Handle initial setup - now properly setup resize observer
    connectedCallback() {
        super.connectedCallback();
        // Initialize internal state variables (NOT config properties)
        this.chartLoaded = false;
        this.meteogramError = "";
        this.errorCount = 0;
        this.lastErrorTime = 0;
        this._statusExpiresAt = "";
        this._statusLastRender = "";
        this._statusLastFetch = "";
        this._statusApiSuccess = null;
        this._isInitialized = false;
        // Wait for DOM to be ready before setting up observers
        this.updateComplete.then(() => {
            this._setupResizeObserver();
            this._setupVisibilityObserver();
            this._setupMutationObserver();
            // Also handle browser tab visibility changes
            document.addEventListener("visibilitychange", this._onVisibilityChange.bind(this));
            // Handle page/panel navigation events
            window.addEventListener("location-changed", this._onLocationChanged.bind(this));
            // Handle orientation changes (screen rotation)
            window.addEventListener("orientationchange", this._onOrientationChange.bind(this));
            // Handle re-entry into DOM after being removed temporarily
            if (this.isConnected) {
                if (!this.chartLoaded) {
                    this.loadD3AndDraw();
                }
                else {
                    this._scheduleDrawMeteogram("connectedCallback");
                }
            }
        });
        document.addEventListener("click", this._onDocumentClick, true);
    }
    // Clean up all event listeners
    disconnectedCallback() {
        this._teardownResizeObserver(); // <-- Implemented teardown for resize observer
        this._teardownVisibilityObserver();
        this._teardownMutationObserver();
        if (this._weatherEntityApiInstance) {
            this._weatherEntityApiInstance.destroy("disconnectedCallback");
            this._weatherEntityApiInstance = null;
        }
        document.removeEventListener("visibilitychange", this._onVisibilityChange.bind(this));
        window.removeEventListener("location-changed", this._onLocationChanged.bind(this));
        window.removeEventListener("orientationchange", this._onOrientationChange.bind(this));
        document.removeEventListener("click", this._onDocumentClick, true);
        this.cleanupChart();
        // Clear retry timer if present
        if (this._weatherRetryTimeout) {
            clearTimeout(this._weatherRetryTimeout);
            this._weatherRetryTimeout = null;
        }
        // Clear refresh timer if present
        if (this._weatherRefreshTimeout) {
            clearTimeout(this._weatherRefreshTimeout);
            this._weatherRefreshTimeout = null;
        }
        super.disconnectedCallback();
    }
    // Helper method to check if element is currently visible
    _isElementVisible() {
        if (!this.isConnected || !this.shadowRoot)
            return false;
        // Check if document is visible at all
        if (document.hidden)
            return false;
        const element = this.shadowRoot.host;
        if (!element)
            return false;
        // Check if element has dimensions
        if (element.offsetWidth === 0 && element.offsetHeight === 0)
            return false;
        // Check computed style
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.display === "none")
            return false;
        if (computedStyle.visibility === "hidden")
            return false;
        // Check if element is in viewport with getBoundingClientRect
        const rect = element.getBoundingClientRect();
        if (rect.top + rect.height <= 0 ||
            rect.left + rect.width <= 0 ||
            rect.bottom >= window.innerHeight ||
            rect.right >= window.innerWidth) {
            return false;
        }
        return true;
    }
    // Set up visibility observer to detect when card becomes visible
    _setupVisibilityObserver() {
        var _a;
        if (!this._intersectionObserver) {
            this._intersectionObserver = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        this._handleVisibilityChange();
                        break;
                    }
                }
            }, {
                threshold: [0.1], // Trigger when 10% of the card is visible
            });
            // Start observing the card element itself
            if ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.host) {
                this._intersectionObserver.observe(this.shadowRoot.host);
            }
        }
    }
    // Clean up visibility observer
    _teardownVisibilityObserver() {
        if (this._intersectionObserver) {
            this._intersectionObserver.disconnect();
            this._intersectionObserver = null;
        }
    }
    // Detect DOM changes that may affect visibility (like tab switching in HA)
    _setupMutationObserver() {
        var _a;
        if (!this._mutationObserver) {
            this._mutationObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    // Look specifically for the ha-tabs mutations that happen when switching tabs
                    if (mutation.target instanceof HTMLElement &&
                        (mutation.target.tagName === "HA-TAB" ||
                            mutation.target.tagName === "HA-TABS" ||
                            mutation.target.classList.contains("content") ||
                            mutation.target.hasAttribute("active"))) {
                        break;
                    }
                    // Check for display/visibility style changes
                    if (mutation.type === "attributes" &&
                        (mutation.attributeName === "style" ||
                            mutation.attributeName === "class" ||
                            mutation.attributeName === "hidden" ||
                            mutation.attributeName === "active")) {
                        break;
                    }
                }
            });
            // Specifically observe HA-TABS elements for tab switching
            document
                .querySelectorAll("ha-tabs, ha-tab, ha-tab-container")
                .forEach((tabs) => {
                if (tabs) {
                    this._mutationObserver.observe(tabs, {
                        attributes: true,
                        childList: true,
                        subtree: true,
                    });
                }
            });
            // Also observe the parent elements to detect when they become visible
            // Use shadowRoot.host instead of this to get the actual HTMLElement
            const element = ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.host) || null;
            if (element instanceof HTMLElement) {
                let current = element;
                while (current && current.parentElement) {
                    this._mutationObserver.observe(current.parentElement, {
                        attributes: true,
                        attributeFilter: ["style", "class", "hidden", "active"],
                        childList: false,
                        subtree: false,
                    });
                    current = current.parentElement;
                }
            }
            // Observe the entire dashboard for broader changes
            const dashboardEl = document.querySelector("home-assistant, ha-panel-lovelace");
            if (dashboardEl) {
                this._mutationObserver.observe(dashboardEl, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }
    // Clean up mutation observer
    _teardownMutationObserver() {
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
        }
    }
    // Central handler for visibility changes
    _handleVisibilityChange() {
        var _a;
        const isVisible = this._isElementVisible();
        if (isVisible) {
            // Element became visible - ensure subscription is active
            if (this._weatherEntityApiInstance &&
                !this._weatherEntityApiInstance.isSubscriptionActive()) {
                this._debugLog(`[${CARD_NAME}] Element became visible, resuming subscription`);
                this._resumeWeatherSubscription("element visible");
            }
            const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
            const svgExists = chartDiv === null || chartDiv === void 0 ? void 0 : chartDiv.querySelector("svg");
            const chartIsVisible = chartDiv &&
                chartDiv.offsetWidth > 0 &&
                chartDiv.offsetHeight > 0;
            const needsRedraw = !this.svg ||
                !chartDiv ||
                chartDiv.innerHTML === "" ||
                chartDiv.clientWidth === 0 ||
                !svgExists;
            // Guard: If chart is already rendered and visible, skip scheduling
            if (!needsRedraw && svgExists && chartIsVisible) {
                this._debugLog(`[${CARD_NAME}] _handleVisibilityChange: chart already rendered and visible, skipping redraw.`);
                return;
            }
            if (needsRedraw && this.chartLoaded) {
                this.cleanupChart();
                this.requestUpdate();
                this.updateComplete.then(() => this._scheduleDrawMeteogram("_handleVisibilityChange"));
            }
        }
        else {
            // Element became invisible - pause subscription to save resources
            this._pauseWeatherSubscription("element hidden");
        }
    }
    // Set up resize observer to detect size changes
    _setupResizeObserver() {
        if (!this._resizeObserver) {
            this._resizeObserver = new ResizeObserver(this._onResize.bind(this));
        }
        // We need to wait for the element to be in the DOM
        setTimeout(() => {
            var _a;
            const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
            if (chartDiv && this._resizeObserver) {
                this._resizeObserver.observe(chartDiv);
            }
        }, 100);
    }
    // Clean up resize observer
    _teardownResizeObserver() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }
    // Handle resize
    _onResize(entries) {
        var _a;
        if (entries.length === 0)
            return;
        const entry = entries[0];
        const now = Date.now();
        // Track last resize time for debounce/throttle
        if (!this._lastResizeTime)
            this._lastResizeTime = 0;
        // Calculate size change
        const widthChanged = Math.abs(entry.contentRect.width - this._lastWidth) > 2;
        const heightChanged = Math.abs(entry.contentRect.height - this._lastHeight) > 2;
        const significantChange = widthChanged || heightChanged;
        // Use a longer debounce interval (350ms)
        const DEBOUNCE_INTERVAL = 350;
        // If a resize occurs during rendering, queue a redraw
        if (significantChange && this._chartRenderInProgress) {
            this._pendingRender = true;
            this._debugLog(`[${CARD_NAME}] _onResize: chart render in progress, queuing redraw after render.`);
            // Schedule final redraw after resize ends
            this._scheduleResizeEndTimer();
            return;
        }
        // Always redraw if significant change and at least DEBOUNCE_INTERVAL since last redraw
        if (significantChange && now - this._lastResizeTime > DEBOUNCE_INTERVAL) {
            this._lastWidth = entry.contentRect.width;
            this._lastHeight = entry.contentRect.height;
            this._lastResizeTime = now;
            this._scheduleDrawMeteogram("_onResize-significant");
            // Schedule final redraw after resize ends
            this._scheduleResizeEndTimer();
            return;
        }
        // Fallback: schedule redraw if not visible or if chart is missing
        const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
        if (!chartDiv || !chartDiv.querySelector("svg")) {
            this._scheduleDrawMeteogram("_onResize-fallback");
        }
        // Always schedule a final redraw after resize ends
        this._scheduleResizeEndTimer();
    }
    // Helper to schedule a timer for end-of-resize detection
    _scheduleResizeEndTimer() {
        if (this._resizeEndTimer) {
            clearTimeout(this._resizeEndTimer);
        }
        // Fire after 400ms of no further resize events
        this._resizeEndTimer = window.setTimeout(() => {
            this._onResizeEnd();
        }, 400);
    }
    // Called after resize has stopped for 400ms
    _onResizeEnd() {
        var _a;
        this._resizeEndTimer = null;
        const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
        if (!chartDiv)
            return;
        const currentWidth = chartDiv.offsetWidth;
        const currentHeight = chartDiv.offsetHeight;
        // Only redraw if the chart container size has changed since last render
        if (Math.abs(currentWidth - this._lastRenderedWidth) > 2 ||
            Math.abs(currentHeight - this._lastRenderedHeight) > 2) {
            this._debugLog(`[${CARD_NAME}] _onResizeEnd: detected final size change, scheduling redraw.`);
            this._scheduleDrawMeteogram("_onResizeEnd-final");
        }
        else {
            this._debugLog(`[${CARD_NAME}] _onResizeEnd: no significant size change since last render, skipping redraw.`);
        }
    }
    // Pause weather entity subscription when tab becomes hidden
    _pauseWeatherSubscription(from) {
        if (this._weatherEntityApiInstance &&
            this._weatherEntityApiInstance.isSubscriptionActive()) {
            this._debugLog(`[${CARD_NAME}] Pausing weather subscription from: ${from}`);
            this._weatherEntityApiInstance.pause(from);
        }
    }
    // Resume weather entity subscription when tab becomes visible
    async _resumeWeatherSubscription(from) {
        if (this._weatherEntityApiInstance &&
            !this._weatherEntityApiInstance.isSubscriptionActive()) {
            this._debugLog(`[${CARD_NAME}] Resuming weather subscription from: ${from}`);
            try {
                await this._weatherEntityApiInstance.resume(from);
                this._debugLog(`[${CARD_NAME}] Weather subscription resumed successfully from: ${from}`);
            }
            catch (error) {
                console.error(`[${CARD_NAME}] Failed to resume weather subscription from: ${from}:`, error);
            }
        }
    }
    // Life cycle hooks
    firstUpdated(_) {
        var _a;
        // Ensure styles are present in the shadow root and light DOM (host) for all environments
        const cssText = ((_a = this.constructor.styles) === null || _a === void 0 ? void 0 : _a.cssText) || "";
        // Shadow root
        const root = this.shadowRoot;
        if (root && !root.querySelector("style[data-meteogram-card]")) {
            const style = document.createElement("style");
            style.setAttribute("data-meteogram-card", "");
            style.textContent = cssText;
            root.prepend(style);
        }
        // Light DOM (host)
        if (!this.querySelector("style[data-meteogram-card]")) {
            const style = document.createElement("style");
            style.setAttribute("data-meteogram-card", "");
            style.textContent = cssText;
            this.prepend(style);
        }
        // Make sure DOM is ready before initial drawing
        setTimeout(() => {
            this.loadD3AndDraw();
        }, 50);
        this._updateDarkMode(); // Ensure dark mode is set on first update
        // Call sampleFetchWeatherEntityForecast to log weather entity data
        // if (entityId && entityId !== 'none') {
        //     MeteogramCard.sampleFetchWeatherEntityForecast(this.hass, entityId as string);
        // }
    }
    updated(changedProps) {
        var _a, _b;
        // Initialize units when hass property changes
        if (changedProps.has("hass") && this.hass) {
            this._initializeUnits();
        }
        // Only redraw if coordinates, hass, or relevant config options change, or it's the first render
        const needsRedraw = changedProps.has("latitude") ||
            changedProps.has("longitude") ||
            // changedProps.has('hass') ||
            changedProps.has("showCloudCover") ||
            changedProps.has("showPressure") ||
            changedProps.has("show_precipitation") ||
            changedProps.has("showWeatherIcons") ||
            changedProps.has("showWind") ||
            changedProps.has("denseWeatherIcons") ||
            changedProps.has("meteogramHours");
        if (!needsRedraw) {
            this._debugLog(`[${CARD_NAME}] updated(): no redraw needed or chart render in progress, skipping.`);
            return;
        }
        else {
            this._debugLog(`[${CARD_NAME}] updated(): scheduling redraw, chartLoaded=${this.chartLoaded}`);
        }
        if (this.chartLoaded && needsRedraw) {
            // Guard: If chart is already rendered and visible, skip scheduling
            const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
            chartDiv === null || chartDiv === void 0 ? void 0 : chartDiv.querySelector("svg");
            chartDiv &&
                chartDiv.offsetWidth > 0 &&
                chartDiv.offsetHeight > 0;
            this._scheduleDrawMeteogram("updated");
        }
        // Track component state for better lifecycle management
        if (!this._isInitialized && this.shadowRoot) {
            this._isInitialized = true;
            // Force a redraw when added back to the DOM after being in the editor
            if (this.chartLoaded) {
                const chartDiv = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector("#chart");
                if (chartDiv && chartDiv.innerHTML === "") {
                    this._scheduleDrawMeteogram("updated-forced");
                }
            }
        }
        this._updateDarkMode(); // Always check dark mode after update
    }
    // Helper to encode cache key as base64 of str(lat)+str(lon)
    static encodeCacheKey(lat, lon) {
        const keyStr = String(lat) + String(lon);
        // btoa works for ASCII; for full Unicode use a more robust encoder if needed
        return btoa(keyStr);
    }
    // Helper to get a truncated location key for caching (now uses base64)
    getLocationKey(lat, lon) {
        // Always use 4 decimals for both lat and lon
        return MeteogramCard_1.encodeCacheKey(Number(lat.toFixed(4)), Number(lon.toFixed(4)));
    }
    // Save HA location to localStorage under "meteogram-card-default-location"
    _saveDefaultLocationToStorage(latitude, longitude) {
        try {
            const locationObj = {
                latitude: parseFloat(latitude.toFixed(4)),
                longitude: parseFloat(longitude.toFixed(4)),
            };
            localStorage.setItem("meteogram-card-default-location", JSON.stringify(locationObj));
        }
        catch (e) {
            this._debugLog(`[${CARD_NAME}] Failed to save default location to localStorage:`, e);
        }
    }
    // Load location from localStorage under "meteogram-card-default-location"
    _loadDefaultLocationFromStorage() {
        try {
            const locationStr = localStorage.getItem("meteogram-card-default-location");
            if (locationStr) {
                try {
                    const locationObj = JSON.parse(locationStr);
                    const latitude = parseFloat(Number(locationObj.latitude).toFixed(4));
                    const longitude = parseFloat(Number(locationObj.longitude).toFixed(4));
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                        return { latitude, longitude };
                    }
                }
                catch {
                    // Ignore parse errors
                }
            }
            return null;
        }
        catch (e) {
            this._debugLog(`[${CARD_NAME}] Failed to load default location from localStorage:`, e);
            return null;
        }
    }
    // Check if we need to get location from HA
    _checkAndUpdateLocation() {
        // Try to get location from config first
        if (this.latitude !== undefined && this.longitude !== undefined) {
            this.latitude = parseFloat(Number(this.latitude).toFixed(4));
            this.longitude = parseFloat(Number(this.longitude).toFixed(4));
            // Initialize WeatherAPI instance if not already set or if lat/lon/altitude changed
            if (!this._weatherApiInstance ||
                this._weatherApiInstance.lat !== this.latitude ||
                this._weatherApiInstance.lon !== this.longitude ||
                this._weatherApiInstance.altitude !== this.altitude) {
                this._weatherApiInstance = new WeatherAPI(this.latitude, this.longitude, this.altitude, this.debug);
            }
            return;
        }
        // Try to get location from HA
        if (this.hass &&
            (this.latitude === undefined || this.longitude === undefined)) {
            const hassConfig = this.hass.config || {};
            const hassLocation = hassConfig.latitude !== undefined && hassConfig.longitude !== undefined;
            if (hassLocation) {
                // Truncate to 4 decimals before using
                const haLat = parseFloat(Number(hassConfig.latitude).toFixed(4));
                const haLon = parseFloat(Number(hassConfig.longitude).toFixed(4));
                // Only update default-location if it is different from cached value
                const cachedDefault = this._loadDefaultLocationFromStorage();
                if (!cachedDefault ||
                    cachedDefault.latitude !== haLat ||
                    cachedDefault.longitude !== haLon) {
                    this._saveDefaultLocationToStorage(haLat, haLon);
                }
                this.latitude = haLat;
                this.longitude = haLon;
                // Initialize WeatherAPI instance if not already set or if lat/lon changed
                if (!this._weatherApiInstance ||
                    this._weatherApiInstance.lat !== this.latitude ||
                    this._weatherApiInstance.lon !== this.longitude ||
                    this._weatherApiInstance.altitude !== this.altitude) {
                    this._weatherApiInstance = new WeatherAPI(this.latitude, this.longitude, this.altitude, this.debug);
                }
                this._debugLog(`[${CARD_NAME}] Using HA location: ${this.latitude}, ${this.longitude}`);
                return;
            }
        }
        // If we still don't have location, try to load from localStorage default-location
        if (this.latitude === undefined || this.longitude === undefined) {
            const cachedLocation = this._loadDefaultLocationFromStorage();
            if (cachedLocation) {
                this.latitude = cachedLocation.latitude;
                this.longitude = cachedLocation.longitude;
                if (!this._weatherApiInstance ||
                    this._weatherApiInstance.lat !== this.latitude ||
                    this._weatherApiInstance.lon !== this.longitude ||
                    this._weatherApiInstance.altitude !== this.altitude) {
                    this._weatherApiInstance = new WeatherAPI(this.latitude, this.longitude, this.altitude, this.debug);
                }
                this._debugLog(`[${CARD_NAME}] Using cached default-location: ${this.latitude}, ${this.longitude}`);
            }
            else {
                this.latitude = 51.5074;
                this.longitude = -0.1278;
                if (!this._weatherApiInstance ||
                    this._weatherApiInstance.lat !== this.latitude ||
                    this._weatherApiInstance.lon !== this.longitude ||
                    this._weatherApiInstance.altitude !== this.altitude) {
                    this._weatherApiInstance = new WeatherAPI(this.latitude, this.longitude, this.altitude, this.debug);
                }
                this._debugLog(`[${CARD_NAME}] Using default location: ${this.latitude}, ${this.longitude}`);
            }
        }
    }
    // Modularized: Use chartRenderer to ensure D3 is loaded, then schedule draw
    async loadD3AndDraw() {
        if (!this._chartRenderer) {
            this._chartRenderer = new MeteogramChart(this);
        }
        try {
            await this._chartRenderer.ensureD3Loaded();
            this.chartLoaded = true;
            this._scheduleDrawMeteogram("loadD3AndDraw");
        }
        catch (error) {
            console.error("Error loading D3.js:", error);
            this.setError("Failed to load D3.js visualization library. Please refresh the page.");
        }
    }
    async fetchWeatherData() {
        var _a;
        this.logMethodEntry("fetchWeatherData", {
            entityId: this.entityId,
            lat: this.latitude,
            lon: this.longitude,
        });
        if (this.entityId &&
            this.entityId !== "none" &&
            !this._weatherEntityApiInstance) {
            if (this.hass) {
                this._debugLog(`[${CARD_NAME}] Initializing WeatherEntityAPI for entity: ${this.entityId}`, this._weatherEntityApiInstance);
                this._weatherEntityApiInstance = new WeatherEntityAPI(this.hass, this.entityId, this, "fetchWeatherData", this.debug);
            }
        }
        else {
            if (this.entityId &&
                this.entityId == "none" &&
                this._weatherEntityApiInstance) {
                this._weatherEntityApiInstance.destroy("fetchWeatherData");
                this._weatherEntityApiInstance = null;
            }
        }
        // If weather entity is set and not "none", use WeatherEntityAPI
        if (this.entityId &&
            this.entityId !== "none" &&
            this._weatherEntityApiInstance) {
            // Always fetch fresh data from the entity, not from any cache
            const entityData = this._weatherEntityApiInstance.getForecastData();
            // Update status fields for entity data (similar to API data)
            const diag = this._weatherEntityApiInstance.getDiagnosticInfo();
            if (diag.inMemoryData.lastFetchFormatted !== "not yet fetched") {
                // Use pre-formatted version to avoid double formatting
                this._statusLastFetch = diag.inMemoryData.lastFetchFormatted;
            }
            if (diag.inMemoryData.expiresAt) {
                this._statusExpiresAt = new Date(diag.inMemoryData.expiresAt).toISOString();
                this.apiExpiresAt = diag.inMemoryData.expiresAt; // Update main apiExpiresAt field
            }
            // Retrieve attribution from entity if available
            let entityAttribution = null;
            if (this.hass &&
                this.entityId &&
                this.hass.states &&
                this.hass.states[this.entityId]) {
                entityAttribution =
                    ((_a = this.hass.states[this.entityId].attributes) === null || _a === void 0 ? void 0 : _a.attribution) || null;
            }
            this.entityAttribution = entityAttribution;
            // Detect if entity is unavailable (null or empty time array)
            // console.debug(`[${CARD_NAME}] fetchWeatherData from entity ${this.entityId}:`, entityData);
            if (!entityData || !entityData.time || entityData.time.length === 0) {
                throw new Error(`Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`);
            }
            this._currentUnits =
                entityData && entityData.units ? entityData.units : {};
            this.updateDataAvailability(entityData);
            this.checkMissingForecastKeys(entityData);
            return entityData;
        }
        // Always truncate to 4 decimals before using
        const lat = this.latitude !== undefined
            ? parseFloat(Number(this.latitude).toFixed(4))
            : undefined;
        const lon = this.longitude !== undefined
            ? parseFloat(Number(this.longitude).toFixed(4))
            : undefined;
        this._debugLog(`[${CARD_NAME}] fetchWeatherData called with lat=${lat}, lon=${lon}`);
        // Enhanced location check with better error message
        if (!lat || !lon) {
            this._checkAndUpdateLocation(); // Try harder to get location
            const checkedLat = this.latitude !== undefined
                ? parseFloat(Number(this.latitude).toFixed(4))
                : undefined;
            const checkedLon = this.longitude !== undefined
                ? parseFloat(Number(this.longitude).toFixed(4))
                : undefined;
            if (!checkedLat || !checkedLon) {
                throw new Error("Could not determine location. Please check your card configuration or Home Assistant settings.");
            }
        }
        // Ensure WeatherAPI instance is initialized
        if (!this._weatherApiInstance ||
            this._weatherApiInstance.lat !== lat ||
            this._weatherApiInstance.lon !== lon ||
            this._weatherApiInstance.altitude !== this.altitude) {
            this._weatherApiInstance = new WeatherAPI(lat, lon, this.altitude, this.debug);
        }
        const weatherApi = this._weatherApiInstance;
        // If a fetch is already in progress, return the same promise
        if (this.weatherDataPromise) {
            // Update _statusLastFetch with weatherApi._lastFetchTime if available
            if (this._weatherApiInstance &&
                this._weatherApiInstance._lastFetchTime) {
                const lastFetch = this._weatherApiInstance._lastFetchTime;
                if (lastFetch) {
                    this._statusLastFetch = new Date(lastFetch).toISOString();
                }
            }
            this._debugLog(`[${CARD_NAME}] fetchWeatherData: returning existing in-progress promise.`);
            return this.weatherDataPromise;
        }
        // Cache the promise so repeated calls during chart draw use the same one
        this.weatherDataPromise = (async () => {
            let result = null;
            try {
                // Use the new getForecastData method
                const resultMaybe = await weatherApi.getForecastData();
                if (!resultMaybe) {
                    throw new Error("No forecast data available from WeatherAPI.");
                }
                result = resultMaybe;
                this.updateDataAvailability(result);
                this.checkMissingForecastKeys(result);
                this.apiExpiresAt = weatherApi.expiresAt;
                this._statusApiSuccess = true;
                this._lastApiSuccess = true;
                // Store units from API
                this._currentUnits = result && result.units ? result.units : {};
                // Filter result by meteogramHours
                const targetHours = this.parseHoursConfig(this.meteogramHours);
                const dataPoints = this.getDataPointsForHours(targetHours, result.time);
                // Only keep the first N data points
                // Only slice array properties, not units or fetchTimestamp
                const arrayKeys = [
                    "pressure",
                    "time",
                    "temperature",
                    "rain",
                    "rainMin",
                    "rainMax",
                    "cloudCover",
                    "windSpeed",
                    "windDirection",
                    "symbolCode",
                ];
                arrayKeys.forEach((key) => {
                    if (Array.isArray(result[key])) {
                        result[key] = result[key].slice(0, dataPoints);
                    }
                });
                // this._scheduleDrawMeteogram();
                // Update _statusLastFetch with weatherApi._lastFetchTime if available
                if (weatherApi && weatherApi._lastFetchTime) {
                    const lastFetch = weatherApi._lastFetchTime;
                    if (lastFetch) {
                        this._statusLastFetch = new Date(lastFetch).toISOString();
                    }
                }
                return result;
            }
            catch (error) {
                console.error(`[${CARD_NAME}] ERROR in fetchWeatherData:`, {
                    error: error,
                    errorMessage: error === null || error === void 0 ? void 0 : error.message,
                    errorStack: error === null || error === void 0 ? void 0 : error.stack,
                    weatherApiLastError: weatherApi.lastError,
                    weatherApiStatusCode: weatherApi.lastStatusCode,
                    weatherApiExpiresAt: weatherApi.expiresAt,
                });
                this._statusApiSuccess = false;
                let diag = weatherApi.getDiagnosticText();
                this._debugLog(`[${CARD_NAME}] WeatherAPI diagnostic:`, diag);
                // Check if WeatherAPI has cached data from localStorage that we can use
                // The WeatherAPI loads cache in getForecastData(), so check its internal _forecastData
                const cachedData = weatherApi._forecastData;
                if (cachedData) {
                    console.warn(`[${CARD_NAME}] API error, but using cached forecast data from localStorage to keep chart visible`);
                    // Store error message but return cached data
                    this.setError(diag);
                    return cachedData;
                }
                // No cached data available - fail normally
                this.setError(diag);
                this.logErrorContext("fetchWeatherData", error);
                throw new Error(`<br>Failed to get weather data: ${error.message}\n<br>Check your network connection, browser console, and API accessibility.\n\n${diag}`);
            }
            finally {
                // Do NOT clear weatherDataPromise here, so repeated calls use the same promise
                // Only clear it after chart draw is complete
            }
        })();
        return this.weatherDataPromise;
    }
    // Keep the cleanupChart method as is
    cleanupChart() {
        try {
            // Check if we have an active D3 selection
            if (this.svg && typeof this.svg.remove === "function") {
                // Use D3's remove method to clean up properly
                this.svg.remove();
                this.svg = null;
            }
            // Also clear any chart content directly from the DOM
            if (this.shadowRoot) {
                const chartDiv = this.shadowRoot.querySelector("#chart");
                if (chartDiv) {
                    chartDiv.innerHTML = "";
                }
            }
        }
        catch (error) {
            console.warn("Error cleaning up chart:", error);
        }
    }
    /**
     * Analyzes forecast data availability and updates _dataAvailability dictionary
     */
    updateDataAvailability(data) {
        // Check if arrays exist and have valid (non-null) data
        this._dataAvailability.temperature =
            Array.isArray(data.temperature) &&
                data.temperature.some((val) => val !== null && typeof val === "number");
        this._dataAvailability.wind =
            Array.isArray(data.windSpeed) &&
                data.windSpeed.some((val) => val !== null && typeof val === "number") &&
                Array.isArray(data.windDirection) &&
                data.windDirection.some((val) => val !== null && typeof val === "number");
        this._dataAvailability.pressure =
            Array.isArray(data.pressure) &&
                data.pressure.some((val) => val !== null && typeof val === "number");
        this._dataAvailability.cloudCover =
            Array.isArray(data.cloudCover) &&
                data.cloudCover.some((val) => val !== null && typeof val === "number");
        this._dataAvailability.precipitation =
            Array.isArray(data.rain) &&
                data.rain.some((val) => val !== null && typeof val === "number");
        this._dataAvailability.precipitationMinMax =
            (Array.isArray(data.rainMin) &&
                data.rainMin.some((val) => val !== null && typeof val === "number")) ||
                (Array.isArray(data.rainMax) &&
                    data.rainMax.some((val) => val !== null && typeof val === "number"));
        this._dataAvailability.windGust =
            Array.isArray(data.windGust) &&
                data.windGust.some((val) => val !== null && typeof val === "number");
    }
    /**
     * Checks which forecast keys are missing from the provided data and updates _missingForecastKeys.
     */
    checkMissingForecastKeys(data) {
        // List of all possible keys the card can use
        const requiredKeys = [
            "time",
            "temperature",
            "rain",
            "rainMin",
            "rainMax",
            "cloudCover",
            "windSpeed",
            "windDirection",
            "windGust",
            "symbolCode",
            "pressure",
        ];
        if (!data || typeof data !== "object") {
            this._missingForecastKeys = requiredKeys;
            this._availableHours = "unknown";
            return;
        }
        const missing = requiredKeys.filter((key) => !(key in data) ||
            !Array.isArray(data[key]) ||
            data[key].length === 0 ||
            // Check if array contains only null/undefined values
            data[key].every((value) => value === null || value === undefined));
        this._missingForecastKeys = missing;
        // Calculate available hours from raw time array
        if (Array.isArray(data.time) && data.time.length > 1) {
            const arr = data.time;
            const first = arr[0];
            const last = arr[arr.length - 1];
            if (first instanceof Date && last instanceof Date) {
                const ms = last.getTime() - first.getTime();
                this._availableHours = Math.round(ms / (1000 * 60 * 60)) + 1;
            }
            else if (typeof first === "string" && typeof last === "string") {
                const ms = new Date(last).getTime() - new Date(first).getTime();
                this._availableHours = Math.round(ms / (1000 * 60 * 60)) + 1;
            }
            else {
                this._availableHours = arr.length;
            }
        }
        else {
            this._availableHours = "unknown";
        }
    }
    async _drawMeteogram(caller = "unknown") {
        var _a, _b;
        this.logMethodEntry("_drawMeteogram", { caller });
        this._debugLog(`[${CARD_NAME}] _drawMeteogram called from: ${caller}`);
        // Limit excessive error messages
        const now = Date.now();
        if (this.meteogramError && now - this.lastErrorTime < 60000) {
            // Don't try to redraw for at least 1 minute after an error
            this.errorCount++;
            return;
        }
        this.meteogramError = "";
        // Make sure we have a location before proceeding
        this._checkAndUpdateLocation();
        if (!this.latitude || !this.longitude) {
            this.setError("Location not available. Please check your card configuration or Home Assistant settings.");
            return;
        }
        // Wait for the render cycle to complete before accessing the DOM
        await this.updateComplete;
        // Use the _logDomState method to log diagnostic info
        this._logDomState();
        // Add a static property to limit D3 retry frequency
        const D3_RETRY_INTERVAL = 10000; // 10 seconds
        if (!MeteogramCard_1.lastD3RetryTime) {
            MeteogramCard_1.lastD3RetryTime = 0;
        }
        // Always attempt to load D3 if not present
        if (!window.d3) {
            try {
                await this.loadD3AndDraw();
                return; // loadD3AndDraw will call drawMeteogram when ready
            }
            catch (error) {
                // Only throttle error messages if repeated failures
                const now = Date.now();
                if (now - MeteogramCard_1.lastD3RetryTime < D3_RETRY_INTERVAL) {
                    // Too soon to retry loading D3, skip this attempt
                    return;
                }
                MeteogramCard_1.lastD3RetryTime = now;
                this.setError("D3.js library could not be loaded. Please refresh the page.");
                return;
            }
        }
        // Clean up any existing chart before proceeding
        this.cleanupChart();
        // Ensure we have a clean update cycle before accessing the DOM again
        await new Promise((resolve) => setTimeout(resolve, 10));
        const chartDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("#chart");
        if (!chartDiv) {
            console.error("Chart container not found in DOM");
            if (this.isConnected) {
                this.requestUpdate();
                await this.updateComplete;
                await new Promise((resolve) => setTimeout(resolve, 50));
                const retryChartDiv = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector("#chart");
                if (!retryChartDiv) {
                    console.error("Chart container still not found after retry");
                    if (this.shadowRoot) {
                        const cardContent = this.shadowRoot.querySelector(".card-content");
                        if (cardContent && this.isConnected) {
                            cardContent.innerHTML = '<div id="chart"></div>';
                            const finalAttemptChartDiv = this.shadowRoot.querySelector("#chart");
                            if (finalAttemptChartDiv) {
                                this._renderChart(finalAttemptChartDiv, "_drawMeteogram-finalAttempt");
                                return;
                            }
                        }
                    }
                    return;
                }
                this._renderChart(retryChartDiv, "_drawMeteogram-retry");
            }
            return;
        }
        // Pass only chartDiv to _renderChart (remove data argument)
        this._renderChart(chartDiv, "_drawMeteogram");
    }
    _renderChart(chartDiv, source = "unknown") {
        this.logMethodEntry("_renderChart", { source });
        this._debugLog(`[${CARD_NAME}] _renderChart called from: ${source}`);
        // Queue logic: If already rendering, do not start another
        if (this._chartRenderInProgress) {
            return;
        }
        this._chartRenderInProgress = true;
        // Responsive sizing based on parent
        const parent = chartDiv.parentElement;
        let availableWidth = parent
            ? parent.clientWidth
            : chartDiv.offsetWidth || 350;
        let availableHeight = parent
            ? parent.clientHeight
            : chartDiv.offsetHeight || 180;
        // --- Aspect Ratio Logic ---
        let width, height;
        // Use aspectRatio only if not in sections layout
        let useAspectRatio = this.aspectRatio && this.layoutMode !== "sections";
        if (useAspectRatio && typeof this.aspectRatio === "string") {
            // Parse aspect ratio string, e.g. "16:9"
            const [w, h] = this.aspectRatio.split(":").map(Number);
            if (w > 0 && h > 0) {
                width = availableWidth;
                height = Math.round(width * (h / w));
                // Optionally, limit height to availableHeight
                if (height > availableHeight) {
                    height = availableHeight;
                    width = Math.round(height * (w / h));
                }
            }
            else {
                width =
                    chartDiv.offsetWidth > 0
                        ? chartDiv.offsetWidth
                        : availableWidth;
                height =
                    chartDiv.offsetHeight > 0
                        ? chartDiv.offsetHeight
                        : availableHeight;
            }
        }
        else {
            // Default: fill container
            width =
                chartDiv.offsetWidth > 0
                    ? chartDiv.offsetWidth
                    : availableWidth;
            height =
                chartDiv.offsetHeight > 0
                    ? chartDiv.offsetHeight
                    : availableHeight;
        }
        // Clean up previous chart
        chartDiv.innerHTML = "";
        // Fetch weather data and render
        this.fetchWeatherData()
            .then((data) => {
            this._lastWeatherData = data;
            // If using weather entity and it's unavailable, do not render
            if (this.entityId &&
                this.entityId !== "none" &&
                this._weatherEntityApiInstance) {
                const entityData = this._weatherEntityApiInstance.getForecastData();
                if (!entityData) {
                    this.setError(`Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`);
                    return;
                }
            }
            // Determine if wind data is available
            const windAvailable = this.showWind && this._dataAvailability.wind;
            // Set windBand based on wind availability
            const windBandHeight = windAvailable ? 45 : 0;
            const hourLabelBand = 30;
            // --- ADJUST: Remove this._chartHeight cap and use full height ---
            // Store dimensions for resize detection
            this._lastWidth = availableWidth;
            this._lastHeight = availableHeight;
            // --- Track last rendered chart size for final resize logic ---
            this._lastRenderedWidth = availableWidth;
            this._lastRenderedHeight = availableHeight;
            this.svg = window.d3
                .select(chartDiv)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", useAspectRatio ? "xMidYMid meet" : "none"); // Fill container, no aspect ratio
            const targetHours = this.parseHoursConfig(this.meteogramHours);
            const dataPoints = this.getDataPointsForHours(targetHours, data.time);
            const sliceData = (arr) => {
                if (!arr || !Array.isArray(arr)) {
                    console.warn(`[${CARD_NAME}] sliceData: received undefined/null array, returning empty array`);
                    return [];
                }
                return arr.slice(0, Math.min(dataPoints, arr.length) + 1);
            };
            // Debug: Check which properties might be undefined
            const dataProperties = [
                "time",
                "temperature",
                "rain",
                "rainMin",
                "rainMax",
                "cloudCover",
                "windSpeed",
                "windGust",
                "windDirection",
                "symbolCode",
                "pressure",
            ];
            const undefinedProps = dataProperties.filter((prop) => !data[prop] || !Array.isArray(data[prop]));
            if (undefinedProps.length > 0) {
                console.warn(`[${CARD_NAME}] ForecastData has undefined/non-array properties:`, undefinedProps);
            }
            const slicedData = {
                time: sliceData(data.time),
                temperature: sliceData(data.temperature),
                rain: sliceData(data.rain),
                rainMin: sliceData(data.rainMin),
                rainMax: sliceData(data.rainMax),
                cloudCover: sliceData(data.cloudCover),
                windSpeed: sliceData(data.windSpeed),
                windGust: sliceData(data.windGust),
                windDirection: sliceData(data.windDirection),
                symbolCode: sliceData(data.symbolCode),
                pressure: sliceData(data.pressure),
                units: data.units, // Preserve units from original data
            };
            this.renderMeteogram(this.svg, slicedData, width, height, windBandHeight, hourLabelBand, windAvailable);
            // Reset error tracking on success
            this.errorCount = 0;
            // Clear retry timer if successful
            if (this._weatherRetryTimeout) {
                clearTimeout(this._weatherRetryTimeout);
                this._weatherRetryTimeout = null;
            }
            this._setupResizeObserver();
            this._setupVisibilityObserver();
            this._setupMutationObserver();
            // --- SCHEDULE REFRESH 60s AFTER expiresAt ---
            if (this.apiExpiresAt) {
                const now = Date.now();
                const delay = Math.max(this.apiExpiresAt + 60000 - now, 0);
                if (this._weatherRefreshTimeout)
                    clearTimeout(this._weatherRefreshTimeout);
                this._debugLog(`[${CARD_NAME}] Setting scheduled-refresh-after-expiresAt in ${Math.round(delay / 1000)}s (at ${new Date(this.apiExpiresAt + 60000).toISOString()})`);
                this._weatherRefreshTimeout = window.setTimeout(() => {
                    // Just force a redraw, which will trigger a fetch and then a draw
                    this._scheduleDrawMeteogram("scheduled-refresh-after-expiresAt", true);
                }, delay);
            }
        })
            .catch((err) => {
            var _a;
            console.error(`[${CARD_NAME}] ERROR caught in _drawMeteogram:`, {
                error: err,
                message: err === null || err === void 0 ? void 0 : err.message,
                stack: err === null || err === void 0 ? void 0 : err.stack,
                name: err === null || err === void 0 ? void 0 : err.name,
            });
            // If error is due to unavailable entity, show waiting message
            if (err.message &&
                err.message.includes("is unavailable. Waiting for it to become available")) {
                this.setError(`Weather entity ${this.entityId} is unavailable. Waiting for it to become available...`);
                // Optionally, schedule a retry after a short delay
                if (this._weatherRetryTimeout)
                    clearTimeout(this._weatherRetryTimeout);
                this._weatherRetryTimeout = window.setTimeout(() => {
                    this.meteogramError = "";
                    this._drawMeteogram("retry-entity-unavailable");
                }, 500); // Retry every 0.5 seconds
            }
            else {
                console.error(`[${CARD_NAME}] Triggering 60-second retry due to error:`, {
                    errorMessage: err === null || err === void 0 ? void 0 : err.message,
                    hasExistingMeteogramError: !!this.meteogramError,
                    existingError: this.meteogramError,
                    containsApiError: (_a = this.meteogramError) === null || _a === void 0 ? void 0 : _a.includes("API Error"),
                });
                // If a diagnostic error is already present, append the retry message
                if (this.meteogramError &&
                    this.meteogramError.includes("API Error")) {
                    this.meteogramError += `<br><span style='color:#b71c1c;'>Weather data not available, retrying in 60 seconds</span>`;
                }
                else {
                    this.setError("Weather data not available, retrying in 60 seconds");
                }
                if (this._weatherRetryTimeout)
                    clearTimeout(this._weatherRetryTimeout);
                this._weatherRetryTimeout = window.setTimeout(() => {
                    this.meteogramError = "";
                    this._drawMeteogram("retry-after-error");
                }, 60000);
            }
        })
            .finally(() => {
            this._chartRenderInProgress = false;
            // --- RESET weatherDataPromise after chart draw completes ---
            this.weatherDataPromise = null;
            // Assign _statusLastRender with a date string when rendering completes
            this._statusLastRender = new Date().toISOString();
            // If a render was queued, run it now
            if (this._pendingRender) {
                this._pendingRender = false;
                this._drawMeteogram("pending-after-render");
            }
        });
    }
    // Add a helper to get the HA locale string for date formatting
    getHaLocale() {
        // Use hass.language if available, fallback to "en"
        return this.hass && this.hass.language ? this.hass.language : "en";
    }
    // Helper to calculate forecast data age
    getForecastDataAge() {
        if (!this._lastWeatherData ||
            !this._lastWeatherData.time ||
            this._lastWeatherData.time.length === 0) {
            return "no data";
        }
        const earliestTime = this._lastWeatherData.time[0];
        const now = new Date();
        const earliestDate = earliestTime instanceof Date ? earliestTime : new Date(earliestTime);
        if (isNaN(earliestDate.getTime())) {
            return "invalid data";
        }
        const diffMs = now.getTime() - earliestDate.getTime();
        const absDiffMs = Math.abs(diffMs);
        const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        // Handle future dates (forecast data is typically from current time forward)
        const isInFuture = diffMs < 0;
        const prefix = isInFuture ? "in " : "";
        if (diffMinutes < 60) {
            return `${prefix}${diffMinutes} min`;
        }
        else if (diffHours < 24) {
            return `${prefix}${diffHours}h ${diffMinutes % 60}m`;
        }
        else {
            const diffDays = Math.floor(diffHours / 24);
            return `${prefix}${diffDays}d ${diffHours % 24}h`;
        }
    }
    // Centralized method to generate diagnostic information
    generateDiagnosticInfo() {
        let debugInfo = "";
        let panelInfo = null;
        let expiresInfo = "not available";
        let lastFetchInfo = "not available";
        let lastRenderInfo = this._statusLastRender || "unknown";
        // Calculate forecast data age for both entity and API modes
        const forecastDataAge = this.getForecastDataAge();
        // Show Entity API debug info when using entity
        if (this.entityId &&
            this.entityId !== "none" &&
            this._weatherEntityApiInstance) {
            const diag = this._weatherEntityApiInstance.getDiagnosticInfo();
            const expiryColor = diag.inMemoryData.isExpired ? "#f44336" : "#4caf50";
            // Set expires and lastFetch info for main panel
            if (diag.inMemoryData.expiresAtFormatted !== "not set") {
                expiresInfo = b `<span style="color:${expiryColor}"
          >${diag.inMemoryData.expiresAtFormatted}${diag.inMemoryData.isExpired
                    ? " (EXPIRED)"
                    : ""}</span
        >`;
            }
            else {
                expiresInfo = "not set";
            }
            lastFetchInfo = diag.inMemoryData.lastFetchFormatted;
            // For tooltip - include the Last forecast fetched info you want to see
            debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;line-height:1.4;'>
        <b>📱 Entity API:</b> ${diag.entityExists ? "✅" : "❌"} ${diag.entityState || "unknown"} | <b>Last Updated:</b> ${diag.entityLastUpdated
                ? new Date(diag.entityLastUpdated).toLocaleString()
                : "unknown"}<br>
        <b>Subscription:</b> ${diag.hasSubscription ? "✅" : "❌"} | <b>Connection:</b> ${diag.hasConnection ? "✅" : "❌"}<br>
        <b>Last Data Fetch:</b> ${diag.inMemoryData.lastFetchFormatted} | <b>Age:</b> ${diag.inMemoryData.dataAgeMinutes} min<br>
        <b>Last Forecast Fetched:</b> ${diag.lastForecastFetch || "never"} ${diag.lastForecastFetchAge ? `(${diag.lastForecastFetchAge})` : ""}<br>
        <b>Earliest Forecast:</b> ${forecastDataAge} ago<br>
        <b>Data Expires:</b> <span style="color:${expiryColor}">${diag.inMemoryData.expiresAtFormatted} ${diag.inMemoryData.isExpired ? "(EXPIRED)" : ""}</span><br>
        <b>Hourly Data:</b> ${diag.hourlyForecastData.status}
      </div>`;
            // For diagnostic panel - remove the detailed info that was getting cut off
            // Keep this null to remove the extra panel section
            panelInfo = null;
        }
        // Show Weather API debug info when NOT using entity (coordinates mode)
        else if (this._weatherApiInstance) {
            try {
                const apiDiag = this._weatherApiInstance.getDiagnosticInfo();
                const apiExpiryColor = apiDiag.isExpired ? "#f44336" : "#4caf50";
                // Set expires and lastFetch info for main panel
                if (this.apiExpiresAt) {
                    const isExpired = Date.now() > this.apiExpiresAt;
                    const color = isExpired ? "#f44336" : "#4caf50";
                    const status = isExpired ? " (EXPIRED)" : "";
                    expiresInfo = b `<span style="color:${color}"
            >${new Date(this.apiExpiresAt).toLocaleString()}${status}</span
          >`;
                }
                lastFetchInfo = this._statusLastFetch
                    ? this._statusLastFetch.includes("T")
                        ? new Date(this._statusLastFetch).toLocaleString()
                        : this._statusLastFetch
                    : "not available";
                debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;line-height:1.4;'>
          <b>🌤️ ${apiDiag.apiType}:</b> ${apiDiag.hasData ? "✅" : "❌"} Data | <b>Location:</b> ${apiDiag.location.lat.toFixed(2)}, ${apiDiag.location.lon.toFixed(2)}<br>
          <b>Last Data Fetch:</b> ${apiDiag.lastFetchFormatted} | <b>Age:</b> ${apiDiag.dataAgeMinutes} min<br>
          <b>Earliest Forecast:</b> ${forecastDataAge} ago<br>
          <b>Data Expires:</b> <span style="color:${apiExpiryColor}">${apiDiag.expiresAtFormatted} ${apiDiag.isExpired ? "(EXPIRED)" : ""}</span><br>
          <b>Hourly Data:</b> ${apiDiag.dataTimeLength} entries
        </div>`;
            }
            catch (error) {
                console.error("[MeteogramCard] Error getting Weather API diagnostic info:", error);
                debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;'>Weather API diagnostic error: ${error}</div>`;
            }
        }
        else {
            debugInfo = `<div style='margin-top:8px;color:#ff9800;font-size:0.85em;'>No diagnostic info available</div>`;
        }
        return {
            tooltip: debugInfo,
            panel: panelInfo,
            expires: expiresInfo,
            lastFetch: lastFetchInfo,
            lastRender: lastRenderInfo,
        };
    }
    // Add a helper to determine if day or night based on time and location
    isDaytimeAt(date) {
        // 1. Try weather entity attributes
        if (this.entityId &&
            this.hass &&
            this.hass.states &&
            this.hass.states[this.entityId]) {
            const attrs = this.hass.states[this.entityId].attributes || {};
            if (attrs.sunrise && attrs.sunset) {
                const sunrise = new Date(attrs.sunrise);
                const sunset = new Date(attrs.sunset);
                if (date >= sunrise && date < sunset)
                    return true;
                return false;
            }
        }
        // 2. Try sun.sun entity
        if (this.hass && this.hass.states && this.hass.states["sun.sun"]) {
            const sunAttrs = this.hass.states["sun.sun"].attributes || {};
            if (typeof sunAttrs.elevation === "number") {
                return sunAttrs.elevation > 0;
            }
        }
        // 3. Fallback: 6:00-18:00 is day
        const hour = date.getHours();
        return hour >= 6 && hour < 18;
    }
    // Update renderMeteogram to add windBarbBand and hourLabelBand as arguments
    renderMeteogram(svg, data, width, height, windBandHeight = 0, hourLabelBand = 24, windAvailable = false) {
        var _a;
        const d3 = window.d3;
        const { time, temperature, rain, rainMin, rainMax, cloudCover, windSpeed, windGust, windDirection, symbolCode, pressure, } = data;
        const N = time.length;
        this.getSystemTemperatureUnit();
        this.getSystemPressureUnit();
        this.getSystemWindSpeedUnit();
        this.getSystemPrecipitationUnit();
        // Only convert values if using WeatherAPI (entityId is not set or is 'none')
        let temperatureConverted;
        let rainConverted;
        let rainMaxConverted;
        windDirection.some((d) => d !== null);
        if (!this.entityId || this.entityId === "none") {
            temperatureConverted = temperature.map((t) => this.convertTemperature(t));
            pressure.map((p) => this.convertPressure(p));
            windSpeed.map((w) => this.convertWindSpeed(w));
            windGust.map((w) => this.convertWindSpeed(w));
            rainConverted = rain.map((r) => r !== null ? this.convertPrecipitation(r) : null);
            rainMin.map((r) => r !== null ? this.convertPrecipitation(r) : null);
            rainMaxConverted = rainMax.map((r) => r !== null ? this.convertPrecipitation(r) : null);
        }
        else {
            temperatureConverted = temperature;
            rainConverted = rain;
            rainMaxConverted = rainMax;
        }
        // Safely handle null values in arrays for calculations
        const nonNullRain = rainConverted.filter((r) => r !== null);
        const nonNullRainMax = rainMaxConverted.filter((r) => r !== null);
        const pressureAvailable = this.showPressure && this._dataAvailability.pressure;
        // windAvailable is now passed as an argument from _renderChart
        const cloudAvailable = this.showCloudCover && this._dataAvailability.cloudCover;
        const enabledLegends = [];
        if (cloudAvailable) {
            enabledLegends.push({ class: "legend-cloud", label: "Cloud Cover" });
        }
        if (this.showPrecipitation && this._dataAvailability.precipitation) {
            enabledLegends.push({ class: "legend-rain", label: "Precipitation" });
        }
        if (pressureAvailable) {
            enabledLegends.push({ class: "legend-pressure", label: "Pressure" });
        }
        if (this._dataAvailability.temperature) {
            enabledLegends.push({ class: "legend-temp", label: "Temperature" });
        }
        // SVG and chart parameters
        // In focussed mode, remove top margin for legends
        // Adjust margins based on focussed mode, pressure axis, and displayMode
        if (this.displayMode === "core") {
            this._margin = {
                top: 50,
                right: 40,
                bottom: hourLabelBand + 10,
                left: 40,
            };
        }
        else if (this.focussed) {
            this._margin = {
                top: 10,
                right: 40,
                bottom: hourLabelBand + 10,
                left: 40,
            };
        }
        else if (!pressureAvailable) {
            this._margin = {
                top: 70,
                right: 40,
                bottom: hourLabelBand + 10,
                left: 70,
            };
        }
        else {
            this._margin = {
                top: 70,
                right: 70,
                bottom: hourLabelBand + 10,
                left: 70,
            };
        }
        const margin = this._margin;
        this._chartHeight = this.focussed
            ? height - windBandHeight - hourLabelBand - 10
            : height - windBandHeight - hourLabelBand - 50 - 10; // Extra space for legends in non-focussed mode
        this._chartWidth = width - margin.left - margin.right;
        // Adjust dx for wider charts - ensure elements don't get too stretched or squished
        let dx = this._chartWidth / (N - 1);
        // X scale - for wider charts, maintain reasonable hour spacing
        const x = d3
            .scaleLinear()
            .domain([0, N - 1])
            .range([0, this._chartWidth]);
        // Adjust the actual dx to what's being used by the scale
        dx = x(1) - x(0);
        // Find day boundaries for shaded backgrounds
        const dateLabelY = margin.top - 30;
        const dayStarts = [];
        for (let i = 0; i < N; i++) {
            if (i === 0 || time[i].getDate() !== time[i - 1].getDate()) {
                dayStarts.push(i);
            }
        }
        const dayRanges = [];
        for (let i = 0; i < dayStarts.length; ++i) {
            const startIdx = dayStarts[i];
            const endIdx = i + 1 < dayStarts.length ? dayStarts[i + 1] : N;
            dayRanges.push({ start: startIdx, end: endIdx });
        }
        // Defensive: Check if svg is a D3 selection
        if (!svg ||
            typeof svg.selectAll !== "function" ||
            typeof svg.append !== "function") {
            console.error("[MeteogramCard] svg is not a D3 selection:", svg);
            throw new Error("SVG is not a D3 selection. D3 may not be loaded or svg was not created correctly.");
        }
        const chart = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        // Defensive: Check if chart is a D3 selection
        if (!chart ||
            typeof chart.selectAll !== "function" ||
            typeof chart.append !== "function") {
            console.error("[MeteogramCard] chart is not a D3 selection:", chart);
            throw new Error("Chart is not a D3 selection. D3 may not be loaded or chart was not created correctly.");
        }
        const tempValues = temperatureConverted.filter((t) => t !== null);
        const yTemp = d3
            .scaleLinear()
            .domain([
            Math.floor(d3.min(tempValues) - 2),
            Math.ceil(d3.max(tempValues) + 2),
        ])
            .range([this._chartHeight, 0]);
        // Precipitation Y scale
        const yPrecip = d3
            .scaleLinear()
            .domain([0, Math.max(2, d3.max([...nonNullRainMax, ...nonNullRain]) + 1)])
            .range([this._chartHeight, 0]); // <-- FIXED: range goes from this._chartHeight (bottom) to 0 (top)
        // Pressure Y scale - we'll use the right side of the chart
        // Only create if pressure is shown and data is available
        let yPressure;
        const hasPressure = this.showPressure && this._dataAvailability.pressure;
        if (hasPressure) {
            const validPressures = pressure.filter((p) => p !== null && typeof p === "number" && !isNaN(p));
            const pressureRange = d3.extent(validPressures);
            const pressurePadding = (pressureRange[1] - pressureRange[0]) * 0.1;
            yPressure = d3
                .scaleLinear()
                .domain([
                Math.floor((pressureRange[0] - pressurePadding) / 100) * 100,
                Math.ceil((pressureRange[1] + pressurePadding) / 100) * 100,
            ])
                .range([this._chartHeight, 0]);
        }
        // Calculate legend positions
        // Only allocate slots for enabled legends, so they fill left-to-right
        // Skip legends entirely in "core" display mode
        const numLegends = this.displayMode === "core" ? 0 : enabledLegends.length;
        const legendPositions = this.displayMode === "core"
            ? []
            : enabledLegends.map((_, i) => {
                const slotWidth = this._chartWidth / numLegends;
                return {
                    x: i * slotWidth + 2,
                    y: -45,
                };
            });
        // Alternate shaded background for days
        svg
            .selectAll(".day-bg")
            .data(dayRanges)
            .enter()
            .append("rect")
            .attr("class", "day-bg")
            .attr("x", (d) => margin.left + x(d.start))
            .attr("y", margin.top - 42)
            // Limit width to only main chart area (do not extend to right axis)
            .attr("width", (d) => {
            // Defensive: ensure width is never negative
            const rawWidth = x(Math.max(d.end - 1, d.start)) - x(d.start) + dx;
            const maxWidth = this._chartWidth - x(d.start);
            const safeWidth = Math.max(0, Math.min(rawWidth, maxWidth));
            return safeWidth;
        })
            // Limit height to only main chart area (do not extend to lower x axis)
            .attr("height", this._chartHeight + 42)
            .attr("opacity", (_, i) => (i % 2 === 0 ? 0.16 : 0));
        // Draw chart grid background
        if (!this._chartRenderer) {
            this._chartRenderer = new MeteogramChart(this);
        }
        this._chartRenderer.drawChartGrid(svg, chart, d3, x, yTemp, N, margin, dayStarts);
        this._chartRenderer.drawGridOutline(chart);
        // Draw date labels at top
        if (this._chartRenderer &&
            typeof this._chartRenderer.drawDateLabels === "function") {
            this._chartRenderer.drawDateLabels(svg, time, dayStarts, margin, x, this._chartWidth, dateLabelY);
        }
        // Draw bottom hour labels using helper
        this._chartRenderer.drawBottomHourLabels(svg, data.time, margin, x, windBandHeight, width);
        // Draw all chart elements in order of background to foreground
        // 1. Cloud band (if enabled)
        // 2. Rain bars (if enabled)
        // 3. Pressure line (if enabled)
        // 4. Wind band (if enabled)
        // 5. Temperature line
        // 6. Weather icons
        // Draw cloud cover band with legend
        // Cloud cover band - only if enabled
        if (cloudAvailable) {
            const cloudLegendIndex = this.displayMode === "core"
                ? -1
                : enabledLegends.findIndex((l) => l.class.includes("legend-cloud"));
            if (cloudLegendIndex >= 0 && legendPositions.length > 0) {
                const legendPos = legendPositions[cloudLegendIndex];
                this._chartRenderer.drawCloudBand(chart, cloudCover, N, x, legendPos.x, legendPos.y);
            }
            else {
                this._chartRenderer.drawCloudBand(chart, cloudCover, N, x);
            }
        }
        // Draw rain bars with legend
        if (this.showPrecipitation && this._dataAvailability.precipitation) {
            const rainLegendIndex = this.displayMode === "core"
                ? -1
                : enabledLegends.findIndex((l) => l.class.includes("legend-rain"));
            if (rainLegendIndex >= 0 && legendPositions.length > 0) {
                const legendPos = legendPositions[rainLegendIndex];
                this._chartRenderer.drawRainBars(chart, rainConverted, rainMaxConverted, N, x, yPrecip, dx, legendPos.x, legendPos.y);
            }
            else {
                this._chartRenderer.drawRainBars(chart, rainConverted, rainMaxConverted, N, x, yPrecip, dx);
            }
        }
        // Draw pressure line with legend
        if (pressureAvailable && yPressure) {
            const pressureLegendIndex = this.displayMode === "core"
                ? -1
                : enabledLegends.findIndex((l) => l.class.includes("legend-pressure"));
            if (pressureLegendIndex >= 0 && legendPositions.length > 0) {
                const legendPos = legendPositions[pressureLegendIndex];
                this._chartRenderer.drawPressureLine(chart, pressure, x, yPressure, legendPos.x, legendPos.y);
            }
            else {
                this._chartRenderer.drawPressureLine(chart, pressure, x, yPressure);
            }
        }
        // Wind band grid lines (if wind band is enabled)
        if (windAvailable) {
            // For wind barbs, use the exact units that were stored with the cached weather data
            // This is the authoritative source - it reflects the actual units from when the data was fetched
            let rawWindUnit = (_a = data.units) === null || _a === void 0 ? void 0 : _a.windSpeed;
            if (!rawWindUnit) {
                // Only use fallbacks if no units were stored (shouldn't happen with proper entity data)
                rawWindUnit =
                    !this.entityId || this.entityId === "none"
                        ? "m/s"
                        : this.getSystemWindSpeedUnit();
            }
            this._chartRenderer.drawWindBand(svg, x, windBandHeight, margin, width, N, time, windSpeed, // Use raw wind speeds for barb calculation
            windGust, // Use raw gust speeds for barb calculation
            windDirection, rawWindUnit);
        }
        // Draw temperature line with legend
        const tempLegendIndex = this.displayMode === "core"
            ? -1
            : enabledLegends.findIndex((l) => l.class.includes("legend-temp"));
        if (tempLegendIndex >= 0 && legendPositions.length > 0) {
            const legendPos = legendPositions[tempLegendIndex];
            this._chartRenderer.drawTemperatureLine(chart, temperatureConverted, x, yTemp, legendPos.x, legendPos.y);
        }
        else {
            this._chartRenderer.drawTemperatureLine(chart, temperatureConverted, x, yTemp);
        }
        // Draw weather icons
        if (this.showWeatherIcons) {
            this._chartRenderer.drawWeatherIcons(chart, symbolCode, temperatureConverted, x, yTemp, data, N);
        }
    }
    // Add explicit render method to ensure chart container is created properly
    render() {
        this._updateDarkMode(); // Ensure dark mode is set before rendering
        // Build mergedStyles from styles property, supporting styles.modes.dark (and future modes)
        // Accept both '--meteogram-foo' and 'meteogram-foo' as keys in styles
        let mergedStylesRaw = { ...(this.styles || {}) };
        // Normalize keys: add '--' if missing
        let mergedStyles = {};
        for (const [k, v] of Object.entries(mergedStylesRaw)) {
            if (k === "modes" && typeof v === "object") {
                // Copy modes as-is for dark mode merging
                mergedStyles.modes = v;
            }
            else if (typeof v === "string" || typeof v === "number") {
                const cssVar = k.startsWith("--") ? k : `--${k}`;
                mergedStyles[cssVar] = String(v);
            }
        }
        // Use Home Assistant's dark mode detection if available
        let isHassDark = false;
        if (this.hass &&
            this.hass.themes &&
            typeof this.hass.themes.darkMode === "boolean") {
            isHassDark = this.hass.themes.darkMode;
        }
        else {
            // Fallback to prefers-color-scheme
            isHassDark =
                window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        // If modes is present, merge in the correct mode
        if (mergedStyles.modes && typeof mergedStyles.modes === "object") {
            if (isHassDark && mergedStyles.modes.dark) {
                // Only merge if dark mode and dark object exists
                // Also normalize dark mode keys
                const darkModeVars = {};
                for (const [k, v] of Object.entries(mergedStyles.modes.dark)) {
                    const cssVar = k.startsWith("--") ? k : `--${k}`;
                    darkModeVars[cssVar] = String(v);
                }
                mergedStyles = { ...mergedStyles, ...darkModeVars };
            }
            delete mergedStyles.modes;
        }
        // Set CSS variables on the host element (this) and on ha-card for compatibility
        Object.entries(mergedStyles).forEach(([k, v]) => {
            if (k.startsWith("--") && typeof v === "string") {
                this.style.setProperty(k, v);
            }
        });
        // Also set variables on ha-card via style attribute for legacy/light-dom compatibility
        const styleVars = Object.entries(mergedStyles)
            .filter(([k, v]) => k.startsWith("--") && typeof v === "string")
            .map(([k, v]) => `${k}: ${v};`)
            .join(" ");
        const successRate = WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT > 0
            ? Math.round((100 * WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT) /
                WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT)
            : 0;
        const successTooltip = `API Success Rate: ${WeatherAPI.METEOGRAM_CARD_API_SUCCESS_COUNT}/${WeatherAPI.METEOGRAM_CARD_API_CALL_COUNT} (${successRate}%) since ${METEOGRAM_CARD_STARTUP_TIME.toISOString()}`;
        // Calculate aspect ratio style
        // let aspectRatioStyle = "aspect-ratio: 16/9;";
        // if (this.aspectRatio && this.aspectRatio.includes(":")) {
        //     const [w, h] = this.aspectRatio.split(":").map(Number);
        //     if (w > 0 && h > 0) aspectRatioStyle = `aspect-ratio: ${w}/${h};`;
        // } else if (this.aspectRatio && !isNaN(Number(this.aspectRatio))) {
        //     aspectRatioStyle = `aspect-ratio: ${Number(this.aspectRatio)}/1;`;
        // }
        // Instead, always use width:100%;height:100% for the chart container
        const chartContainerStyle = "width:100%;height:100%;";
        // In Focussed mode, hide title and attribution
        if (this.displayMode === "focussed" || this.focussed) {
            // Check if we have cached data in WeatherAPI
            const hasCachedData = this._weatherApiInstance && this._weatherApiInstance._forecastData;
            return b `
        <ha-card style="${styleVars}">
          <div class="card-content">
            ${this.meteogramError && !hasCachedData
                ? b `<div
                  class="error"
                  style="white-space:normal;"
                  .innerHTML=${this.meteogramError}
                ></div>`
                : b `<div style="${chartContainerStyle}">
                  <div id="chart" style="width:100%;height:100%"></div>
                </div>`}
          </div>
        </ha-card>
      `;
        }
        // Only show attribution if available (Met.no or entity)
        const showAttribution = (this.entityId && this.entityId !== "none" && this.entityAttribution) ||
            !(this.entityId && this.entityId !== "none");
        // Attribution icon color logic
        let attributionColor = "#1976d2"; // default blue
        let statusSymbol = "ℹ️";
        if (this._lastApiSuccess) {
            attributionColor = "#388e3c"; // green
        }
        else if (this._statusApiSuccess === null) {
            attributionColor = "#fbc02d"; // orange
        }
        else if (this._statusApiSuccess === false) {
            attributionColor = "#b71c1c"; // red
            statusSymbol = "⚠️"; // Alert icon when there's an error
        }
        // Attribution tooltip content
        let attributionTooltip = "";
        if (this.entityId && this.entityId !== "none" && this.entityAttribution) {
            let integrationName = "";
            let integrationDocUrl = "";
            if (this.entityId) {
                const parts = this.entityId.split(".");
                if (parts.length === 2) {
                    parts[0];
                    const platform = parts[1];
                    // Map known platforms to friendly names and docs
                    const knownIntegrations = {
                        openweathermap: {
                            name: "OpenWeatherMap",
                            url: "https://www.home-assistant.io/integrations/openweathermap/",
                        },
                        met: {
                            name: "Met.no (Norwegian Meteorological Institute)",
                            url: "https://www.home-assistant.io/integrations/met/",
                        },
                        accuweather: {
                            name: "AccuWeather",
                            url: "https://www.home-assistant.io/integrations/accuweather/",
                        },
                        pirateweather: {
                            name: "Pirate Weather",
                            url: "https://www.home-assistant.io/integrations/pirateweather/",
                        },
                        tomorrowio: {
                            name: "Tomorrow.io",
                            url: "https://www.home-assistant.io/integrations/tomorrowio/",
                        },
                        weatherbit: {
                            name: "Weatherbit",
                            url: "https://www.home-assistant.io/integrations/weatherbit/",
                        },
                        forecast_solar: {
                            name: "Forecast.Solar",
                            url: "https://www.home-assistant.io/integrations/forecast_solar/",
                        },
                        // Add more as needed
                    };
                    // Try to match platform (second part of entityId)
                    if (knownIntegrations[platform]) {
                        integrationName = knownIntegrations[platform].name;
                        integrationDocUrl = knownIntegrations[platform].url;
                    }
                    else {
                        // Fallback: use platform as name
                        integrationName = platform
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                        integrationDocUrl = "";
                    }
                }
            }
            attributionTooltip = `
                <div style='padding:8px;min-width:300px;max-width:450px;text-align:left;'>
                    <div style='margin-bottom:4px;'>${this.entityAttribution}</div>
                    <div style='margin-top:6px;font-size:0.97em;color:#555;'>
                        Integration: ${integrationDocUrl
                ? `<a href='${integrationDocUrl}' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>${integrationName}</a>`
                : integrationName}
                        <span style='color:#888;'>(${this.entityId})</span>
                    </div>
                    ${this.meteogramError && (this._weatherApiInstance && this._weatherApiInstance._forecastData)
                ? `<div style='margin-top:8px;padding:8px;background:#ffebee;border-left:4px solid #b71c1c;color:#b71c1c;font-size:0.97em;border-radius:4px;'><b>⚠️ API Error (showing cached data):</b><br><span style='color:#555;'>${this.meteogramError}</span></div>`
                : ""}
                    ${this._missingForecastKeys &&
                this._missingForecastKeys.length > 0
                ? `<div style='margin-top:8px;color:#b71c1c;font-size:0.97em;'><b>Missing data:</b> ${this._missingForecastKeys.join(", ")}
                    <br>Some supported features cannot be plotted because the required data is not provided.</div>`
                : ""}
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
                    <div style='margin-top:8px;color:#666;font-size:0.9em;'><b>Card version:</b> ${MeteogramCard_1.meteogramCardVersion}</div>
                </div>
            `;
        }
        else {
            attributionTooltip = `
                <div style='padding:8px;min-width:300px;max-width:450px;text-align:left;'>
                    <div style='margin-bottom:4px;'>
                        Weather data from <a href='https://www.met.no/en' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>the Norwegian Meteorological Institute (MET Norway)</a>,
                        licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;'>CC BY 4.0</a>
                    </div>
                    ${this.meteogramError && (this._weatherApiInstance && this._weatherApiInstance._forecastData)
                ? `<div style='margin-top:8px;padding:8px;background:#ffebee;border-left:4px solid #b71c1c;color:#b71c1c;font-size:0.97em;border-radius:4px;'><b>⚠️ API Error (showing cached data):</b><br><span style='color:#555;'>${this.meteogramError}</span></div>`
                : ""}
                    ${this._missingForecastKeys &&
                this._missingForecastKeys.length > 0
                ? `<div style='margin-top:8px;color:#b71c1c;font-size:0.97em;'><b>Missing data:</b> ${this._missingForecastKeys.join(", ")}</div>`
                : ""}
                    ${this.generateDiagnosticInfo().tooltip}
                    <div style='margin-top:8px;color:#1976d2;font-size:0.97em;'><b>Hours available in data source:</b> <b>${this.getAvailableHours()}</b></div>
                    <div style='margin-top:8px;color:#666;font-size:0.9em;'><b>Card version:</b> ${MeteogramCard_1.meteogramCardVersion}</div>
                </div>
            `;
        }
        // Full mode: everything
        return b `
      <ha-card style="${styleVars}">
        ${this.title ? b `<div class="card-header">${this.title}</div>` : ""}
        <div class="card-content">
          ${showAttribution
            ? b `
                <div class="attribution-icon-wrapper">
                  <span
                    class="attribution-icon"
                    style="color:${attributionColor};"
                    tabindex="0"
                    @click=${this._onAttributionIconClick}
                    @keydown=${(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    this._onAttributionIconClick(e);
                }
            }}
                    aria-label="Show attribution"
                    aria-expanded="${this.attributionTooltipOpen}"
                  >
                    <span style="font-size:1.3em;vertical-align:middle;"
                      >${statusSymbol}</span
                    >
                    <span
                      class="attribution-tooltip${this.attributionTooltipOpen
                ? " open"
                : ""}"
                      .innerHTML=${attributionTooltip}
                    ></span>
                  </span>
                </div>
              `
            : ""}
          ${this.meteogramError && !(this._weatherApiInstance && this._weatherApiInstance._forecastData)
            ? b `<div
                class="error"
                style="white-space:normal;"
                .innerHTML=${this.meteogramError}
              ></div>`
            : b `
                <div style="${chartContainerStyle}">
                  <div id="chart" style="width:100%;height:100%"></div>
                </div>
                ${this.diagnostics
                ? (() => {
                    const diagnosticInfo = this.generateDiagnosticInfo();
                    return b `
                        <div
                          id="meteogram-status-panel"
                          style="margin-top:12px; font-size:0.95em; background:#f5f5f5; border-radius:6px; padding:8px; color:#333;"
                          xmlns="http://www.w3.org/1999/html"
                        >
                          <b
                            >${trnslt(this.hass, "ui.card.meteogram.status_panel", "Status Panel")}</b
                          >
                          <div
                            style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;"
                          >
                            <div>
                              <span
                                >${trnslt(this.hass, "ui.card.meteogram.status.expires_at", "Expires At")}
                                : ${diagnosticInfo.expires}</span
                              ><br />
                              <span
                                >${trnslt(this.hass, "ui.card.meteogram.status.last_render", "Last Render")}
                                : ${diagnosticInfo.lastRender}</span
                              ><br />
                              <span
                                >${trnslt(this.hass, "ui.card.meteogram.status.last_data_fetch", "Last Data Fetch")}
                                : ${diagnosticInfo.lastFetch}</span
                              >
                            </div>
                            <div>
                              <span
                                title="${this._lastApiSuccess
                        ? trnslt(this.hass, "ui.card.meteogram.status.success", "success") + ` : ${successTooltip}`
                        : this._statusApiSuccess === null
                            ? trnslt(this.hass, "ui.card.meteogram.status.cached", "cached") + ` : ${successTooltip}`
                            : trnslt(this.hass, "ui.card.meteogram.status.failed", "failed") + ` : ${successTooltip}`}"
                              >
                                ${trnslt(this.hass, "ui.card.meteogram.status.api_success", "API Success")}
                                :
                                ${this._lastApiSuccess
                        ? "✅"
                        : this._statusApiSuccess === null
                            ? "❎"
                            : "❌"}
                              </span>
                              <br />
                              <span
                                >Card version:
                                <code
                                  >${MeteogramCard_1.meteogramCardVersion}</code
                                ></span
                              ><br />
                              <span
                                >Client type:
                                <code>${getClientName()}</code></span
                              ><br />
                              <span>${successTooltip}</span>
                            </div>
                          </div>
                          ${diagnosticInfo.panel || ""}
                        </div>
                      `;
                })()
                : ""}
              `}
        </div>
      </ha-card>
    `;
    }
    // Add logging method to help debug DOM structure - only used when errors occur
    _logDomState() {
        if (this.errorCount > 0 && this.debug) {
            this._debugLog("DOM state check:");
            this._debugLog("- shadowRoot exists:", !!this.shadowRoot);
            if (this.shadowRoot) {
                const chartDiv = this.shadowRoot.querySelector("#chart");
                this._debugLog("- chart div exists:", !!chartDiv);
                if (chartDiv) {
                    this._debugLog("- chart div size:", chartDiv.offsetWidth, "x", chartDiv.offsetHeight);
                }
            }
            this._debugLog("- Is connected:", this.isConnected);
            this._debugLog("- Chart loaded:", this.chartLoaded);
        }
    }
    // Add a logging helper to log method entry and errors with context
    logMethodEntry(method, context) {
        if (context !== undefined) {
            this._debugLog(`[${CARD_NAME}] ENTER: ${method}`, context);
        }
        else {
            this._debugLog(`[${CARD_NAME}] ENTER: ${method}`);
        }
    }
    logErrorContext(context, error) {
        if (error instanceof Error) {
            console.error(`[${CARD_NAME}] ERROR in ${context}:`, error.message, error.stack);
        }
        else {
            console.error(`[${CARD_NAME}] ERROR in ${context}:`, error);
        }
    }
    // Helper method to set errors with rate limiting
    setError(message) {
        this.logMethodEntry("setError", { message });
        const now = Date.now();
        // Always show full error as HTML if diagnostics is enabled
        this.meteogramError = message;
        this.lastErrorTime = now;
        this.errorCount = 1;
        console.error("Meteogram error:", message);
        // If this is a repeat of the same error, just count it
        if (message === this.meteogramError) {
            this.errorCount++;
            // Only update the UI with the error count periodically
            if (now - this.lastErrorTime > 10000) {
                // 10 seconds
                this.meteogramError = `${message} (occurred ${this.errorCount} times)`;
                this.lastErrorTime = now;
            }
        }
        else {
            // New error, reset counter
            this.errorCount = 1;
            this.meteogramError = message;
            this.lastErrorTime = now;
            console.error("Meteogram error:", message);
        }
    }
    // Add dark mode detection
    _updateDarkMode() {
        let isDark = false;
        // Home Assistant sets dark mode in hass.themes.darkMode
        if (this.hass &&
            this.hass.themes &&
            typeof this.hass.themes.darkMode === "boolean") {
            isDark = this.hass.themes.darkMode;
        }
        else {
            // Fallback: check .dark-theme on <html> or <body>
            isDark =
                document.documentElement.classList.contains("dark-theme") ||
                    document.body.classList.contains("dark-theme");
        }
        if (isDark) {
            this.setAttribute("dark", "");
        }
        else {
            this.removeAttribute("dark");
        }
    }
    // Add a helper to convert Celsius to Fahrenheit if needed
    convertTemperature(tempC) {
        if (tempC === null || tempC === undefined)
            return tempC;
        const unit = this.getSystemTemperatureUnit();
        // Use the shared conversion helper
        return convertTemperature(tempC, "°C", unit);
    }
    // Add a helper to convert pressure units
    convertPressure(pressure) {
        if (pressure === null || pressure === undefined)
            return pressure;
        const unit = this.getSystemPressureUnit();
        return convertPressure(pressure, "hPa", unit);
    }
    // Add a helper to convert wind speed units
    convertWindSpeed(windSpeed) {
        if (windSpeed === null || windSpeed === undefined)
            return windSpeed;
        const unit = this.getSystemWindSpeedUnit();
        return convertWindSpeed(windSpeed, "m/s", unit);
    }
    // Add a helper to convert precipitation units
    convertPrecipitation(precip) {
        if (precip === null || precip === undefined)
            return precip;
        const unit = this.getSystemPrecipitationUnit();
        return convertPrecipitation(precip, "mm", unit);
    }
    // Add initialization method for units
    _initializeUnits() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Temperature unit
        if ((_c = (_b = (_a = this.hass) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.unit_system) === null || _c === void 0 ? void 0 : _c.temperature) {
            const unit = this.hass.config.unit_system.temperature;
            if (unit === "°F" || unit === "°C")
                this._tempUnit = unit;
            else if (unit === "F")
                this._tempUnit = "°F";
            else if (unit === "C")
                this._tempUnit = "°C";
        }
        // Pressure unit
        if ((_f = (_e = (_d = this.hass) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.unit_system) === null || _f === void 0 ? void 0 : _f.pressure) {
            const unit = this.hass.config.unit_system.pressure;
            if (unit === "hPa" || unit === "inHg")
                this._pressureUnit = unit;
            else if (unit === "mbar")
                this._pressureUnit = "hPa";
        }
        // Wind speed unit
        if ((_j = (_h = (_g = this.hass) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.unit_system) === null || _j === void 0 ? void 0 : _j.wind_speed) {
            const unit = this.hass.config.unit_system.wind_speed;
            if (unit === "m/s" ||
                unit === "km/h" ||
                unit === "mph" ||
                unit === "kt" ||
                unit === "kn")
                this._windSpeedUnit = unit === "kn" ? "kt" : unit; // Normalize knots to "kt"
        }
        // Precipitation unit
        if ((_m = (_l = (_k = this.hass) === null || _k === void 0 ? void 0 : _k.config) === null || _l === void 0 ? void 0 : _l.unit_system) === null || _m === void 0 ? void 0 : _m.precipitation) {
            const unit = this.hass.config.unit_system.precipitation;
            if (unit === "mm" || unit === "in")
                this._precipUnit = unit;
        }
    }
    // Update the existing unit getter methods to use the class variables
    getSystemTemperatureUnit() {
        return this._tempUnit;
    }
    getSystemPressureUnit() {
        return this._pressureUnit;
    }
    getSystemWindSpeedUnit() {
        return this._windSpeedUnit;
    }
    getSystemPrecipitationUnit() {
        return this._precipUnit;
    }
    // Helper to get the number of hours available in the data source
    getAvailableHours() {
        // If already calculated, return cached value
        if (this._availableHours !== null) {
            return this._availableHours;
        }
        return "unknown";
    }
    // Schedule periodic cache cleanup (run once per page load)
    schedulePeriodicCacheCleanup() {
        // Only run cleanup once per browser session to avoid excessive operations
        const sessionKey = "meteogram-card-cleanup-done";
        if (sessionStorage.getItem(sessionKey)) {
            return; // Already cleaned up in this session
        }
        try {
            // Clean up MET.no weather cache
            const cacheStr = localStorage.getItem("metno-weather-cache");
            if (cacheStr) {
                try {
                    const cacheObj = JSON.parse(cacheStr);
                    if (cacheObj["forecast-data"]) {
                        const now = Date.now();
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        const requiredArrays = [
                            "time",
                            "temperature",
                            "rain",
                            "rainMin",
                            "rainMax",
                            "cloudCover",
                            "windSpeed",
                            "windGust",
                            "windDirection",
                            "symbolCode",
                            "pressure",
                        ];
                        let removedCount = 0;
                        let invalidCount = 0;
                        for (const [key, entry] of Object.entries(cacheObj["forecast-data"])) {
                            const entryData = entry;
                            let shouldRemove = false;
                            // Remove entries older than 24h past expiry
                            if (now - entryData.expiresAt > twentyFourHours) {
                                shouldRemove = true;
                                removedCount++;
                            }
                            // Validate data structure
                            else if (!entryData.data || typeof entryData.data !== "object") {
                                shouldRemove = true;
                                invalidCount++;
                            }
                            // Check for missing required arrays
                            else {
                                const missingArrays = requiredArrays.filter((prop) => !Array.isArray(entryData.data[prop]));
                                if (missingArrays.length > 0) {
                                    shouldRemove = true;
                                    invalidCount++;
                                }
                            }
                            if (shouldRemove) {
                                delete cacheObj["forecast-data"][key];
                            }
                        }
                        if (removedCount > 0 || invalidCount > 0) {
                            localStorage.setItem("metno-weather-cache", JSON.stringify(cacheObj));
                            // Static method - check localStorage for debug flag
                            if (localStorage.getItem("meteogram-debug") === "true") {
                                console.debug(`[${CARD_NAME}] Startup cleanup: removed ${removedCount} old and ${invalidCount} invalid MET.no cache entries`);
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn(`[${CARD_NAME}] Corrupted MET.no cache during startup cleanup, clearing:`, e);
                    localStorage.removeItem("metno-weather-cache");
                }
            }
            // Clean up entity cache
            const entityCacheStr = localStorage.getItem("meteogram-card-entity-weather-cache");
            if (entityCacheStr) {
                try {
                    const entityCache = JSON.parse(entityCacheStr);
                    const now = Date.now();
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    const requiredArrays = [
                        "time",
                        "temperature",
                        "rain",
                        "rainMin",
                        "rainMax",
                        "cloudCover",
                        "windSpeed",
                        "windGust",
                        "windDirection",
                        "symbolCode",
                        "pressure",
                    ];
                    let removedCount = 0;
                    let invalidCount = 0;
                    for (const [entityId, entry] of Object.entries(entityCache)) {
                        let shouldRemove = false;
                        // Handle both old format (direct data) and new format (with timestamp)
                        if (entry && typeof entry === "object" && "timestamp" in entry) {
                            const entryData = entry;
                            // Remove entries older than 24h
                            if (now - entryData.timestamp > twentyFourHours) {
                                shouldRemove = true;
                                removedCount++;
                            }
                            // Validate data structure
                            else if (!entryData.data || typeof entryData.data !== "object") {
                                shouldRemove = true;
                                invalidCount++;
                            }
                            // Check for missing required arrays
                            else {
                                const missingArrays = requiredArrays.filter((prop) => !Array.isArray(entryData.data[prop]));
                                if (missingArrays.length > 0) {
                                    shouldRemove = true;
                                    invalidCount++;
                                }
                            }
                        }
                        else if (entry && typeof entry === "object") {
                            // Old format - validate structure
                            const missingArrays = requiredArrays.filter((prop) => !Array.isArray(entry[prop]));
                            if (missingArrays.length > 0) {
                                shouldRemove = true;
                                invalidCount++;
                            }
                            // Keep valid old format entries for backward compatibility - they'll be converted on next save
                        }
                        else {
                            // Corrupted entry - remove it
                            shouldRemove = true;
                            invalidCount++;
                        }
                        if (shouldRemove) {
                            delete entityCache[entityId];
                        }
                    }
                    if (removedCount > 0 || invalidCount > 0) {
                        localStorage.setItem("meteogram-card-entity-weather-cache", JSON.stringify(entityCache));
                        // Static method - check localStorage for debug flag
                        if (localStorage.getItem("meteogram-debug") === "true") {
                            console.debug(`[${CARD_NAME}] Startup cleanup: removed ${removedCount} old and ${invalidCount} invalid entity cache entries`);
                        }
                    }
                }
                catch (e) {
                    console.warn(`[${CARD_NAME}] Corrupted entity cache during startup cleanup, clearing:`, e);
                    localStorage.removeItem("meteogram-card-entity-weather-cache");
                }
            }
            // Mark cleanup as done for this browser session
            sessionStorage.setItem(sessionKey, "true");
        }
        catch (e) {
            console.warn(`[${CARD_NAME}] Failed to perform startup cache cleanup:`, e);
        }
    }
};
MeteogramCard.lastD3RetryTime = 0;
MeteogramCard.meteogramCardVersion = version;
MeteogramCard.styles = meteogramCardStyles;
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "title", void 0);
__decorate([
    n({ type: Number })
], MeteogramCard.prototype, "latitude", void 0);
__decorate([
    n({ type: Number })
], MeteogramCard.prototype, "longitude", void 0);
__decorate([
    n({ attribute: false })
], MeteogramCard.prototype, "hass", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "showCloudCover", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "showPressure", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "showWeatherIcons", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "showWind", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "denseWeatherIcons", void 0);
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "meteogramHours", void 0);
__decorate([
    n({ type: Object })
], MeteogramCard.prototype, "styles", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "diagnostics", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "debug", void 0);
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "entityId", void 0);
__decorate([
    n({ type: Boolean })
], MeteogramCard.prototype, "focussed", void 0);
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "displayMode", void 0);
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "aspectRatio", void 0);
__decorate([
    n({ type: Number })
], MeteogramCard.prototype, "altitude", void 0);
__decorate([
    n({ type: String })
], MeteogramCard.prototype, "layoutMode", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "chartLoaded", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "meteogramError", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "errorCount", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "lastErrorTime", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "_statusExpiresAt", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "_statusLastRender", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "_statusLastFetch", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "_statusApiSuccess", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "attributionTooltipOpen", void 0);
__decorate([
    r()
], MeteogramCard.prototype, "entityAttribution", void 0);
MeteogramCard = MeteogramCard_1 = __decorate([
    t("meteogram-card")
], MeteogramCard);

// Print version info - based on mushroom cards implementation
const printVersionInfo = () => {
    // Use the blue color from wind barbs and add weather emojis
    console.info(`%c☀️ ${CARD_NAME} ${version} ⚡️🌦️`, "color: #1976d2; font-weight: bold; background: white");
};
// Print version info on startup
printVersionInfo();
// Tell TypeScript that the class is being used
// @ts-ignore: Used by customElement decorator
window.customElements.get("meteogram-card") ||
    customElements.define("meteogram-card", MeteogramCard);
// Home Assistant requires this for custom cards
window.customCards = window.customCards || [];
window.customCards.push({
    type: "meteogram-card",
    name: CARD_NAME,
    description: "A custom card showing a meteogram with wind barbs.",
    version: version,
    preview: "https://github.com/DTekNO/lovelace-meteogram-card/blob/main/images/meteogram-card.png",
    documentationURL: "https://github.com/DTekNO/lovelace-meteogram-card/blob/main/README.md",
});
//# sourceMappingURL=meteogram-card.js.map
