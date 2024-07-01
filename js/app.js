(() => {
    "use strict";
    const modules_flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(webP.height == 2);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = support === true ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
                document.querySelector(".header.header");
            }
        }));
    }
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function functions_FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Прокинувся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if (this._dataValue !== "error") {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Йой, не заповнено атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && e.which == 9 && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Відкрив попап`);
                } else this.popupLogging(`Йой, такого попапу немає. Перевірте коректність введення. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрив попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            this.youTubeCode = buttons.getAttribute(this.options.youtubeAttribute) ? buttons.getAttribute(this.options.youtubeAttribute) : null;
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? functions_FLS(`[Попапос]: ${message}`) : null;
        }
    }
    modules_flsModules.popup = new Popup({});
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            headerItem = "header.header";
            const headerElement = document.querySelector(headerItem);
            if (noHeader) if (!headerElement.classList.contains("_header-scroll")) {
                headerElement.style.cssText = `transition-duration: 0s;`;
                headerElement.classList.add("_header-scroll");
                headerItemHeight = headerElement.offsetHeight;
                headerElement.classList.remove("_header-scroll");
                setTimeout((() => {
                    headerElement.style.cssText = ``;
                }), 0);
            } else headerItemHeight = headerElement.offsetHeight;
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            if (typeof SmoothScroll !== "undefined") (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                if (!headerElement.classList.contains("_header-scroll") || document.documentElement.classList.contains("menu-open")) {
                    headerElement.style.cssText = `transition-duration: 0s;`;
                    headerElement.querySelectorAll("*").forEach((element => {
                        element.style.cssText = `transition-duration: 0s;`;
                    }));
                    headerElement.classList.add("_header-scroll");
                    menuClose();
                }
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                setTimeout((() => {
                    headerElement.style.cssText = ``;
                    headerElement.querySelectorAll("*").forEach((element => {
                        element.style.cssText = ``;
                    }));
                }), 0);
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            functions_FLS(`[gotoBlock]: Юхуу...їдемо до ${targetBlock}`);
        } else functions_FLS(`[gotoBlock]: Йой... Такого блоку немає на сторінці: ${targetBlock}`);
    };
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
            writable: false
        });
        return Constructor;
    }
    /*!
 * Splide.js
 * Version  : 4.1.4
 * License  : MIT
 * Copyright: 2022 Naotoshi Fujita
 */    var MEDIA_PREFERS_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
    var CREATED = 1;
    var MOUNTED = 2;
    var IDLE = 3;
    var MOVING = 4;
    var SCROLLING = 5;
    var DRAGGING = 6;
    var DESTROYED = 7;
    var STATES = {
        CREATED,
        MOUNTED,
        IDLE,
        MOVING,
        SCROLLING,
        DRAGGING,
        DESTROYED
    };
    function empty(array) {
        array.length = 0;
    }
    function slice(arrayLike, start, end) {
        return Array.prototype.slice.call(arrayLike, start, end);
    }
    function apply(func) {
        return func.bind.apply(func, [ null ].concat(slice(arguments, 1)));
    }
    var nextTick = setTimeout;
    var noop = function noop() {};
    function raf(func) {
        return requestAnimationFrame(func);
    }
    function typeOf(type, subject) {
        return typeof subject === type;
    }
    function isObject(subject) {
        return !isNull(subject) && typeOf("object", subject);
    }
    var isArray = Array.isArray;
    var isFunction = apply(typeOf, "function");
    var isString = apply(typeOf, "string");
    var isUndefined = apply(typeOf, "undefined");
    function isNull(subject) {
        return subject === null;
    }
    function isHTMLElement(subject) {
        try {
            return subject instanceof (subject.ownerDocument.defaultView || window).HTMLElement;
        } catch (e) {
            return false;
        }
    }
    function toArray(value) {
        return isArray(value) ? value : [ value ];
    }
    function forEach(values, iteratee) {
        toArray(values).forEach(iteratee);
    }
    function includes(array, value) {
        return array.indexOf(value) > -1;
    }
    function push(array, items) {
        array.push.apply(array, toArray(items));
        return array;
    }
    function toggleClass(elm, classes, add) {
        if (elm) forEach(classes, (function(name) {
            if (name) elm.classList[add ? "add" : "remove"](name);
        }));
    }
    function addClass(elm, classes) {
        toggleClass(elm, isString(classes) ? classes.split(" ") : classes, true);
    }
    function append(parent, children) {
        forEach(children, parent.appendChild.bind(parent));
    }
    function before(nodes, ref) {
        forEach(nodes, (function(node) {
            var parent = (ref || node).parentNode;
            if (parent) parent.insertBefore(node, ref);
        }));
    }
    function matches(elm, selector) {
        return isHTMLElement(elm) && (elm["msMatchesSelector"] || elm.matches).call(elm, selector);
    }
    function children(parent, selector) {
        var children2 = parent ? slice(parent.children) : [];
        return selector ? children2.filter((function(child) {
            return matches(child, selector);
        })) : children2;
    }
    function child(parent, selector) {
        return selector ? children(parent, selector)[0] : parent.firstElementChild;
    }
    var ownKeys = Object.keys;
    function forOwn(object, iteratee, right) {
        if (object) (right ? ownKeys(object).reverse() : ownKeys(object)).forEach((function(key) {
            key !== "__proto__" && iteratee(object[key], key);
        }));
        return object;
    }
    function splide_esm_assign(object) {
        slice(arguments, 1).forEach((function(source) {
            forOwn(source, (function(value, key) {
                object[key] = source[key];
            }));
        }));
        return object;
    }
    function merge(object) {
        slice(arguments, 1).forEach((function(source) {
            forOwn(source, (function(value, key) {
                if (isArray(value)) object[key] = value.slice(); else if (isObject(value)) object[key] = merge({}, isObject(object[key]) ? object[key] : {}, value); else object[key] = value;
            }));
        }));
        return object;
    }
    function omit(object, keys) {
        forEach(keys || ownKeys(object), (function(key) {
            delete object[key];
        }));
    }
    function removeAttribute(elms, attrs) {
        forEach(elms, (function(elm) {
            forEach(attrs, (function(attr) {
                elm && elm.removeAttribute(attr);
            }));
        }));
    }
    function setAttribute(elms, attrs, value) {
        if (isObject(attrs)) forOwn(attrs, (function(value2, name) {
            setAttribute(elms, name, value2);
        })); else forEach(elms, (function(elm) {
            isNull(value) || value === "" ? removeAttribute(elm, attrs) : elm.setAttribute(attrs, String(value));
        }));
    }
    function create(tag, attrs, parent) {
        var elm = document.createElement(tag);
        if (attrs) isString(attrs) ? addClass(elm, attrs) : setAttribute(elm, attrs);
        parent && append(parent, elm);
        return elm;
    }
    function style(elm, prop, value) {
        if (isUndefined(value)) return getComputedStyle(elm)[prop];
        if (!isNull(value)) elm.style[prop] = "" + value;
    }
    function display(elm, display2) {
        style(elm, "display", display2);
    }
    function splide_esm_focus(elm) {
        elm["setActive"] && elm["setActive"]() || elm.focus({
            preventScroll: true
        });
    }
    function getAttribute(elm, attr) {
        return elm.getAttribute(attr);
    }
    function hasClass(elm, className) {
        return elm && elm.classList.contains(className);
    }
    function rect(target) {
        return target.getBoundingClientRect();
    }
    function remove(nodes) {
        forEach(nodes, (function(node) {
            if (node && node.parentNode) node.parentNode.removeChild(node);
        }));
    }
    function parseHtml(html) {
        return child((new DOMParser).parseFromString(html, "text/html").body);
    }
    function prevent(e, stopPropagation) {
        e.preventDefault();
        if (stopPropagation) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
    function query(parent, selector) {
        return parent && parent.querySelector(selector);
    }
    function queryAll(parent, selector) {
        return selector ? slice(parent.querySelectorAll(selector)) : [];
    }
    function removeClass(elm, classes) {
        toggleClass(elm, classes, false);
    }
    function timeOf(e) {
        return e.timeStamp;
    }
    function unit(value) {
        return isString(value) ? value : value ? value + "px" : "";
    }
    var PROJECT_CODE = "splide";
    var DATA_ATTRIBUTE = "data-" + PROJECT_CODE;
    function assert(condition, message) {
        if (!condition) throw new Error("[" + PROJECT_CODE + "] " + (message || ""));
    }
    var min = Math.min, max = Math.max, floor = Math.floor, ceil = Math.ceil, abs = Math.abs;
    function approximatelyEqual(x, y, epsilon) {
        return abs(x - y) < epsilon;
    }
    function between(number, x, y, exclusive) {
        var minimum = min(x, y);
        var maximum = max(x, y);
        return exclusive ? minimum < number && number < maximum : minimum <= number && number <= maximum;
    }
    function clamp(number, x, y) {
        var minimum = min(x, y);
        var maximum = max(x, y);
        return min(max(minimum, number), maximum);
    }
    function sign(x) {
        return +(x > 0) - +(x < 0);
    }
    function camelToKebab(string) {
        return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    }
    function format(string, replacements) {
        forEach(replacements, (function(replacement) {
            string = string.replace("%s", "" + replacement);
        }));
        return string;
    }
    function pad(number) {
        return number < 10 ? "0" + number : "" + number;
    }
    var ids = {};
    function uniqueId(prefix) {
        return "" + prefix + pad(ids[prefix] = (ids[prefix] || 0) + 1);
    }
    function EventBinder() {
        var listeners = [];
        function bind(targets, events, callback, options) {
            forEachEvent(targets, events, (function(target, event, namespace) {
                var isEventTarget = "addEventListener" in target;
                var remover = isEventTarget ? target.removeEventListener.bind(target, event, callback, options) : target["removeListener"].bind(target, callback);
                isEventTarget ? target.addEventListener(event, callback, options) : target["addListener"](callback);
                listeners.push([ target, event, namespace, callback, remover ]);
            }));
        }
        function unbind(targets, events, callback) {
            forEachEvent(targets, events, (function(target, event, namespace) {
                listeners = listeners.filter((function(listener) {
                    if (listener[0] === target && listener[1] === event && listener[2] === namespace && (!callback || listener[3] === callback)) {
                        listener[4]();
                        return false;
                    }
                    return true;
                }));
            }));
        }
        function dispatch(target, type, detail) {
            var e;
            var bubbles = true;
            if (typeof CustomEvent === "function") e = new CustomEvent(type, {
                bubbles,
                detail
            }); else {
                e = document.createEvent("CustomEvent");
                e.initCustomEvent(type, bubbles, false, detail);
            }
            target.dispatchEvent(e);
            return e;
        }
        function forEachEvent(targets, events, iteratee) {
            forEach(targets, (function(target) {
                target && forEach(events, (function(events2) {
                    events2.split(" ").forEach((function(eventNS) {
                        var fragment = eventNS.split(".");
                        iteratee(target, fragment[0], fragment[1]);
                    }));
                }));
            }));
        }
        function destroy() {
            listeners.forEach((function(data) {
                data[4]();
            }));
            empty(listeners);
        }
        return {
            bind,
            unbind,
            dispatch,
            destroy
        };
    }
    var EVENT_MOUNTED = "mounted";
    var EVENT_READY = "ready";
    var EVENT_MOVE = "move";
    var EVENT_MOVED = "moved";
    var EVENT_CLICK = "click";
    var EVENT_ACTIVE = "active";
    var EVENT_INACTIVE = "inactive";
    var EVENT_VISIBLE = "visible";
    var EVENT_HIDDEN = "hidden";
    var EVENT_REFRESH = "refresh";
    var EVENT_UPDATED = "updated";
    var EVENT_RESIZE = "resize";
    var EVENT_RESIZED = "resized";
    var EVENT_DRAG = "drag";
    var EVENT_DRAGGING = "dragging";
    var EVENT_DRAGGED = "dragged";
    var EVENT_SCROLL = "scroll";
    var EVENT_SCROLLED = "scrolled";
    var EVENT_OVERFLOW = "overflow";
    var EVENT_DESTROY = "destroy";
    var EVENT_ARROWS_MOUNTED = "arrows:mounted";
    var EVENT_ARROWS_UPDATED = "arrows:updated";
    var EVENT_PAGINATION_MOUNTED = "pagination:mounted";
    var EVENT_PAGINATION_UPDATED = "pagination:updated";
    var EVENT_NAVIGATION_MOUNTED = "navigation:mounted";
    var EVENT_AUTOPLAY_PLAY = "autoplay:play";
    var EVENT_AUTOPLAY_PLAYING = "autoplay:playing";
    var EVENT_AUTOPLAY_PAUSE = "autoplay:pause";
    var EVENT_LAZYLOAD_LOADED = "lazyload:loaded";
    var EVENT_SLIDE_KEYDOWN = "sk";
    var EVENT_SHIFTED = "sh";
    var EVENT_END_INDEX_CHANGED = "ei";
    function EventInterface(Splide2) {
        var bus = Splide2 ? Splide2.event.bus : document.createDocumentFragment();
        var binder = EventBinder();
        function on(events, callback) {
            binder.bind(bus, toArray(events).join(" "), (function(e) {
                callback.apply(callback, isArray(e.detail) ? e.detail : []);
            }));
        }
        function emit(event) {
            binder.dispatch(bus, event, slice(arguments, 1));
        }
        if (Splide2) Splide2.event.on(EVENT_DESTROY, binder.destroy);
        return splide_esm_assign(binder, {
            bus,
            on,
            off: apply(binder.unbind, bus),
            emit
        });
    }
    function RequestInterval(interval, onInterval, onUpdate, limit) {
        var now = Date.now;
        var startTime;
        var rate = 0;
        var id;
        var paused = true;
        var count = 0;
        function update() {
            if (!paused) {
                rate = interval ? min((now() - startTime) / interval, 1) : 1;
                onUpdate && onUpdate(rate);
                if (rate >= 1) {
                    onInterval();
                    startTime = now();
                    if (limit && ++count >= limit) return pause();
                }
                id = raf(update);
            }
        }
        function start(resume) {
            resume || cancel();
            startTime = now() - (resume ? rate * interval : 0);
            paused = false;
            id = raf(update);
        }
        function pause() {
            paused = true;
        }
        function rewind() {
            startTime = now();
            rate = 0;
            if (onUpdate) onUpdate(rate);
        }
        function cancel() {
            id && cancelAnimationFrame(id);
            rate = 0;
            id = 0;
            paused = true;
        }
        function set(time) {
            interval = time;
        }
        function isPaused() {
            return paused;
        }
        return {
            start,
            rewind,
            pause,
            cancel,
            set,
            isPaused
        };
    }
    function State(initialState) {
        var state = initialState;
        function set(value) {
            state = value;
        }
        function is(states) {
            return includes(toArray(states), state);
        }
        return {
            set,
            is
        };
    }
    function Throttle(func, duration) {
        var interval = RequestInterval(duration || 0, func, null, 1);
        return function() {
            interval.isPaused() && interval.start();
        };
    }
    function Media(Splide2, Components2, options) {
        var state = Splide2.state;
        var breakpoints = options.breakpoints || {};
        var reducedMotion = options.reducedMotion || {};
        var binder = EventBinder();
        var queries = [];
        function setup() {
            var isMin = options.mediaQuery === "min";
            ownKeys(breakpoints).sort((function(n, m) {
                return isMin ? +n - +m : +m - +n;
            })).forEach((function(key) {
                register(breakpoints[key], "(" + (isMin ? "min" : "max") + "-width:" + key + "px)");
            }));
            register(reducedMotion, MEDIA_PREFERS_REDUCED_MOTION);
            update();
        }
        function destroy(completely) {
            if (completely) binder.destroy();
        }
        function register(options2, query) {
            var queryList = matchMedia(query);
            binder.bind(queryList, "change", update);
            queries.push([ options2, queryList ]);
        }
        function update() {
            var destroyed = state.is(DESTROYED);
            var direction = options.direction;
            var merged = queries.reduce((function(merged2, entry) {
                return merge(merged2, entry[1].matches ? entry[0] : {});
            }), {});
            omit(options);
            set(merged);
            if (options.destroy) Splide2.destroy(options.destroy === "completely"); else if (destroyed) {
                destroy(true);
                Splide2.mount();
            } else direction !== options.direction && Splide2.refresh();
        }
        function reduce(enable) {
            if (matchMedia(MEDIA_PREFERS_REDUCED_MOTION).matches) enable ? merge(options, reducedMotion) : omit(options, ownKeys(reducedMotion));
        }
        function set(opts, base, notify) {
            merge(options, opts);
            base && merge(Object.getPrototypeOf(options), opts);
            if (notify || !state.is(CREATED)) Splide2.emit(EVENT_UPDATED, options);
        }
        return {
            setup,
            destroy,
            reduce,
            set
        };
    }
    var ARROW = "Arrow";
    var ARROW_LEFT = ARROW + "Left";
    var ARROW_RIGHT = ARROW + "Right";
    var ARROW_UP = ARROW + "Up";
    var ARROW_DOWN = ARROW + "Down";
    var RTL = "rtl";
    var TTB = "ttb";
    var ORIENTATION_MAP = {
        width: [ "height" ],
        left: [ "top", "right" ],
        right: [ "bottom", "left" ],
        x: [ "y" ],
        X: [ "Y" ],
        Y: [ "X" ],
        ArrowLeft: [ ARROW_UP, ARROW_RIGHT ],
        ArrowRight: [ ARROW_DOWN, ARROW_LEFT ]
    };
    function Direction(Splide2, Components2, options) {
        function resolve(prop, axisOnly, direction) {
            direction = direction || options.direction;
            var index = direction === RTL && !axisOnly ? 1 : direction === TTB ? 0 : -1;
            return ORIENTATION_MAP[prop] && ORIENTATION_MAP[prop][index] || prop.replace(/width|left|right/i, (function(match, offset) {
                var replacement = ORIENTATION_MAP[match.toLowerCase()][index] || match;
                return offset > 0 ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
            }));
        }
        function orient(value) {
            return value * (options.direction === RTL ? 1 : -1);
        }
        return {
            resolve,
            orient
        };
    }
    var ROLE = "role";
    var TAB_INDEX = "tabindex";
    var DISABLED = "disabled";
    var ARIA_PREFIX = "aria-";
    var ARIA_CONTROLS = ARIA_PREFIX + "controls";
    var ARIA_CURRENT = ARIA_PREFIX + "current";
    var ARIA_SELECTED = ARIA_PREFIX + "selected";
    var ARIA_LABEL = ARIA_PREFIX + "label";
    var ARIA_LABELLEDBY = ARIA_PREFIX + "labelledby";
    var ARIA_HIDDEN = ARIA_PREFIX + "hidden";
    var ARIA_ORIENTATION = ARIA_PREFIX + "orientation";
    var ARIA_ROLEDESCRIPTION = ARIA_PREFIX + "roledescription";
    var ARIA_LIVE = ARIA_PREFIX + "live";
    var ARIA_BUSY = ARIA_PREFIX + "busy";
    var ARIA_ATOMIC = ARIA_PREFIX + "atomic";
    var ALL_ATTRIBUTES = [ ROLE, TAB_INDEX, DISABLED, ARIA_CONTROLS, ARIA_CURRENT, ARIA_LABEL, ARIA_LABELLEDBY, ARIA_HIDDEN, ARIA_ORIENTATION, ARIA_ROLEDESCRIPTION ];
    var CLASS_PREFIX = PROJECT_CODE + "__";
    var STATUS_CLASS_PREFIX = "is-";
    var CLASS_ROOT = PROJECT_CODE;
    var CLASS_TRACK = CLASS_PREFIX + "track";
    var CLASS_LIST = CLASS_PREFIX + "list";
    var CLASS_SLIDE = CLASS_PREFIX + "slide";
    var CLASS_CLONE = CLASS_SLIDE + "--clone";
    var CLASS_CONTAINER = CLASS_SLIDE + "__container";
    var CLASS_ARROWS = CLASS_PREFIX + "arrows";
    var CLASS_ARROW = CLASS_PREFIX + "arrow";
    var CLASS_ARROW_PREV = CLASS_ARROW + "--prev";
    var CLASS_ARROW_NEXT = CLASS_ARROW + "--next";
    var CLASS_PAGINATION = CLASS_PREFIX + "pagination";
    var CLASS_PAGINATION_PAGE = CLASS_PAGINATION + "__page";
    var CLASS_PROGRESS = CLASS_PREFIX + "progress";
    var CLASS_PROGRESS_BAR = CLASS_PROGRESS + "__bar";
    var CLASS_TOGGLE = CLASS_PREFIX + "toggle";
    var CLASS_SPINNER = CLASS_PREFIX + "spinner";
    var CLASS_SR = CLASS_PREFIX + "sr";
    var CLASS_INITIALIZED = STATUS_CLASS_PREFIX + "initialized";
    var CLASS_ACTIVE = STATUS_CLASS_PREFIX + "active";
    var CLASS_PREV = STATUS_CLASS_PREFIX + "prev";
    var CLASS_NEXT = STATUS_CLASS_PREFIX + "next";
    var CLASS_VISIBLE = STATUS_CLASS_PREFIX + "visible";
    var CLASS_LOADING = STATUS_CLASS_PREFIX + "loading";
    var CLASS_FOCUS_IN = STATUS_CLASS_PREFIX + "focus-in";
    var CLASS_OVERFLOW = STATUS_CLASS_PREFIX + "overflow";
    var STATUS_CLASSES = [ CLASS_ACTIVE, CLASS_VISIBLE, CLASS_PREV, CLASS_NEXT, CLASS_LOADING, CLASS_FOCUS_IN, CLASS_OVERFLOW ];
    var CLASSES = {
        slide: CLASS_SLIDE,
        clone: CLASS_CLONE,
        arrows: CLASS_ARROWS,
        arrow: CLASS_ARROW,
        prev: CLASS_ARROW_PREV,
        next: CLASS_ARROW_NEXT,
        pagination: CLASS_PAGINATION,
        page: CLASS_PAGINATION_PAGE,
        spinner: CLASS_SPINNER
    };
    function closest(from, selector) {
        if (isFunction(from.closest)) return from.closest(selector);
        var elm = from;
        while (elm && elm.nodeType === 1) {
            if (matches(elm, selector)) break;
            elm = elm.parentElement;
        }
        return elm;
    }
    var FRICTION = 5;
    var LOG_INTERVAL = 200;
    var POINTER_DOWN_EVENTS = "touchstart mousedown";
    var POINTER_MOVE_EVENTS = "touchmove mousemove";
    var POINTER_UP_EVENTS = "touchend touchcancel mouseup click";
    function Elements(Splide2, Components2, options) {
        var _EventInterface = EventInterface(Splide2), on = _EventInterface.on, bind = _EventInterface.bind;
        var root = Splide2.root;
        var i18n = options.i18n;
        var elements = {};
        var slides = [];
        var rootClasses = [];
        var trackClasses = [];
        var track;
        var list;
        var isUsingKey;
        function setup() {
            collect();
            init();
            update();
        }
        function mount() {
            on(EVENT_REFRESH, destroy);
            on(EVENT_REFRESH, setup);
            on(EVENT_UPDATED, update);
            bind(document, POINTER_DOWN_EVENTS + " keydown", (function(e) {
                isUsingKey = e.type === "keydown";
            }), {
                capture: true
            });
            bind(root, "focusin", (function() {
                toggleClass(root, CLASS_FOCUS_IN, !!isUsingKey);
            }));
        }
        function destroy(completely) {
            var attrs = ALL_ATTRIBUTES.concat("style");
            empty(slides);
            removeClass(root, rootClasses);
            removeClass(track, trackClasses);
            removeAttribute([ track, list ], attrs);
            removeAttribute(root, completely ? attrs : [ "style", ARIA_ROLEDESCRIPTION ]);
        }
        function update() {
            removeClass(root, rootClasses);
            removeClass(track, trackClasses);
            rootClasses = getClasses(CLASS_ROOT);
            trackClasses = getClasses(CLASS_TRACK);
            addClass(root, rootClasses);
            addClass(track, trackClasses);
            setAttribute(root, ARIA_LABEL, options.label);
            setAttribute(root, ARIA_LABELLEDBY, options.labelledby);
        }
        function collect() {
            track = find("." + CLASS_TRACK);
            list = child(track, "." + CLASS_LIST);
            assert(track && list, "A track/list element is missing.");
            push(slides, children(list, "." + CLASS_SLIDE + ":not(." + CLASS_CLONE + ")"));
            forOwn({
                arrows: CLASS_ARROWS,
                pagination: CLASS_PAGINATION,
                prev: CLASS_ARROW_PREV,
                next: CLASS_ARROW_NEXT,
                bar: CLASS_PROGRESS_BAR,
                toggle: CLASS_TOGGLE
            }, (function(className, key) {
                elements[key] = find("." + className);
            }));
            splide_esm_assign(elements, {
                root,
                track,
                list,
                slides
            });
        }
        function init() {
            var id = root.id || uniqueId(PROJECT_CODE);
            var role = options.role;
            root.id = id;
            track.id = track.id || id + "-track";
            list.id = list.id || id + "-list";
            if (!getAttribute(root, ROLE) && root.tagName !== "SECTION" && role) setAttribute(root, ROLE, role);
            setAttribute(root, ARIA_ROLEDESCRIPTION, i18n.carousel);
            setAttribute(list, ROLE, "presentation");
        }
        function find(selector) {
            var elm = query(root, selector);
            return elm && closest(elm, "." + CLASS_ROOT) === root ? elm : void 0;
        }
        function getClasses(base) {
            return [ base + "--" + options.type, base + "--" + options.direction, options.drag && base + "--draggable", options.isNavigation && base + "--nav", base === CLASS_ROOT && CLASS_ACTIVE ];
        }
        return splide_esm_assign(elements, {
            setup,
            mount,
            destroy
        });
    }
    var SLIDE = "slide";
    var LOOP = "loop";
    var FADE = "fade";
    function Slide$1(Splide2, index, slideIndex, slide) {
        var event = EventInterface(Splide2);
        var on = event.on, emit = event.emit, bind = event.bind;
        var Components = Splide2.Components, root = Splide2.root, options = Splide2.options;
        var isNavigation = options.isNavigation, updateOnMove = options.updateOnMove, i18n = options.i18n, pagination = options.pagination, slideFocus = options.slideFocus;
        var resolve = Components.Direction.resolve;
        var styles = getAttribute(slide, "style");
        var label = getAttribute(slide, ARIA_LABEL);
        var isClone = slideIndex > -1;
        var container = child(slide, "." + CLASS_CONTAINER);
        var destroyed;
        function mount() {
            if (!isClone) {
                slide.id = root.id + "-slide" + pad(index + 1);
                setAttribute(slide, ROLE, pagination ? "tabpanel" : "group");
                setAttribute(slide, ARIA_ROLEDESCRIPTION, i18n.slide);
                setAttribute(slide, ARIA_LABEL, label || format(i18n.slideLabel, [ index + 1, Splide2.length ]));
            }
            listen();
        }
        function listen() {
            bind(slide, "click", apply(emit, EVENT_CLICK, self));
            bind(slide, "keydown", apply(emit, EVENT_SLIDE_KEYDOWN, self));
            on([ EVENT_MOVED, EVENT_SHIFTED, EVENT_SCROLLED ], update);
            on(EVENT_NAVIGATION_MOUNTED, initNavigation);
            if (updateOnMove) on(EVENT_MOVE, onMove);
        }
        function destroy() {
            destroyed = true;
            event.destroy();
            removeClass(slide, STATUS_CLASSES);
            removeAttribute(slide, ALL_ATTRIBUTES);
            setAttribute(slide, "style", styles);
            setAttribute(slide, ARIA_LABEL, label || "");
        }
        function initNavigation() {
            var controls = Splide2.splides.map((function(target) {
                var Slide2 = target.splide.Components.Slides.getAt(index);
                return Slide2 ? Slide2.slide.id : "";
            })).join(" ");
            setAttribute(slide, ARIA_LABEL, format(i18n.slideX, (isClone ? slideIndex : index) + 1));
            setAttribute(slide, ARIA_CONTROLS, controls);
            setAttribute(slide, ROLE, slideFocus ? "button" : "");
            slideFocus && removeAttribute(slide, ARIA_ROLEDESCRIPTION);
        }
        function onMove() {
            if (!destroyed) update();
        }
        function update() {
            if (!destroyed) {
                var curr = Splide2.index;
                updateActivity();
                updateVisibility();
                toggleClass(slide, CLASS_PREV, index === curr - 1);
                toggleClass(slide, CLASS_NEXT, index === curr + 1);
            }
        }
        function updateActivity() {
            var active = isActive();
            if (active !== hasClass(slide, CLASS_ACTIVE)) {
                toggleClass(slide, CLASS_ACTIVE, active);
                setAttribute(slide, ARIA_CURRENT, isNavigation && active || "");
                emit(active ? EVENT_ACTIVE : EVENT_INACTIVE, self);
            }
        }
        function updateVisibility() {
            var visible = isVisible();
            var hidden = !visible && (!isActive() || isClone);
            if (!Splide2.state.is([ MOVING, SCROLLING ])) setAttribute(slide, ARIA_HIDDEN, hidden || "");
            setAttribute(queryAll(slide, options.focusableNodes || ""), TAB_INDEX, hidden ? -1 : "");
            if (slideFocus) setAttribute(slide, TAB_INDEX, hidden ? -1 : 0);
            if (visible !== hasClass(slide, CLASS_VISIBLE)) {
                toggleClass(slide, CLASS_VISIBLE, visible);
                emit(visible ? EVENT_VISIBLE : EVENT_HIDDEN, self);
            }
            if (!visible && document.activeElement === slide) {
                var Slide2 = Components.Slides.getAt(Splide2.index);
                Slide2 && splide_esm_focus(Slide2.slide);
            }
        }
        function style$1(prop, value, useContainer) {
            style(useContainer && container || slide, prop, value);
        }
        function isActive() {
            var curr = Splide2.index;
            return curr === index || options.cloneStatus && curr === slideIndex;
        }
        function isVisible() {
            if (Splide2.is(FADE)) return isActive();
            var trackRect = rect(Components.Elements.track);
            var slideRect = rect(slide);
            var left = resolve("left", true);
            var right = resolve("right", true);
            return floor(trackRect[left]) <= ceil(slideRect[left]) && floor(slideRect[right]) <= ceil(trackRect[right]);
        }
        function isWithin(from, distance) {
            var diff = abs(from - index);
            if (!isClone && (options.rewind || Splide2.is(LOOP))) diff = min(diff, Splide2.length - diff);
            return diff <= distance;
        }
        var self = {
            index,
            slideIndex,
            slide,
            container,
            isClone,
            mount,
            destroy,
            update,
            style: style$1,
            isWithin
        };
        return self;
    }
    function Slides(Splide2, Components2, options) {
        var _EventInterface2 = EventInterface(Splide2), on = _EventInterface2.on, emit = _EventInterface2.emit, bind = _EventInterface2.bind;
        var _Components2$Elements = Components2.Elements, slides = _Components2$Elements.slides, list = _Components2$Elements.list;
        var Slides2 = [];
        function mount() {
            init();
            on(EVENT_REFRESH, destroy);
            on(EVENT_REFRESH, init);
        }
        function init() {
            slides.forEach((function(slide, index) {
                register(slide, index, -1);
            }));
        }
        function destroy() {
            forEach$1((function(Slide2) {
                Slide2.destroy();
            }));
            empty(Slides2);
        }
        function update() {
            forEach$1((function(Slide2) {
                Slide2.update();
            }));
        }
        function register(slide, index, slideIndex) {
            var object = Slide$1(Splide2, index, slideIndex, slide);
            object.mount();
            Slides2.push(object);
            Slides2.sort((function(Slide1, Slide2) {
                return Slide1.index - Slide2.index;
            }));
        }
        function get(excludeClones) {
            return excludeClones ? filter((function(Slide2) {
                return !Slide2.isClone;
            })) : Slides2;
        }
        function getIn(page) {
            var Controller = Components2.Controller;
            var index = Controller.toIndex(page);
            var max = Controller.hasFocus() ? 1 : options.perPage;
            return filter((function(Slide2) {
                return between(Slide2.index, index, index + max - 1);
            }));
        }
        function getAt(index) {
            return filter(index)[0];
        }
        function add(items, index) {
            forEach(items, (function(slide) {
                if (isString(slide)) slide = parseHtml(slide);
                if (isHTMLElement(slide)) {
                    var ref = slides[index];
                    ref ? before(slide, ref) : append(list, slide);
                    addClass(slide, options.classes.slide);
                    observeImages(slide, apply(emit, EVENT_RESIZE));
                }
            }));
            emit(EVENT_REFRESH);
        }
        function remove$1(matcher) {
            remove(filter(matcher).map((function(Slide2) {
                return Slide2.slide;
            })));
            emit(EVENT_REFRESH);
        }
        function forEach$1(iteratee, excludeClones) {
            get(excludeClones).forEach(iteratee);
        }
        function filter(matcher) {
            return Slides2.filter(isFunction(matcher) ? matcher : function(Slide2) {
                return isString(matcher) ? matches(Slide2.slide, matcher) : includes(toArray(matcher), Slide2.index);
            });
        }
        function style(prop, value, useContainer) {
            forEach$1((function(Slide2) {
                Slide2.style(prop, value, useContainer);
            }));
        }
        function observeImages(elm, callback) {
            var images = queryAll(elm, "img");
            var length = images.length;
            if (length) images.forEach((function(img) {
                bind(img, "load error", (function() {
                    if (! --length) callback();
                }));
            })); else callback();
        }
        function getLength(excludeClones) {
            return excludeClones ? slides.length : Slides2.length;
        }
        function isEnough() {
            return Slides2.length > options.perPage;
        }
        return {
            mount,
            destroy,
            update,
            register,
            get,
            getIn,
            getAt,
            add,
            remove: remove$1,
            forEach: forEach$1,
            filter,
            style,
            getLength,
            isEnough
        };
    }
    function Layout(Splide2, Components2, options) {
        var _EventInterface3 = EventInterface(Splide2), on = _EventInterface3.on, bind = _EventInterface3.bind, emit = _EventInterface3.emit;
        var Slides = Components2.Slides;
        var resolve = Components2.Direction.resolve;
        var _Components2$Elements2 = Components2.Elements, root = _Components2$Elements2.root, track = _Components2$Elements2.track, list = _Components2$Elements2.list;
        var getAt = Slides.getAt, styleSlides = Slides.style;
        var vertical;
        var rootRect;
        var overflow;
        function mount() {
            init();
            bind(window, "resize load", Throttle(apply(emit, EVENT_RESIZE)));
            on([ EVENT_UPDATED, EVENT_REFRESH ], init);
            on(EVENT_RESIZE, resize);
        }
        function init() {
            vertical = options.direction === TTB;
            style(root, "maxWidth", unit(options.width));
            style(track, resolve("paddingLeft"), cssPadding(false));
            style(track, resolve("paddingRight"), cssPadding(true));
            resize(true);
        }
        function resize(force) {
            var newRect = rect(root);
            if (force || rootRect.width !== newRect.width || rootRect.height !== newRect.height) {
                style(track, "height", cssTrackHeight());
                styleSlides(resolve("marginRight"), unit(options.gap));
                styleSlides("width", cssSlideWidth());
                styleSlides("height", cssSlideHeight(), true);
                rootRect = newRect;
                emit(EVENT_RESIZED);
                if (overflow !== (overflow = isOverflow())) {
                    toggleClass(root, CLASS_OVERFLOW, overflow);
                    emit(EVENT_OVERFLOW, overflow);
                }
            }
        }
        function cssPadding(right) {
            var padding = options.padding;
            var prop = resolve(right ? "right" : "left");
            return padding && unit(padding[prop] || (isObject(padding) ? 0 : padding)) || "0px";
        }
        function cssTrackHeight() {
            var height = "";
            if (vertical) {
                height = cssHeight();
                assert(height, "height or heightRatio is missing.");
                height = "calc(" + height + " - " + cssPadding(false) + " - " + cssPadding(true) + ")";
            }
            return height;
        }
        function cssHeight() {
            return unit(options.height || rect(list).width * options.heightRatio);
        }
        function cssSlideWidth() {
            return options.autoWidth ? null : unit(options.fixedWidth) || (vertical ? "" : cssSlideSize());
        }
        function cssSlideHeight() {
            return unit(options.fixedHeight) || (vertical ? options.autoHeight ? null : cssSlideSize() : cssHeight());
        }
        function cssSlideSize() {
            var gap = unit(options.gap);
            return "calc((100%" + (gap && " + " + gap) + ")/" + (options.perPage || 1) + (gap && " - " + gap) + ")";
        }
        function listSize() {
            return rect(list)[resolve("width")];
        }
        function slideSize(index, withoutGap) {
            var Slide = getAt(index || 0);
            return Slide ? rect(Slide.slide)[resolve("width")] + (withoutGap ? 0 : getGap()) : 0;
        }
        function totalSize(index, withoutGap) {
            var Slide = getAt(index);
            if (Slide) {
                var right = rect(Slide.slide)[resolve("right")];
                var left = rect(list)[resolve("left")];
                return abs(right - left) + (withoutGap ? 0 : getGap());
            }
            return 0;
        }
        function sliderSize(withoutGap) {
            return totalSize(Splide2.length - 1) - totalSize(0) + slideSize(0, withoutGap);
        }
        function getGap() {
            var Slide = getAt(0);
            return Slide && parseFloat(style(Slide.slide, resolve("marginRight"))) || 0;
        }
        function getPadding(right) {
            return parseFloat(style(track, resolve("padding" + (right ? "Right" : "Left")))) || 0;
        }
        function isOverflow() {
            return Splide2.is(FADE) || sliderSize(true) > listSize();
        }
        return {
            mount,
            resize,
            listSize,
            slideSize,
            sliderSize,
            totalSize,
            getPadding,
            isOverflow
        };
    }
    var MULTIPLIER = 2;
    function Clones(Splide2, Components2, options) {
        var event = EventInterface(Splide2);
        var on = event.on;
        var Elements = Components2.Elements, Slides = Components2.Slides;
        var resolve = Components2.Direction.resolve;
        var clones = [];
        var cloneCount;
        function mount() {
            on(EVENT_REFRESH, remount);
            on([ EVENT_UPDATED, EVENT_RESIZE ], observe);
            if (cloneCount = computeCloneCount()) {
                generate(cloneCount);
                Components2.Layout.resize(true);
            }
        }
        function remount() {
            destroy();
            mount();
        }
        function destroy() {
            remove(clones);
            empty(clones);
            event.destroy();
        }
        function observe() {
            var count = computeCloneCount();
            if (cloneCount !== count) if (cloneCount < count || !count) event.emit(EVENT_REFRESH);
        }
        function generate(count) {
            var slides = Slides.get().slice();
            var length = slides.length;
            if (length) {
                while (slides.length < count) push(slides, slides);
                push(slides.slice(-count), slides.slice(0, count)).forEach((function(Slide, index) {
                    var isHead = index < count;
                    var clone = cloneDeep(Slide.slide, index);
                    isHead ? before(clone, slides[0].slide) : append(Elements.list, clone);
                    push(clones, clone);
                    Slides.register(clone, index - count + (isHead ? 0 : length), Slide.index);
                }));
            }
        }
        function cloneDeep(elm, index) {
            var clone = elm.cloneNode(true);
            addClass(clone, options.classes.clone);
            clone.id = Splide2.root.id + "-clone" + pad(index + 1);
            return clone;
        }
        function computeCloneCount() {
            var clones2 = options.clones;
            if (!Splide2.is(LOOP)) clones2 = 0; else if (isUndefined(clones2)) {
                var fixedSize = options[resolve("fixedWidth")] && Components2.Layout.slideSize(0);
                var fixedCount = fixedSize && ceil(rect(Elements.track)[resolve("width")] / fixedSize);
                clones2 = fixedCount || options[resolve("autoWidth")] && Splide2.length || options.perPage * MULTIPLIER;
            }
            return clones2;
        }
        return {
            mount,
            destroy
        };
    }
    function Move(Splide2, Components2, options) {
        var _EventInterface4 = EventInterface(Splide2), on = _EventInterface4.on, emit = _EventInterface4.emit;
        var set = Splide2.state.set;
        var _Components2$Layout = Components2.Layout, slideSize = _Components2$Layout.slideSize, getPadding = _Components2$Layout.getPadding, totalSize = _Components2$Layout.totalSize, listSize = _Components2$Layout.listSize, sliderSize = _Components2$Layout.sliderSize;
        var _Components2$Directio = Components2.Direction, resolve = _Components2$Directio.resolve, orient = _Components2$Directio.orient;
        var _Components2$Elements3 = Components2.Elements, list = _Components2$Elements3.list, track = _Components2$Elements3.track;
        var Transition;
        function mount() {
            Transition = Components2.Transition;
            on([ EVENT_MOUNTED, EVENT_RESIZED, EVENT_UPDATED, EVENT_REFRESH ], reposition);
        }
        function reposition() {
            if (!Components2.Controller.isBusy()) {
                Components2.Scroll.cancel();
                jump(Splide2.index);
                Components2.Slides.update();
            }
        }
        function move(dest, index, prev, callback) {
            if (dest !== index && canShift(dest > prev)) {
                cancel();
                translate(shift(getPosition(), dest > prev), true);
            }
            set(MOVING);
            emit(EVENT_MOVE, index, prev, dest);
            Transition.start(index, (function() {
                set(IDLE);
                emit(EVENT_MOVED, index, prev, dest);
                callback && callback();
            }));
        }
        function jump(index) {
            translate(toPosition(index, true));
        }
        function translate(position, preventLoop) {
            if (!Splide2.is(FADE)) {
                var destination = preventLoop ? position : loop(position);
                style(list, "transform", "translate" + resolve("X") + "(" + destination + "px)");
                position !== destination && emit(EVENT_SHIFTED);
            }
        }
        function loop(position) {
            if (Splide2.is(LOOP)) {
                var index = toIndex(position);
                var exceededMax = index > Components2.Controller.getEnd();
                var exceededMin = index < 0;
                if (exceededMin || exceededMax) position = shift(position, exceededMax);
            }
            return position;
        }
        function shift(position, backwards) {
            var excess = position - getLimit(backwards);
            var size = sliderSize();
            position -= orient(size * (ceil(abs(excess) / size) || 1)) * (backwards ? 1 : -1);
            return position;
        }
        function cancel() {
            translate(getPosition(), true);
            Transition.cancel();
        }
        function toIndex(position) {
            var Slides = Components2.Slides.get();
            var index = 0;
            var minDistance = 1 / 0;
            for (var i = 0; i < Slides.length; i++) {
                var slideIndex = Slides[i].index;
                var distance = abs(toPosition(slideIndex, true) - position);
                if (distance <= minDistance) {
                    minDistance = distance;
                    index = slideIndex;
                } else break;
            }
            return index;
        }
        function toPosition(index, trimming) {
            var position = orient(totalSize(index - 1) - offset(index));
            return trimming ? trim(position) : position;
        }
        function getPosition() {
            var left = resolve("left");
            return rect(list)[left] - rect(track)[left] + orient(getPadding(false));
        }
        function trim(position) {
            if (options.trimSpace && Splide2.is(SLIDE)) position = clamp(position, 0, orient(sliderSize(true) - listSize()));
            return position;
        }
        function offset(index) {
            var focus = options.focus;
            return focus === "center" ? (listSize() - slideSize(index, true)) / 2 : +focus * slideSize(index) || 0;
        }
        function getLimit(max) {
            return toPosition(max ? Components2.Controller.getEnd() : 0, !!options.trimSpace);
        }
        function canShift(backwards) {
            var shifted = orient(shift(getPosition(), backwards));
            return backwards ? shifted >= 0 : shifted <= list[resolve("scrollWidth")] - rect(track)[resolve("width")];
        }
        function exceededLimit(max, position) {
            position = isUndefined(position) ? getPosition() : position;
            var exceededMin = max !== true && orient(position) < orient(getLimit(false));
            var exceededMax = max !== false && orient(position) > orient(getLimit(true));
            return exceededMin || exceededMax;
        }
        return {
            mount,
            move,
            jump,
            translate,
            shift,
            cancel,
            toIndex,
            toPosition,
            getPosition,
            getLimit,
            exceededLimit,
            reposition
        };
    }
    function Controller(Splide2, Components2, options) {
        var _EventInterface5 = EventInterface(Splide2), on = _EventInterface5.on, emit = _EventInterface5.emit;
        var Move = Components2.Move;
        var getPosition = Move.getPosition, getLimit = Move.getLimit, toPosition = Move.toPosition;
        var _Components2$Slides = Components2.Slides, isEnough = _Components2$Slides.isEnough, getLength = _Components2$Slides.getLength;
        var omitEnd = options.omitEnd;
        var isLoop = Splide2.is(LOOP);
        var isSlide = Splide2.is(SLIDE);
        var getNext = apply(getAdjacent, false);
        var getPrev = apply(getAdjacent, true);
        var currIndex = options.start || 0;
        var endIndex;
        var prevIndex = currIndex;
        var slideCount;
        var perMove;
        var perPage;
        function mount() {
            init();
            on([ EVENT_UPDATED, EVENT_REFRESH, EVENT_END_INDEX_CHANGED ], init);
            on(EVENT_RESIZED, onResized);
        }
        function init() {
            slideCount = getLength(true);
            perMove = options.perMove;
            perPage = options.perPage;
            endIndex = getEnd();
            var index = clamp(currIndex, 0, omitEnd ? endIndex : slideCount - 1);
            if (index !== currIndex) {
                currIndex = index;
                Move.reposition();
            }
        }
        function onResized() {
            if (endIndex !== getEnd()) emit(EVENT_END_INDEX_CHANGED);
        }
        function go(control, allowSameIndex, callback) {
            if (!isBusy()) {
                var dest = parse(control);
                var index = loop(dest);
                if (index > -1 && (allowSameIndex || index !== currIndex)) {
                    setIndex(index);
                    Move.move(dest, index, prevIndex, callback);
                }
            }
        }
        function scroll(destination, duration, snap, callback) {
            Components2.Scroll.scroll(destination, duration, snap, (function() {
                var index = loop(Move.toIndex(getPosition()));
                setIndex(omitEnd ? min(index, endIndex) : index);
                callback && callback();
            }));
        }
        function parse(control) {
            var index = currIndex;
            if (isString(control)) {
                var _ref = control.match(/([+\-<>])(\d+)?/) || [], indicator = _ref[1], number = _ref[2];
                if (indicator === "+" || indicator === "-") index = computeDestIndex(currIndex + +("" + indicator + (+number || 1)), currIndex); else if (indicator === ">") index = number ? toIndex(+number) : getNext(true); else if (indicator === "<") index = getPrev(true);
            } else index = isLoop ? control : clamp(control, 0, endIndex);
            return index;
        }
        function getAdjacent(prev, destination) {
            var number = perMove || (hasFocus() ? 1 : perPage);
            var dest = computeDestIndex(currIndex + number * (prev ? -1 : 1), currIndex, !(perMove || hasFocus()));
            if (dest === -1 && isSlide) if (!approximatelyEqual(getPosition(), getLimit(!prev), 1)) return prev ? 0 : endIndex;
            return destination ? dest : loop(dest);
        }
        function computeDestIndex(dest, from, snapPage) {
            if (isEnough() || hasFocus()) {
                var index = computeMovableDestIndex(dest);
                if (index !== dest) {
                    from = dest;
                    dest = index;
                    snapPage = false;
                }
                if (dest < 0 || dest > endIndex) if (!perMove && (between(0, dest, from, true) || between(endIndex, from, dest, true))) dest = toIndex(toPage(dest)); else if (isLoop) dest = snapPage ? dest < 0 ? -(slideCount % perPage || perPage) : slideCount : dest; else if (options.rewind) dest = dest < 0 ? endIndex : 0; else dest = -1; else if (snapPage && dest !== from) dest = toIndex(toPage(from) + (dest < from ? -1 : 1));
            } else dest = -1;
            return dest;
        }
        function computeMovableDestIndex(dest) {
            if (isSlide && options.trimSpace === "move" && dest !== currIndex) {
                var position = getPosition();
                while (position === toPosition(dest, true) && between(dest, 0, Splide2.length - 1, !options.rewind)) dest < currIndex ? --dest : ++dest;
            }
            return dest;
        }
        function loop(index) {
            return isLoop ? (index + slideCount) % slideCount || 0 : index;
        }
        function getEnd() {
            var end = slideCount - (hasFocus() || isLoop && perMove ? 1 : perPage);
            while (omitEnd && end-- > 0) if (toPosition(slideCount - 1, true) !== toPosition(end, true)) {
                end++;
                break;
            }
            return clamp(end, 0, slideCount - 1);
        }
        function toIndex(page) {
            return clamp(hasFocus() ? page : perPage * page, 0, endIndex);
        }
        function toPage(index) {
            return hasFocus() ? min(index, endIndex) : floor((index >= endIndex ? slideCount - 1 : index) / perPage);
        }
        function toDest(destination) {
            var closest = Move.toIndex(destination);
            return isSlide ? clamp(closest, 0, endIndex) : closest;
        }
        function setIndex(index) {
            if (index !== currIndex) {
                prevIndex = currIndex;
                currIndex = index;
            }
        }
        function getIndex(prev) {
            return prev ? prevIndex : currIndex;
        }
        function hasFocus() {
            return !isUndefined(options.focus) || options.isNavigation;
        }
        function isBusy() {
            return Splide2.state.is([ MOVING, SCROLLING ]) && !!options.waitForTransition;
        }
        return {
            mount,
            go,
            scroll,
            getNext,
            getPrev,
            getAdjacent,
            getEnd,
            setIndex,
            getIndex,
            toIndex,
            toPage,
            toDest,
            hasFocus,
            isBusy
        };
    }
    var XML_NAME_SPACE = "http://www.w3.org/2000/svg";
    var PATH = "m15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z";
    var SIZE = 40;
    function Arrows(Splide2, Components2, options) {
        var event = EventInterface(Splide2);
        var on = event.on, bind = event.bind, emit = event.emit;
        var classes = options.classes, i18n = options.i18n;
        var Elements = Components2.Elements, Controller = Components2.Controller;
        var placeholder = Elements.arrows, track = Elements.track;
        var wrapper = placeholder;
        var prev = Elements.prev;
        var next = Elements.next;
        var created;
        var wrapperClasses;
        var arrows = {};
        function mount() {
            init();
            on(EVENT_UPDATED, remount);
        }
        function remount() {
            destroy();
            mount();
        }
        function init() {
            var enabled = options.arrows;
            if (enabled && !(prev && next)) createArrows();
            if (prev && next) {
                splide_esm_assign(arrows, {
                    prev,
                    next
                });
                display(wrapper, enabled ? "" : "none");
                addClass(wrapper, wrapperClasses = CLASS_ARROWS + "--" + options.direction);
                if (enabled) {
                    listen();
                    update();
                    setAttribute([ prev, next ], ARIA_CONTROLS, track.id);
                    emit(EVENT_ARROWS_MOUNTED, prev, next);
                }
            }
        }
        function destroy() {
            event.destroy();
            removeClass(wrapper, wrapperClasses);
            if (created) {
                remove(placeholder ? [ prev, next ] : wrapper);
                prev = next = null;
            } else removeAttribute([ prev, next ], ALL_ATTRIBUTES);
        }
        function listen() {
            on([ EVENT_MOUNTED, EVENT_MOVED, EVENT_REFRESH, EVENT_SCROLLED, EVENT_END_INDEX_CHANGED ], update);
            bind(next, "click", apply(go, ">"));
            bind(prev, "click", apply(go, "<"));
        }
        function go(control) {
            Controller.go(control, true);
        }
        function createArrows() {
            wrapper = placeholder || create("div", classes.arrows);
            prev = createArrow(true);
            next = createArrow(false);
            created = true;
            append(wrapper, [ prev, next ]);
            !placeholder && before(wrapper, track);
        }
        function createArrow(prev2) {
            var arrow = '<button class="' + classes.arrow + " " + (prev2 ? classes.prev : classes.next) + '" type="button"><svg xmlns="' + XML_NAME_SPACE + '" viewBox="0 0 ' + SIZE + " " + SIZE + '" width="' + SIZE + '" height="' + SIZE + '" focusable="false"><path d="' + (options.arrowPath || PATH) + '" />';
            return parseHtml(arrow);
        }
        function update() {
            if (prev && next) {
                var index = Splide2.index;
                var prevIndex = Controller.getPrev();
                var nextIndex = Controller.getNext();
                var prevLabel = prevIndex > -1 && index < prevIndex ? i18n.last : i18n.prev;
                var nextLabel = nextIndex > -1 && index > nextIndex ? i18n.first : i18n.next;
                prev.disabled = prevIndex < 0;
                next.disabled = nextIndex < 0;
                setAttribute(prev, ARIA_LABEL, prevLabel);
                setAttribute(next, ARIA_LABEL, nextLabel);
                emit(EVENT_ARROWS_UPDATED, prev, next, prevIndex, nextIndex);
            }
        }
        return {
            arrows,
            mount,
            destroy,
            update
        };
    }
    var INTERVAL_DATA_ATTRIBUTE = DATA_ATTRIBUTE + "-interval";
    function Autoplay(Splide2, Components2, options) {
        var _EventInterface6 = EventInterface(Splide2), on = _EventInterface6.on, bind = _EventInterface6.bind, emit = _EventInterface6.emit;
        var interval = RequestInterval(options.interval, Splide2.go.bind(Splide2, ">"), onAnimationFrame);
        var isPaused = interval.isPaused;
        var Elements = Components2.Elements, _Components2$Elements4 = Components2.Elements, root = _Components2$Elements4.root, toggle = _Components2$Elements4.toggle;
        var autoplay = options.autoplay;
        var hovered;
        var focused;
        var stopped = autoplay === "pause";
        function mount() {
            if (autoplay) {
                listen();
                toggle && setAttribute(toggle, ARIA_CONTROLS, Elements.track.id);
                stopped || play();
                update();
            }
        }
        function listen() {
            if (options.pauseOnHover) bind(root, "mouseenter mouseleave", (function(e) {
                hovered = e.type === "mouseenter";
                autoToggle();
            }));
            if (options.pauseOnFocus) bind(root, "focusin focusout", (function(e) {
                focused = e.type === "focusin";
                autoToggle();
            }));
            if (toggle) bind(toggle, "click", (function() {
                stopped ? play() : pause(true);
            }));
            on([ EVENT_MOVE, EVENT_SCROLL, EVENT_REFRESH ], interval.rewind);
            on(EVENT_MOVE, onMove);
        }
        function play() {
            if (isPaused() && Components2.Slides.isEnough()) {
                interval.start(!options.resetProgress);
                focused = hovered = stopped = false;
                update();
                emit(EVENT_AUTOPLAY_PLAY);
            }
        }
        function pause(stop) {
            if (stop === void 0) stop = true;
            stopped = !!stop;
            update();
            if (!isPaused()) {
                interval.pause();
                emit(EVENT_AUTOPLAY_PAUSE);
            }
        }
        function autoToggle() {
            if (!stopped) hovered || focused ? pause(false) : play();
        }
        function update() {
            if (toggle) {
                toggleClass(toggle, CLASS_ACTIVE, !stopped);
                setAttribute(toggle, ARIA_LABEL, options.i18n[stopped ? "play" : "pause"]);
            }
        }
        function onAnimationFrame(rate) {
            var bar = Elements.bar;
            bar && style(bar, "width", rate * 100 + "%");
            emit(EVENT_AUTOPLAY_PLAYING, rate);
        }
        function onMove(index) {
            var Slide = Components2.Slides.getAt(index);
            interval.set(Slide && +getAttribute(Slide.slide, INTERVAL_DATA_ATTRIBUTE) || options.interval);
        }
        return {
            mount,
            destroy: interval.cancel,
            play,
            pause,
            isPaused
        };
    }
    function Cover(Splide2, Components2, options) {
        var _EventInterface7 = EventInterface(Splide2), on = _EventInterface7.on;
        function mount() {
            if (options.cover) {
                on(EVENT_LAZYLOAD_LOADED, apply(toggle, true));
                on([ EVENT_MOUNTED, EVENT_UPDATED, EVENT_REFRESH ], apply(cover, true));
            }
        }
        function cover(cover2) {
            Components2.Slides.forEach((function(Slide) {
                var img = child(Slide.container || Slide.slide, "img");
                if (img && img.src) toggle(cover2, img, Slide);
            }));
        }
        function toggle(cover2, img, Slide) {
            Slide.style("background", cover2 ? 'center/cover no-repeat url("' + img.src + '")' : "", true);
            display(img, cover2 ? "none" : "");
        }
        return {
            mount,
            destroy: apply(cover, false)
        };
    }
    var BOUNCE_DIFF_THRESHOLD = 10;
    var BOUNCE_DURATION = 600;
    var FRICTION_FACTOR = .6;
    var BASE_VELOCITY = 1.5;
    var MIN_DURATION = 800;
    function Scroll(Splide2, Components2, options) {
        var _EventInterface8 = EventInterface(Splide2), on = _EventInterface8.on, emit = _EventInterface8.emit;
        var set = Splide2.state.set;
        var Move = Components2.Move;
        var getPosition = Move.getPosition, getLimit = Move.getLimit, exceededLimit = Move.exceededLimit, translate = Move.translate;
        var isSlide = Splide2.is(SLIDE);
        var interval;
        var callback;
        var friction = 1;
        function mount() {
            on(EVENT_MOVE, clear);
            on([ EVENT_UPDATED, EVENT_REFRESH ], cancel);
        }
        function scroll(destination, duration, snap, onScrolled, noConstrain) {
            var from = getPosition();
            clear();
            if (snap && (!isSlide || !exceededLimit())) {
                var size = Components2.Layout.sliderSize();
                var offset = sign(destination) * size * floor(abs(destination) / size) || 0;
                destination = Move.toPosition(Components2.Controller.toDest(destination % size)) + offset;
            }
            var noDistance = approximatelyEqual(from, destination, 1);
            friction = 1;
            duration = noDistance ? 0 : duration || max(abs(destination - from) / BASE_VELOCITY, MIN_DURATION);
            callback = onScrolled;
            interval = RequestInterval(duration, onEnd, apply(update, from, destination, noConstrain), 1);
            set(SCROLLING);
            emit(EVENT_SCROLL);
            interval.start();
        }
        function onEnd() {
            set(IDLE);
            callback && callback();
            emit(EVENT_SCROLLED);
        }
        function update(from, to, noConstrain, rate) {
            var position = getPosition();
            var target = from + (to - from) * easing(rate);
            var diff = (target - position) * friction;
            translate(position + diff);
            if (isSlide && !noConstrain && exceededLimit()) {
                friction *= FRICTION_FACTOR;
                if (abs(diff) < BOUNCE_DIFF_THRESHOLD) scroll(getLimit(exceededLimit(true)), BOUNCE_DURATION, false, callback, true);
            }
        }
        function clear() {
            if (interval) interval.cancel();
        }
        function cancel() {
            if (interval && !interval.isPaused()) {
                clear();
                onEnd();
            }
        }
        function easing(t) {
            var easingFunc = options.easingFunc;
            return easingFunc ? easingFunc(t) : 1 - Math.pow(1 - t, 4);
        }
        return {
            mount,
            destroy: clear,
            scroll,
            cancel
        };
    }
    var SCROLL_LISTENER_OPTIONS = {
        passive: false,
        capture: true
    };
    function Drag(Splide2, Components2, options) {
        var _EventInterface9 = EventInterface(Splide2), on = _EventInterface9.on, emit = _EventInterface9.emit, bind = _EventInterface9.bind, unbind = _EventInterface9.unbind;
        var state = Splide2.state;
        var Move = Components2.Move, Scroll = Components2.Scroll, Controller = Components2.Controller, track = Components2.Elements.track, reduce = Components2.Media.reduce;
        var _Components2$Directio2 = Components2.Direction, resolve = _Components2$Directio2.resolve, orient = _Components2$Directio2.orient;
        var getPosition = Move.getPosition, exceededLimit = Move.exceededLimit;
        var basePosition;
        var baseEvent;
        var prevBaseEvent;
        var isFree;
        var dragging;
        var exceeded = false;
        var clickPrevented;
        var disabled;
        var target;
        function mount() {
            bind(track, POINTER_MOVE_EVENTS, noop, SCROLL_LISTENER_OPTIONS);
            bind(track, POINTER_UP_EVENTS, noop, SCROLL_LISTENER_OPTIONS);
            bind(track, POINTER_DOWN_EVENTS, onPointerDown, SCROLL_LISTENER_OPTIONS);
            bind(track, "click", onClick, {
                capture: true
            });
            bind(track, "dragstart", prevent);
            on([ EVENT_MOUNTED, EVENT_UPDATED ], init);
        }
        function init() {
            var drag = options.drag;
            disable(!drag);
            isFree = drag === "free";
        }
        function onPointerDown(e) {
            clickPrevented = false;
            if (!disabled) {
                var isTouch = isTouchEvent(e);
                if (isDraggable(e.target) && (isTouch || !e.button)) if (!Controller.isBusy()) {
                    target = isTouch ? track : window;
                    dragging = state.is([ MOVING, SCROLLING ]);
                    prevBaseEvent = null;
                    bind(target, POINTER_MOVE_EVENTS, onPointerMove, SCROLL_LISTENER_OPTIONS);
                    bind(target, POINTER_UP_EVENTS, onPointerUp, SCROLL_LISTENER_OPTIONS);
                    Move.cancel();
                    Scroll.cancel();
                    save(e);
                } else prevent(e, true);
            }
        }
        function onPointerMove(e) {
            if (!state.is(DRAGGING)) {
                state.set(DRAGGING);
                emit(EVENT_DRAG);
            }
            if (e.cancelable) if (dragging) {
                Move.translate(basePosition + constrain(diffCoord(e)));
                var expired = diffTime(e) > LOG_INTERVAL;
                var hasExceeded = exceeded !== (exceeded = exceededLimit());
                if (expired || hasExceeded) save(e);
                clickPrevented = true;
                emit(EVENT_DRAGGING);
                prevent(e);
            } else if (isSliderDirection(e)) {
                dragging = shouldStart(e);
                prevent(e);
            }
        }
        function onPointerUp(e) {
            if (state.is(DRAGGING)) {
                state.set(IDLE);
                emit(EVENT_DRAGGED);
            }
            if (dragging) {
                move(e);
                prevent(e);
            }
            unbind(target, POINTER_MOVE_EVENTS, onPointerMove);
            unbind(target, POINTER_UP_EVENTS, onPointerUp);
            dragging = false;
        }
        function onClick(e) {
            if (!disabled && clickPrevented) prevent(e, true);
        }
        function save(e) {
            prevBaseEvent = baseEvent;
            baseEvent = e;
            basePosition = getPosition();
        }
        function move(e) {
            var velocity = computeVelocity(e);
            var destination = computeDestination(velocity);
            var rewind = options.rewind && options.rewindByDrag;
            reduce(false);
            if (isFree) Controller.scroll(destination, 0, options.snap); else if (Splide2.is(FADE)) Controller.go(orient(sign(velocity)) < 0 ? rewind ? "<" : "-" : rewind ? ">" : "+"); else if (Splide2.is(SLIDE) && exceeded && rewind) Controller.go(exceededLimit(true) ? ">" : "<"); else Controller.go(Controller.toDest(destination), true);
            reduce(true);
        }
        function shouldStart(e) {
            var thresholds = options.dragMinThreshold;
            var isObj = isObject(thresholds);
            var mouse = isObj && thresholds.mouse || 0;
            var touch = (isObj ? thresholds.touch : +thresholds) || 10;
            return abs(diffCoord(e)) > (isTouchEvent(e) ? touch : mouse);
        }
        function isSliderDirection(e) {
            return abs(diffCoord(e)) > abs(diffCoord(e, true));
        }
        function computeVelocity(e) {
            if (Splide2.is(LOOP) || !exceeded) {
                var time = diffTime(e);
                if (time && time < LOG_INTERVAL) return diffCoord(e) / time;
            }
            return 0;
        }
        function computeDestination(velocity) {
            return getPosition() + sign(velocity) * min(abs(velocity) * (options.flickPower || 600), isFree ? 1 / 0 : Components2.Layout.listSize() * (options.flickMaxPages || 1));
        }
        function diffCoord(e, orthogonal) {
            return coordOf(e, orthogonal) - coordOf(getBaseEvent(e), orthogonal);
        }
        function diffTime(e) {
            return timeOf(e) - timeOf(getBaseEvent(e));
        }
        function getBaseEvent(e) {
            return baseEvent === e && prevBaseEvent || baseEvent;
        }
        function coordOf(e, orthogonal) {
            return (isTouchEvent(e) ? e.changedTouches[0] : e)["page" + resolve(orthogonal ? "Y" : "X")];
        }
        function constrain(diff) {
            return diff / (exceeded && Splide2.is(SLIDE) ? FRICTION : 1);
        }
        function isDraggable(target2) {
            var noDrag = options.noDrag;
            return !matches(target2, "." + CLASS_PAGINATION_PAGE + ", ." + CLASS_ARROW) && (!noDrag || !matches(target2, noDrag));
        }
        function isTouchEvent(e) {
            return typeof TouchEvent !== "undefined" && e instanceof TouchEvent;
        }
        function isDragging() {
            return dragging;
        }
        function disable(value) {
            disabled = value;
        }
        return {
            mount,
            disable,
            isDragging
        };
    }
    var NORMALIZATION_MAP = {
        Spacebar: " ",
        Right: ARROW_RIGHT,
        Left: ARROW_LEFT,
        Up: ARROW_UP,
        Down: ARROW_DOWN
    };
    function normalizeKey(key) {
        key = isString(key) ? key : key.key;
        return NORMALIZATION_MAP[key] || key;
    }
    var KEYBOARD_EVENT = "keydown";
    function Keyboard(Splide2, Components2, options) {
        var _EventInterface10 = EventInterface(Splide2), on = _EventInterface10.on, bind = _EventInterface10.bind, unbind = _EventInterface10.unbind;
        var root = Splide2.root;
        var resolve = Components2.Direction.resolve;
        var target;
        var disabled;
        function mount() {
            init();
            on(EVENT_UPDATED, destroy);
            on(EVENT_UPDATED, init);
            on(EVENT_MOVE, onMove);
        }
        function init() {
            var keyboard = options.keyboard;
            if (keyboard) {
                target = keyboard === "global" ? window : root;
                bind(target, KEYBOARD_EVENT, onKeydown);
            }
        }
        function destroy() {
            unbind(target, KEYBOARD_EVENT);
        }
        function disable(value) {
            disabled = value;
        }
        function onMove() {
            var _disabled = disabled;
            disabled = true;
            nextTick((function() {
                disabled = _disabled;
            }));
        }
        function onKeydown(e) {
            if (!disabled) {
                var key = normalizeKey(e);
                if (key === resolve(ARROW_LEFT)) Splide2.go("<"); else if (key === resolve(ARROW_RIGHT)) Splide2.go(">");
            }
        }
        return {
            mount,
            destroy,
            disable
        };
    }
    var SRC_DATA_ATTRIBUTE = DATA_ATTRIBUTE + "-lazy";
    var SRCSET_DATA_ATTRIBUTE = SRC_DATA_ATTRIBUTE + "-srcset";
    var IMAGE_SELECTOR = "[" + SRC_DATA_ATTRIBUTE + "], [" + SRCSET_DATA_ATTRIBUTE + "]";
    function LazyLoad(Splide2, Components2, options) {
        var _EventInterface11 = EventInterface(Splide2), on = _EventInterface11.on, off = _EventInterface11.off, bind = _EventInterface11.bind, emit = _EventInterface11.emit;
        var isSequential = options.lazyLoad === "sequential";
        var events = [ EVENT_MOVED, EVENT_SCROLLED ];
        var entries = [];
        function mount() {
            if (options.lazyLoad) {
                init();
                on(EVENT_REFRESH, init);
            }
        }
        function init() {
            empty(entries);
            register();
            if (isSequential) loadNext(); else {
                off(events);
                on(events, check);
                check();
            }
        }
        function register() {
            Components2.Slides.forEach((function(Slide) {
                queryAll(Slide.slide, IMAGE_SELECTOR).forEach((function(img) {
                    var src = getAttribute(img, SRC_DATA_ATTRIBUTE);
                    var srcset = getAttribute(img, SRCSET_DATA_ATTRIBUTE);
                    if (src !== img.src || srcset !== img.srcset) {
                        var className = options.classes.spinner;
                        var parent = img.parentElement;
                        var spinner = child(parent, "." + className) || create("span", className, parent);
                        entries.push([ img, Slide, spinner ]);
                        img.src || display(img, "none");
                    }
                }));
            }));
        }
        function check() {
            entries = entries.filter((function(data) {
                var distance = options.perPage * ((options.preloadPages || 1) + 1) - 1;
                return data[1].isWithin(Splide2.index, distance) ? load(data) : true;
            }));
            entries.length || off(events);
        }
        function load(data) {
            var img = data[0];
            addClass(data[1].slide, CLASS_LOADING);
            bind(img, "load error", apply(onLoad, data));
            setAttribute(img, "src", getAttribute(img, SRC_DATA_ATTRIBUTE));
            setAttribute(img, "srcset", getAttribute(img, SRCSET_DATA_ATTRIBUTE));
            removeAttribute(img, SRC_DATA_ATTRIBUTE);
            removeAttribute(img, SRCSET_DATA_ATTRIBUTE);
        }
        function onLoad(data, e) {
            var img = data[0], Slide = data[1];
            removeClass(Slide.slide, CLASS_LOADING);
            if (e.type !== "error") {
                remove(data[2]);
                display(img, "");
                emit(EVENT_LAZYLOAD_LOADED, img, Slide);
                emit(EVENT_RESIZE);
            }
            isSequential && loadNext();
        }
        function loadNext() {
            entries.length && load(entries.shift());
        }
        return {
            mount,
            destroy: apply(empty, entries),
            check
        };
    }
    function Pagination(Splide2, Components2, options) {
        var event = EventInterface(Splide2);
        var on = event.on, emit = event.emit, bind = event.bind;
        var Slides = Components2.Slides, Elements = Components2.Elements, Controller = Components2.Controller;
        var hasFocus = Controller.hasFocus, getIndex = Controller.getIndex, go = Controller.go;
        var resolve = Components2.Direction.resolve;
        var placeholder = Elements.pagination;
        var items = [];
        var list;
        var paginationClasses;
        function mount() {
            destroy();
            on([ EVENT_UPDATED, EVENT_REFRESH, EVENT_END_INDEX_CHANGED ], mount);
            var enabled = options.pagination;
            placeholder && display(placeholder, enabled ? "" : "none");
            if (enabled) {
                on([ EVENT_MOVE, EVENT_SCROLL, EVENT_SCROLLED ], update);
                createPagination();
                update();
                emit(EVENT_PAGINATION_MOUNTED, {
                    list,
                    items
                }, getAt(Splide2.index));
            }
        }
        function destroy() {
            if (list) {
                remove(placeholder ? slice(list.children) : list);
                removeClass(list, paginationClasses);
                empty(items);
                list = null;
            }
            event.destroy();
        }
        function createPagination() {
            var length = Splide2.length;
            var classes = options.classes, i18n = options.i18n, perPage = options.perPage;
            var max = hasFocus() ? Controller.getEnd() + 1 : ceil(length / perPage);
            list = placeholder || create("ul", classes.pagination, Elements.track.parentElement);
            addClass(list, paginationClasses = CLASS_PAGINATION + "--" + getDirection());
            setAttribute(list, ROLE, "tablist");
            setAttribute(list, ARIA_LABEL, i18n.select);
            setAttribute(list, ARIA_ORIENTATION, getDirection() === TTB ? "vertical" : "");
            for (var i = 0; i < max; i++) {
                var li = create("li", null, list);
                var button = create("button", {
                    class: classes.page,
                    type: "button"
                }, li);
                var controls = Slides.getIn(i).map((function(Slide) {
                    return Slide.slide.id;
                }));
                var text = !hasFocus() && perPage > 1 ? i18n.pageX : i18n.slideX;
                bind(button, "click", apply(onClick, i));
                if (options.paginationKeyboard) bind(button, "keydown", apply(onKeydown, i));
                setAttribute(li, ROLE, "presentation");
                setAttribute(button, ROLE, "tab");
                setAttribute(button, ARIA_CONTROLS, controls.join(" "));
                setAttribute(button, ARIA_LABEL, format(text, i + 1));
                setAttribute(button, TAB_INDEX, -1);
                items.push({
                    li,
                    button,
                    page: i
                });
            }
        }
        function onClick(page) {
            go(">" + page, true);
        }
        function onKeydown(page, e) {
            var length = items.length;
            var key = normalizeKey(e);
            var dir = getDirection();
            var nextPage = -1;
            if (key === resolve(ARROW_RIGHT, false, dir)) nextPage = ++page % length; else if (key === resolve(ARROW_LEFT, false, dir)) nextPage = (--page + length) % length; else if (key === "Home") nextPage = 0; else if (key === "End") nextPage = length - 1;
            var item = items[nextPage];
            if (item) {
                splide_esm_focus(item.button);
                go(">" + nextPage);
                prevent(e, true);
            }
        }
        function getDirection() {
            return options.paginationDirection || options.direction;
        }
        function getAt(index) {
            return items[Controller.toPage(index)];
        }
        function update() {
            var prev = getAt(getIndex(true));
            var curr = getAt(getIndex());
            if (prev) {
                var button = prev.button;
                removeClass(button, CLASS_ACTIVE);
                removeAttribute(button, ARIA_SELECTED);
                setAttribute(button, TAB_INDEX, -1);
            }
            if (curr) {
                var _button = curr.button;
                addClass(_button, CLASS_ACTIVE);
                setAttribute(_button, ARIA_SELECTED, true);
                setAttribute(_button, TAB_INDEX, "");
            }
            emit(EVENT_PAGINATION_UPDATED, {
                list,
                items
            }, prev, curr);
        }
        return {
            items,
            mount,
            destroy,
            getAt,
            update
        };
    }
    var TRIGGER_KEYS = [ " ", "Enter" ];
    function Sync(Splide2, Components2, options) {
        var isNavigation = options.isNavigation, slideFocus = options.slideFocus;
        var events = [];
        function mount() {
            Splide2.splides.forEach((function(target) {
                if (!target.isParent) {
                    sync(Splide2, target.splide);
                    sync(target.splide, Splide2);
                }
            }));
            if (isNavigation) navigate();
        }
        function destroy() {
            events.forEach((function(event) {
                event.destroy();
            }));
            empty(events);
        }
        function remount() {
            destroy();
            mount();
        }
        function sync(splide, target) {
            var event = EventInterface(splide);
            event.on(EVENT_MOVE, (function(index, prev, dest) {
                target.go(target.is(LOOP) ? dest : index);
            }));
            events.push(event);
        }
        function navigate() {
            var event = EventInterface(Splide2);
            var on = event.on;
            on(EVENT_CLICK, onClick);
            on(EVENT_SLIDE_KEYDOWN, onKeydown);
            on([ EVENT_MOUNTED, EVENT_UPDATED ], update);
            events.push(event);
            event.emit(EVENT_NAVIGATION_MOUNTED, Splide2.splides);
        }
        function update() {
            setAttribute(Components2.Elements.list, ARIA_ORIENTATION, options.direction === TTB ? "vertical" : "");
        }
        function onClick(Slide) {
            Splide2.go(Slide.index);
        }
        function onKeydown(Slide, e) {
            if (includes(TRIGGER_KEYS, normalizeKey(e))) {
                onClick(Slide);
                prevent(e);
            }
        }
        return {
            setup: apply(Components2.Media.set, {
                slideFocus: isUndefined(slideFocus) ? isNavigation : slideFocus
            }, true),
            mount,
            destroy,
            remount
        };
    }
    function Wheel(Splide2, Components2, options) {
        var _EventInterface12 = EventInterface(Splide2), bind = _EventInterface12.bind;
        var lastTime = 0;
        function mount() {
            if (options.wheel) bind(Components2.Elements.track, "wheel", onWheel, SCROLL_LISTENER_OPTIONS);
        }
        function onWheel(e) {
            if (e.cancelable) {
                var deltaY = e.deltaY;
                var backwards = deltaY < 0;
                var timeStamp = timeOf(e);
                var _min = options.wheelMinThreshold || 0;
                var sleep = options.wheelSleep || 0;
                if (abs(deltaY) > _min && timeStamp - lastTime > sleep) {
                    Splide2.go(backwards ? "<" : ">");
                    lastTime = timeStamp;
                }
                shouldPrevent(backwards) && prevent(e);
            }
        }
        function shouldPrevent(backwards) {
            return !options.releaseWheel || Splide2.state.is(MOVING) || Components2.Controller.getAdjacent(backwards) !== -1;
        }
        return {
            mount
        };
    }
    var SR_REMOVAL_DELAY = 90;
    function Live(Splide2, Components2, options) {
        var _EventInterface13 = EventInterface(Splide2), on = _EventInterface13.on;
        var track = Components2.Elements.track;
        var enabled = options.live && !options.isNavigation;
        var sr = create("span", CLASS_SR);
        var interval = RequestInterval(SR_REMOVAL_DELAY, apply(toggle, false));
        function mount() {
            if (enabled) {
                disable(!Components2.Autoplay.isPaused());
                setAttribute(track, ARIA_ATOMIC, true);
                sr.textContent = "…";
                on(EVENT_AUTOPLAY_PLAY, apply(disable, true));
                on(EVENT_AUTOPLAY_PAUSE, apply(disable, false));
                on([ EVENT_MOVED, EVENT_SCROLLED ], apply(toggle, true));
            }
        }
        function toggle(active) {
            setAttribute(track, ARIA_BUSY, active);
            if (active) {
                append(track, sr);
                interval.start();
            } else {
                remove(sr);
                interval.cancel();
            }
        }
        function destroy() {
            removeAttribute(track, [ ARIA_LIVE, ARIA_ATOMIC, ARIA_BUSY ]);
            remove(sr);
        }
        function disable(disabled) {
            if (enabled) setAttribute(track, ARIA_LIVE, disabled ? "off" : "polite");
        }
        return {
            mount,
            disable,
            destroy
        };
    }
    var ComponentConstructors = Object.freeze({
        __proto__: null,
        Media,
        Direction,
        Elements,
        Slides,
        Layout,
        Clones,
        Move,
        Controller,
        Arrows,
        Autoplay,
        Cover,
        Scroll,
        Drag,
        Keyboard,
        LazyLoad,
        Pagination,
        Sync,
        Wheel,
        Live
    });
    var I18N = {
        prev: "Previous slide",
        next: "Next slide",
        first: "Go to first slide",
        last: "Go to last slide",
        slideX: "Go to slide %s",
        pageX: "Go to page %s",
        play: "Start autoplay",
        pause: "Pause autoplay",
        carousel: "carousel",
        slide: "slide",
        select: "Select a slide to show",
        slideLabel: "%s of %s"
    };
    var DEFAULTS = {
        type: "slide",
        role: "region",
        speed: 400,
        perPage: 1,
        cloneStatus: true,
        arrows: true,
        pagination: true,
        paginationKeyboard: true,
        interval: 5e3,
        pauseOnHover: true,
        pauseOnFocus: true,
        resetProgress: true,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        drag: true,
        direction: "ltr",
        trimSpace: true,
        focusableNodes: "a, button, textarea, input, select, iframe",
        live: true,
        classes: CLASSES,
        i18n: I18N,
        reducedMotion: {
            speed: 0,
            rewindSpeed: 0,
            autoplay: "pause"
        }
    };
    function Fade(Splide2, Components2, options) {
        var Slides = Components2.Slides;
        function mount() {
            EventInterface(Splide2).on([ EVENT_MOUNTED, EVENT_REFRESH ], init);
        }
        function init() {
            Slides.forEach((function(Slide) {
                Slide.style("transform", "translateX(-" + 100 * Slide.index + "%)");
            }));
        }
        function start(index, done) {
            Slides.style("transition", "opacity " + options.speed + "ms " + options.easing);
            nextTick(done);
        }
        return {
            mount,
            start,
            cancel: noop
        };
    }
    function Slide(Splide2, Components2, options) {
        var Move = Components2.Move, Controller = Components2.Controller, Scroll = Components2.Scroll;
        var list = Components2.Elements.list;
        var transition = apply(style, list, "transition");
        var endCallback;
        function mount() {
            EventInterface(Splide2).bind(list, "transitionend", (function(e) {
                if (e.target === list && endCallback) {
                    cancel();
                    endCallback();
                }
            }));
        }
        function start(index, done) {
            var destination = Move.toPosition(index, true);
            var position = Move.getPosition();
            var speed = getSpeed(index);
            if (abs(destination - position) >= 1 && speed >= 1) if (options.useScroll) Scroll.scroll(destination, speed, false, done); else {
                transition("transform " + speed + "ms " + options.easing);
                Move.translate(destination, true);
                endCallback = done;
            } else {
                Move.jump(index);
                done();
            }
        }
        function cancel() {
            transition("");
            Scroll.cancel();
        }
        function getSpeed(index) {
            var rewindSpeed = options.rewindSpeed;
            if (Splide2.is(SLIDE) && rewindSpeed) {
                var prev = Controller.getIndex(true);
                var end = Controller.getEnd();
                if (prev === 0 && index >= end || prev >= end && index === 0) return rewindSpeed;
            }
            return options.speed;
        }
        return {
            mount,
            start,
            cancel
        };
    }
    var _Splide = function() {
        function _Splide(target, options) {
            this.event = EventInterface();
            this.Components = {};
            this.state = State(CREATED);
            this.splides = [];
            this._o = {};
            this._E = {};
            var root = isString(target) ? query(document, target) : target;
            assert(root, root + " is invalid.");
            this.root = root;
            options = merge({
                label: getAttribute(root, ARIA_LABEL) || "",
                labelledby: getAttribute(root, ARIA_LABELLEDBY) || ""
            }, DEFAULTS, _Splide.defaults, options || {});
            try {
                merge(options, JSON.parse(getAttribute(root, DATA_ATTRIBUTE)));
            } catch (e) {
                assert(false, "Invalid JSON");
            }
            this._o = Object.create(merge({}, options));
        }
        var _proto = _Splide.prototype;
        _proto.mount = function mount(Extensions, Transition) {
            var _this = this;
            var state = this.state, Components2 = this.Components;
            assert(state.is([ CREATED, DESTROYED ]), "Already mounted!");
            state.set(CREATED);
            this._C = Components2;
            this._T = Transition || this._T || (this.is(FADE) ? Fade : Slide);
            this._E = Extensions || this._E;
            var Constructors = splide_esm_assign({}, ComponentConstructors, this._E, {
                Transition: this._T
            });
            forOwn(Constructors, (function(Component, key) {
                var component = Component(_this, Components2, _this._o);
                Components2[key] = component;
                component.setup && component.setup();
            }));
            forOwn(Components2, (function(component) {
                component.mount && component.mount();
            }));
            this.emit(EVENT_MOUNTED);
            addClass(this.root, CLASS_INITIALIZED);
            state.set(IDLE);
            this.emit(EVENT_READY);
            return this;
        };
        _proto.sync = function sync(splide) {
            this.splides.push({
                splide
            });
            splide.splides.push({
                splide: this,
                isParent: true
            });
            if (this.state.is(IDLE)) {
                this._C.Sync.remount();
                splide.Components.Sync.remount();
            }
            return this;
        };
        _proto.go = function go(control) {
            this._C.Controller.go(control);
            return this;
        };
        _proto.on = function on(events, callback) {
            this.event.on(events, callback);
            return this;
        };
        _proto.off = function off(events) {
            this.event.off(events);
            return this;
        };
        _proto.emit = function emit(event) {
            var _this$event;
            (_this$event = this.event).emit.apply(_this$event, [ event ].concat(slice(arguments, 1)));
            return this;
        };
        _proto.add = function add(slides, index) {
            this._C.Slides.add(slides, index);
            return this;
        };
        _proto.remove = function remove(matcher) {
            this._C.Slides.remove(matcher);
            return this;
        };
        _proto.is = function is(type) {
            return this._o.type === type;
        };
        _proto.refresh = function refresh() {
            this.emit(EVENT_REFRESH);
            return this;
        };
        _proto.destroy = function destroy(completely) {
            if (completely === void 0) completely = true;
            var event = this.event, state = this.state;
            if (state.is(CREATED)) EventInterface(this).on(EVENT_READY, this.destroy.bind(this, completely)); else {
                forOwn(this._C, (function(component) {
                    component.destroy && component.destroy(completely);
                }), true);
                event.emit(EVENT_DESTROY);
                event.destroy();
                completely && empty(this.splides);
                state.set(DESTROYED);
            }
            return this;
        };
        _createClass(_Splide, [ {
            key: "options",
            get: function get() {
                return this._o;
            },
            set: function set(options) {
                this._C.Media.set(options, true, true);
            }
        }, {
            key: "length",
            get: function get() {
                return this._C.Slides.getLength(true);
            }
        }, {
            key: "index",
            get: function get() {
                return this._C.Controller.getIndex();
            }
        } ]);
        return _Splide;
    }();
    var Splide = _Splide;
    Splide.defaults = {};
    Splide.STATES = STATES;
    var CLASS_RENDERED = "is-rendered";
    var RENDERER_DEFAULT_CONFIG = {
        listTag: "ul",
        slideTag: "li"
    };
    var Style = null && function() {
        function Style(id, options) {
            this.styles = {};
            this.id = id;
            this.options = options;
        }
        var _proto2 = Style.prototype;
        _proto2.rule = function rule(selector, prop, value, breakpoint) {
            breakpoint = breakpoint || "default";
            var selectors = this.styles[breakpoint] = this.styles[breakpoint] || {};
            var styles = selectors[selector] = selectors[selector] || {};
            styles[prop] = value;
        };
        _proto2.build = function build() {
            var _this2 = this;
            var css = "";
            if (this.styles.default) css += this.buildSelectors(this.styles.default);
            Object.keys(this.styles).sort((function(n, m) {
                return _this2.options.mediaQuery === "min" ? +n - +m : +m - +n;
            })).forEach((function(breakpoint) {
                if (breakpoint !== "default") {
                    css += "@media screen and (max-width: " + breakpoint + "px) {";
                    css += _this2.buildSelectors(_this2.styles[breakpoint]);
                    css += "}";
                }
            }));
            return css;
        };
        _proto2.buildSelectors = function buildSelectors(selectors) {
            var _this3 = this;
            var css = "";
            forOwn(selectors, (function(styles, selector) {
                selector = ("#" + _this3.id + " " + selector).trim();
                css += selector + " {";
                forOwn(styles, (function(value, prop) {
                    if (value || value === 0) css += prop + ": " + value + ";";
                }));
                css += "}";
            }));
            return css;
        };
        return Style;
    }();
    null && function() {
        function SplideRenderer(contents, options, config, defaults) {
            this.slides = [];
            this.options = {};
            this.breakpoints = [];
            merge(DEFAULTS, defaults || {});
            merge(merge(this.options, DEFAULTS), options || {});
            this.contents = contents;
            this.config = splide_esm_assign({}, RENDERER_DEFAULT_CONFIG, config || {});
            this.id = this.config.id || uniqueId("splide");
            this.Style = new Style(this.id, this.options);
            this.Direction = Direction(null, null, this.options);
            assert(this.contents.length, "Provide at least 1 content.");
            this.init();
        }
        SplideRenderer.clean = function clean(splide) {
            var _EventInterface14 = EventInterface(splide), on = _EventInterface14.on;
            var root = splide.root;
            var clones = queryAll(root, "." + CLASS_CLONE);
            on(EVENT_MOUNTED, (function() {
                remove(child(root, "style"));
            }));
            remove(clones);
        };
        var _proto3 = SplideRenderer.prototype;
        _proto3.init = function init() {
            this.parseBreakpoints();
            this.initSlides();
            this.registerRootStyles();
            this.registerTrackStyles();
            this.registerSlideStyles();
            this.registerListStyles();
        };
        _proto3.initSlides = function initSlides() {
            var _this4 = this;
            push(this.slides, this.contents.map((function(content, index) {
                content = isString(content) ? {
                    html: content
                } : content;
                content.styles = content.styles || {};
                content.attrs = content.attrs || {};
                _this4.cover(content);
                var classes = _this4.options.classes.slide + " " + (index === 0 ? CLASS_ACTIVE : "");
                splide_esm_assign(content.attrs, {
                    class: (classes + " " + (content.attrs.class || "")).trim(),
                    style: _this4.buildStyles(content.styles)
                });
                return content;
            })));
            if (this.isLoop()) this.generateClones(this.slides);
        };
        _proto3.registerRootStyles = function registerRootStyles() {
            var _this5 = this;
            this.breakpoints.forEach((function(_ref2) {
                var width = _ref2[0], options = _ref2[1];
                _this5.Style.rule(" ", "max-width", unit(options.width), width);
            }));
        };
        _proto3.registerTrackStyles = function registerTrackStyles() {
            var _this6 = this;
            var Style2 = this.Style;
            var selector = "." + CLASS_TRACK;
            this.breakpoints.forEach((function(_ref3) {
                var width = _ref3[0], options = _ref3[1];
                Style2.rule(selector, _this6.resolve("paddingLeft"), _this6.cssPadding(options, false), width);
                Style2.rule(selector, _this6.resolve("paddingRight"), _this6.cssPadding(options, true), width);
                Style2.rule(selector, "height", _this6.cssTrackHeight(options), width);
            }));
        };
        _proto3.registerListStyles = function registerListStyles() {
            var _this7 = this;
            var Style2 = this.Style;
            var selector = "." + CLASS_LIST;
            this.breakpoints.forEach((function(_ref4) {
                var width = _ref4[0], options = _ref4[1];
                Style2.rule(selector, "transform", _this7.buildTranslate(options), width);
                if (!_this7.cssSlideHeight(options)) Style2.rule(selector, "aspect-ratio", _this7.cssAspectRatio(options), width);
            }));
        };
        _proto3.registerSlideStyles = function registerSlideStyles() {
            var _this8 = this;
            var Style2 = this.Style;
            var selector = "." + CLASS_SLIDE;
            this.breakpoints.forEach((function(_ref5) {
                var width = _ref5[0], options = _ref5[1];
                Style2.rule(selector, "width", _this8.cssSlideWidth(options), width);
                Style2.rule(selector, "height", _this8.cssSlideHeight(options) || "100%", width);
                Style2.rule(selector, _this8.resolve("marginRight"), unit(options.gap) || "0px", width);
                Style2.rule(selector + " > img", "display", options.cover ? "none" : "inline", width);
            }));
        };
        _proto3.buildTranslate = function buildTranslate(options) {
            var _this$Direction = this.Direction, resolve = _this$Direction.resolve, orient = _this$Direction.orient;
            var values = [];
            values.push(this.cssOffsetClones(options));
            values.push(this.cssOffsetGaps(options));
            if (this.isCenter(options)) {
                values.push(this.buildCssValue(orient(-50), "%"));
                values.push.apply(values, this.cssOffsetCenter(options));
            }
            return values.filter(Boolean).map((function(value) {
                return "translate" + resolve("X") + "(" + value + ")";
            })).join(" ");
        };
        _proto3.cssOffsetClones = function cssOffsetClones(options) {
            var _this$Direction2 = this.Direction, resolve = _this$Direction2.resolve, orient = _this$Direction2.orient;
            var cloneCount = this.getCloneCount();
            if (this.isFixedWidth(options)) {
                var _this$parseCssValue = this.parseCssValue(options[resolve("fixedWidth")]), value = _this$parseCssValue.value, unit2 = _this$parseCssValue.unit;
                return this.buildCssValue(orient(value) * cloneCount, unit2);
            }
            var percent = 100 * cloneCount / options.perPage;
            return orient(percent) + "%";
        };
        _proto3.cssOffsetCenter = function cssOffsetCenter(options) {
            var _this$Direction3 = this.Direction, resolve = _this$Direction3.resolve, orient = _this$Direction3.orient;
            if (this.isFixedWidth(options)) {
                var _this$parseCssValue2 = this.parseCssValue(options[resolve("fixedWidth")]), value = _this$parseCssValue2.value, unit2 = _this$parseCssValue2.unit;
                return [ this.buildCssValue(orient(value / 2), unit2) ];
            }
            var values = [];
            var perPage = options.perPage, gap = options.gap;
            values.push(orient(50 / perPage) + "%");
            if (gap) {
                var _this$parseCssValue3 = this.parseCssValue(gap), _value = _this$parseCssValue3.value, _unit = _this$parseCssValue3.unit;
                var gapOffset = (_value / perPage - _value) / 2;
                values.push(this.buildCssValue(orient(gapOffset), _unit));
            }
            return values;
        };
        _proto3.cssOffsetGaps = function cssOffsetGaps(options) {
            var cloneCount = this.getCloneCount();
            if (cloneCount && options.gap) {
                var orient = this.Direction.orient;
                var _this$parseCssValue4 = this.parseCssValue(options.gap), value = _this$parseCssValue4.value, unit2 = _this$parseCssValue4.unit;
                if (this.isFixedWidth(options)) return this.buildCssValue(orient(value * cloneCount), unit2);
                var perPage = options.perPage;
                var gaps = cloneCount / perPage;
                return this.buildCssValue(orient(gaps * value), unit2);
            }
            return "";
        };
        _proto3.resolve = function resolve(prop) {
            return camelToKebab(this.Direction.resolve(prop));
        };
        _proto3.cssPadding = function cssPadding(options, right) {
            var padding = options.padding;
            var prop = this.Direction.resolve(right ? "right" : "left", true);
            return padding && unit(padding[prop] || (isObject(padding) ? 0 : padding)) || "0px";
        };
        _proto3.cssTrackHeight = function cssTrackHeight(options) {
            var height = "";
            if (this.isVertical()) {
                height = this.cssHeight(options);
                assert(height, '"height" is missing.');
                height = "calc(" + height + " - " + this.cssPadding(options, false) + " - " + this.cssPadding(options, true) + ")";
            }
            return height;
        };
        _proto3.cssHeight = function cssHeight(options) {
            return unit(options.height);
        };
        _proto3.cssSlideWidth = function cssSlideWidth(options) {
            return options.autoWidth ? "" : unit(options.fixedWidth) || (this.isVertical() ? "" : this.cssSlideSize(options));
        };
        _proto3.cssSlideHeight = function cssSlideHeight(options) {
            return unit(options.fixedHeight) || (this.isVertical() ? options.autoHeight ? "" : this.cssSlideSize(options) : this.cssHeight(options));
        };
        _proto3.cssSlideSize = function cssSlideSize(options) {
            var gap = unit(options.gap);
            return "calc((100%" + (gap && " + " + gap) + ")/" + (options.perPage || 1) + (gap && " - " + gap) + ")";
        };
        _proto3.cssAspectRatio = function cssAspectRatio(options) {
            var heightRatio = options.heightRatio;
            return heightRatio ? "" + 1 / heightRatio : "";
        };
        _proto3.buildCssValue = function buildCssValue(value, unit2) {
            return "" + value + unit2;
        };
        _proto3.parseCssValue = function parseCssValue(value) {
            if (isString(value)) {
                var number = parseFloat(value) || 0;
                var unit2 = value.replace(/\d*(\.\d*)?/, "") || "px";
                return {
                    value: number,
                    unit: unit2
                };
            }
            return {
                value,
                unit: "px"
            };
        };
        _proto3.parseBreakpoints = function parseBreakpoints() {
            var _this9 = this;
            var breakpoints = this.options.breakpoints;
            this.breakpoints.push([ "default", this.options ]);
            if (breakpoints) forOwn(breakpoints, (function(options, width) {
                _this9.breakpoints.push([ width, merge(merge({}, _this9.options), options) ]);
            }));
        };
        _proto3.isFixedWidth = function isFixedWidth(options) {
            return !!options[this.Direction.resolve("fixedWidth")];
        };
        _proto3.isLoop = function isLoop() {
            return this.options.type === LOOP;
        };
        _proto3.isCenter = function isCenter(options) {
            if (options.focus === "center") {
                if (this.isLoop()) return true;
                if (this.options.type === SLIDE) return !this.options.trimSpace;
            }
            return false;
        };
        _proto3.isVertical = function isVertical() {
            return this.options.direction === TTB;
        };
        _proto3.buildClasses = function buildClasses() {
            var options = this.options;
            return [ CLASS_ROOT, CLASS_ROOT + "--" + options.type, CLASS_ROOT + "--" + options.direction, options.drag && CLASS_ROOT + "--draggable", options.isNavigation && CLASS_ROOT + "--nav", CLASS_ACTIVE, !this.config.hidden && CLASS_RENDERED ].filter(Boolean).join(" ");
        };
        _proto3.buildAttrs = function buildAttrs(attrs) {
            var attr = "";
            forOwn(attrs, (function(value, key) {
                attr += value ? " " + camelToKebab(key) + '="' + value + '"' : "";
            }));
            return attr.trim();
        };
        _proto3.buildStyles = function buildStyles(styles) {
            var style = "";
            forOwn(styles, (function(value, key) {
                style += " " + camelToKebab(key) + ":" + value + ";";
            }));
            return style.trim();
        };
        _proto3.renderSlides = function renderSlides() {
            var _this10 = this;
            var tag = this.config.slideTag;
            return this.slides.map((function(content) {
                return "<" + tag + " " + _this10.buildAttrs(content.attrs) + ">" + (content.html || "") + "</" + tag + ">";
            })).join("");
        };
        _proto3.cover = function cover(content) {
            var styles = content.styles, _content$html = content.html, html = _content$html === void 0 ? "" : _content$html;
            if (this.options.cover && !this.options.lazyLoad) {
                var src = html.match(/<img.*?src\s*=\s*(['"])(.+?)\1.*?>/);
                if (src && src[2]) styles.background = "center/cover no-repeat url('" + src[2] + "')";
            }
        };
        _proto3.generateClones = function generateClones(contents) {
            var classes = this.options.classes;
            var count = this.getCloneCount();
            var slides = contents.slice();
            while (slides.length < count) push(slides, slides);
            push(slides.slice(-count).reverse(), slides.slice(0, count)).forEach((function(content, index) {
                var attrs = splide_esm_assign({}, content.attrs, {
                    class: content.attrs.class + " " + classes.clone
                });
                var clone = splide_esm_assign({}, content, {
                    attrs
                });
                index < count ? contents.unshift(clone) : contents.push(clone);
            }));
        };
        _proto3.getCloneCount = function getCloneCount() {
            if (this.isLoop()) {
                var options = this.options;
                if (options.clones) return options.clones;
                var perPage = max.apply(void 0, this.breakpoints.map((function(_ref6) {
                    var options2 = _ref6[1];
                    return options2.perPage;
                })));
                return perPage * ((options.flickMaxPages || 1) + 1);
            }
            return 0;
        };
        _proto3.renderArrows = function renderArrows() {
            var html = "";
            html += '<div class="' + this.options.classes.arrows + '">';
            html += this.renderArrow(true);
            html += this.renderArrow(false);
            html += "</div>";
            return html;
        };
        _proto3.renderArrow = function renderArrow(prev) {
            var _this$options = this.options, classes = _this$options.classes, i18n = _this$options.i18n;
            var attrs = {
                class: classes.arrow + " " + (prev ? classes.prev : classes.next),
                type: "button",
                ariaLabel: prev ? i18n.prev : i18n.next
            };
            return "<button " + this.buildAttrs(attrs) + '><svg xmlns="' + XML_NAME_SPACE + '" viewBox="0 0 ' + SIZE + " " + SIZE + '" width="' + SIZE + '" height="' + SIZE + '"><path d="' + (this.options.arrowPath || PATH) + '" /></svg></button>';
        };
        _proto3.html = function html() {
            var _this$config = this.config, rootClass = _this$config.rootClass, listTag = _this$config.listTag, arrows = _this$config.arrows, beforeTrack = _this$config.beforeTrack, afterTrack = _this$config.afterTrack, slider = _this$config.slider, beforeSlider = _this$config.beforeSlider, afterSlider = _this$config.afterSlider;
            var html = "";
            html += '<div id="' + this.id + '" class="' + this.buildClasses() + " " + (rootClass || "") + '">';
            html += "<style>" + this.Style.build() + "</style>";
            if (slider) {
                html += beforeSlider || "";
                html += '<div class="splide__slider">';
            }
            html += beforeTrack || "";
            if (arrows) html += this.renderArrows();
            html += '<div class="splide__track">';
            html += "<" + listTag + ' class="splide__list">';
            html += this.renderSlides();
            html += "</" + listTag + ">";
            html += "</div>";
            html += afterTrack || "";
            if (slider) {
                html += "</div>";
                html += afterSlider || "";
            }
            html += "</div>";
            return html;
        };
    }();
    const projectSlider = document.getElementById("splide-project");
    if (projectSlider) {
        var splideProject = new Splide("#splide-project", {
            pagination: true,
            speed: 800,
            rewind: true,
            autoHeight: true,
            autoplay: true,
            interval: 6e3,
            pauseOnHover: true,
            classes: {
                pagination: "splide__pagination splide__pagination",
                page: "splide__pagination-page splide__pagination-page"
            }
        });
        splideProject.mount();
    }
    let addWindowScrollEvent = false;
    function pageNavigation() {
        document.addEventListener("click", pageNavigationAction);
        document.addEventListener("watcherCallback", pageNavigationAction);
        function pageNavigationAction(e) {
            if (e.type === "click") {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    if (modules_flsModules.fullpage) {
                        const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fp-section]");
                        const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.fpId : null;
                        if (fullpageSectionId !== null) {
                            modules_flsModules.fullpage.switchingSection(fullpageSectionId);
                            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
                        }
                    } else gotoblock_gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if (e.type === "watcherCallback" && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                if (targetElement.dataset.watch === "navigator") {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null; else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoblock_gotoBlock(goToHash, true, 500, 20) : null;
        }
    }
    function headerScroll() {
        addWindowScrollEvent = true;
        const header = document.querySelector("header.header");
        const headerShow = header.hasAttribute("data-scroll-show");
        const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
        const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
        let scrollDirection = 0;
        let timer;
        document.addEventListener("windowScroll", (function(e) {
            const scrollTop = window.scrollY;
            clearTimeout(timer);
            if (scrollTop >= startPoint) {
                !header.classList.contains("_header-scroll") ? header.classList.add("_header-scroll") : null;
                if (headerShow) {
                    if (scrollTop > scrollDirection) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null; else !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    timer = setTimeout((() => {
                        !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    }), headerShowTimer);
                }
            } else {
                header.classList.contains("_header-scroll") ? header.classList.remove("_header-scroll") : null;
                if (headerShow) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
            }
            scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
        }));
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    /*!
 * lightgallery | 2.7.2 | September 20th 2023
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
    /*! *****************************************************************************
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
    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        var r = Array(s), k = 0;
        for (i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
        k++) r[k] = a[j];
        return r;
    }
    var lGEvents = {
        afterAppendSlide: "lgAfterAppendSlide",
        init: "lgInit",
        hasVideo: "lgHasVideo",
        containerResize: "lgContainerResize",
        updateSlides: "lgUpdateSlides",
        afterAppendSubHtml: "lgAfterAppendSubHtml",
        beforeOpen: "lgBeforeOpen",
        afterOpen: "lgAfterOpen",
        slideItemLoad: "lgSlideItemLoad",
        beforeSlide: "lgBeforeSlide",
        afterSlide: "lgAfterSlide",
        posterClick: "lgPosterClick",
        dragStart: "lgDragStart",
        dragMove: "lgDragMove",
        dragEnd: "lgDragEnd",
        beforeNextSlide: "lgBeforeNextSlide",
        beforePrevSlide: "lgBeforePrevSlide",
        beforeClose: "lgBeforeClose",
        afterClose: "lgAfterClose",
        rotateLeft: "lgRotateLeft",
        rotateRight: "lgRotateRight",
        flipHorizontal: "lgFlipHorizontal",
        flipVertical: "lgFlipVertical",
        autoplay: "lgAutoplay",
        autoplayStart: "lgAutoplayStart",
        autoplayStop: "lgAutoplayStop"
    };
    var lightGalleryCoreSettings = {
        mode: "lg-slide",
        easing: "ease",
        speed: 400,
        licenseKey: "0000-0000-000-0000",
        height: "100%",
        width: "100%",
        addClass: "",
        startClass: "lg-start-zoom",
        backdropDuration: 300,
        container: "",
        startAnimationDuration: 400,
        zoomFromOrigin: true,
        hideBarsDelay: 0,
        showBarsAfter: 1e4,
        slideDelay: 0,
        supportLegacyBrowser: true,
        allowMediaOverlap: false,
        videoMaxSize: "1280-720",
        loadYouTubePoster: true,
        defaultCaptionHeight: 0,
        ariaLabelledby: "",
        ariaDescribedby: "",
        resetScrollPosition: true,
        hideScrollbar: false,
        closable: true,
        swipeToClose: true,
        closeOnTap: true,
        showCloseIcon: true,
        showMaximizeIcon: false,
        loop: true,
        escKey: true,
        keyPress: true,
        trapFocus: true,
        controls: true,
        slideEndAnimation: true,
        hideControlOnEnd: false,
        mousewheel: false,
        getCaptionFromTitleOrAlt: true,
        appendSubHtmlTo: ".lg-sub-html",
        subHtmlSelectorRelative: false,
        preload: 2,
        numberOfSlideItemsInDom: 10,
        selector: "",
        selectWithin: "",
        nextHtml: "",
        prevHtml: "",
        index: 0,
        iframeWidth: "100%",
        iframeHeight: "100%",
        iframeMaxWidth: "100%",
        iframeMaxHeight: "100%",
        download: true,
        counter: true,
        appendCounterTo: ".lg-toolbar",
        swipeThreshold: 50,
        enableSwipe: true,
        enableDrag: true,
        dynamic: false,
        dynamicEl: [],
        extraProps: [],
        exThumbImage: "",
        isMobile: void 0,
        mobileSettings: {
            controls: false,
            showCloseIcon: false,
            download: false
        },
        plugins: [],
        strings: {
            closeGallery: "Close gallery",
            toggleMaximize: "Toggle maximize",
            previousSlide: "Previous slide",
            nextSlide: "Next slide",
            download: "Download",
            playVideo: "Play video",
            mediaLoadingFailed: "Oops... Failed to load content..."
        }
    };
    function initLgPolyfills() {
        (function() {
            if (typeof window.CustomEvent === "function") return false;
            function CustomEvent(event, params) {
                params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: null
                };
                var evt = document.createEvent("CustomEvent");
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }
            window.CustomEvent = CustomEvent;
        })();
        (function() {
            if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
        })();
    }
    var lgQuery = function() {
        function lgQuery(selector) {
            this.cssVenderPrefixes = [ "TransitionDuration", "TransitionTimingFunction", "Transform", "Transition" ];
            this.selector = this._getSelector(selector);
            this.firstElement = this._getFirstEl();
            return this;
        }
        lgQuery.generateUUID = function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function(c) {
                var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
                return v.toString(16);
            }));
        };
        lgQuery.prototype._getSelector = function(selector, context) {
            if (context === void 0) context = document;
            if (typeof selector !== "string") return selector;
            context = context || document;
            var fl = selector.substring(0, 1);
            if (fl === "#") return context.querySelector(selector); else return context.querySelectorAll(selector);
        };
        lgQuery.prototype._each = function(func) {
            if (!this.selector) return this;
            if (this.selector.length !== void 0) [].forEach.call(this.selector, func); else func(this.selector, 0);
            return this;
        };
        lgQuery.prototype._setCssVendorPrefix = function(el, cssProperty, value) {
            var property = cssProperty.replace(/-([a-z])/gi, (function(s, group1) {
                return group1.toUpperCase();
            }));
            if (this.cssVenderPrefixes.indexOf(property) !== -1) {
                el.style[property.charAt(0).toLowerCase() + property.slice(1)] = value;
                el.style["webkit" + property] = value;
                el.style["moz" + property] = value;
                el.style["ms" + property] = value;
                el.style["o" + property] = value;
            } else el.style[property] = value;
        };
        lgQuery.prototype._getFirstEl = function() {
            if (this.selector && this.selector.length !== void 0) return this.selector[0]; else return this.selector;
        };
        lgQuery.prototype.isEventMatched = function(event, eventName) {
            var eventNamespace = eventName.split(".");
            return event.split(".").filter((function(e) {
                return e;
            })).every((function(e) {
                return eventNamespace.indexOf(e) !== -1;
            }));
        };
        lgQuery.prototype.attr = function(attr, value) {
            if (value === void 0) {
                if (!this.firstElement) return "";
                return this.firstElement.getAttribute(attr);
            }
            this._each((function(el) {
                el.setAttribute(attr, value);
            }));
            return this;
        };
        lgQuery.prototype.find = function(selector) {
            return $LG(this._getSelector(selector, this.selector));
        };
        lgQuery.prototype.first = function() {
            if (this.selector && this.selector.length !== void 0) return $LG(this.selector[0]); else return $LG(this.selector);
        };
        lgQuery.prototype.eq = function(index) {
            return $LG(this.selector[index]);
        };
        lgQuery.prototype.parent = function() {
            return $LG(this.selector.parentElement);
        };
        lgQuery.prototype.get = function() {
            return this._getFirstEl();
        };
        lgQuery.prototype.removeAttr = function(attributes) {
            var attrs = attributes.split(" ");
            this._each((function(el) {
                attrs.forEach((function(attr) {
                    return el.removeAttribute(attr);
                }));
            }));
            return this;
        };
        lgQuery.prototype.wrap = function(className) {
            if (!this.firstElement) return this;
            var wrapper = document.createElement("div");
            wrapper.className = className;
            this.firstElement.parentNode.insertBefore(wrapper, this.firstElement);
            this.firstElement.parentNode.removeChild(this.firstElement);
            wrapper.appendChild(this.firstElement);
            return this;
        };
        lgQuery.prototype.addClass = function(classNames) {
            if (classNames === void 0) classNames = "";
            this._each((function(el) {
                classNames.split(" ").forEach((function(className) {
                    if (className) el.classList.add(className);
                }));
            }));
            return this;
        };
        lgQuery.prototype.removeClass = function(classNames) {
            this._each((function(el) {
                classNames.split(" ").forEach((function(className) {
                    if (className) el.classList.remove(className);
                }));
            }));
            return this;
        };
        lgQuery.prototype.hasClass = function(className) {
            if (!this.firstElement) return false;
            return this.firstElement.classList.contains(className);
        };
        lgQuery.prototype.hasAttribute = function(attribute) {
            if (!this.firstElement) return false;
            return this.firstElement.hasAttribute(attribute);
        };
        lgQuery.prototype.toggleClass = function(className) {
            if (!this.firstElement) return this;
            if (this.hasClass(className)) this.removeClass(className); else this.addClass(className);
            return this;
        };
        lgQuery.prototype.css = function(property, value) {
            var _this = this;
            this._each((function(el) {
                _this._setCssVendorPrefix(el, property, value);
            }));
            return this;
        };
        lgQuery.prototype.on = function(events, listener) {
            var _this = this;
            if (!this.selector) return this;
            events.split(" ").forEach((function(event) {
                if (!Array.isArray(lgQuery.eventListeners[event])) lgQuery.eventListeners[event] = [];
                lgQuery.eventListeners[event].push(listener);
                _this.selector.addEventListener(event.split(".")[0], listener);
            }));
            return this;
        };
        lgQuery.prototype.once = function(event, listener) {
            var _this = this;
            this.on(event, (function() {
                _this.off(event);
                listener(event);
            }));
            return this;
        };
        lgQuery.prototype.off = function(event) {
            var _this = this;
            if (!this.selector) return this;
            Object.keys(lgQuery.eventListeners).forEach((function(eventName) {
                if (_this.isEventMatched(event, eventName)) {
                    lgQuery.eventListeners[eventName].forEach((function(listener) {
                        _this.selector.removeEventListener(eventName.split(".")[0], listener);
                    }));
                    lgQuery.eventListeners[eventName] = [];
                }
            }));
            return this;
        };
        lgQuery.prototype.trigger = function(event, detail) {
            if (!this.firstElement) return this;
            var customEvent = new CustomEvent(event.split(".")[0], {
                detail: detail || null
            });
            this.firstElement.dispatchEvent(customEvent);
            return this;
        };
        lgQuery.prototype.load = function(url) {
            var _this = this;
            fetch(url).then((function(res) {
                return res.text();
            })).then((function(html) {
                _this.selector.innerHTML = html;
            }));
            return this;
        };
        lgQuery.prototype.html = function(html) {
            if (html === void 0) {
                if (!this.firstElement) return "";
                return this.firstElement.innerHTML;
            }
            this._each((function(el) {
                el.innerHTML = html;
            }));
            return this;
        };
        lgQuery.prototype.append = function(html) {
            this._each((function(el) {
                if (typeof html === "string") el.insertAdjacentHTML("beforeend", html); else el.appendChild(html);
            }));
            return this;
        };
        lgQuery.prototype.prepend = function(html) {
            this._each((function(el) {
                el.insertAdjacentHTML("afterbegin", html);
            }));
            return this;
        };
        lgQuery.prototype.remove = function() {
            this._each((function(el) {
                el.parentNode.removeChild(el);
            }));
            return this;
        };
        lgQuery.prototype.empty = function() {
            this._each((function(el) {
                el.innerHTML = "";
            }));
            return this;
        };
        lgQuery.prototype.scrollTop = function(scrollTop) {
            if (scrollTop !== void 0) {
                document.body.scrollTop = scrollTop;
                document.documentElement.scrollTop = scrollTop;
                return this;
            } else return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        };
        lgQuery.prototype.scrollLeft = function(scrollLeft) {
            if (scrollLeft !== void 0) {
                document.body.scrollLeft = scrollLeft;
                document.documentElement.scrollLeft = scrollLeft;
                return this;
            } else return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        };
        lgQuery.prototype.offset = function() {
            if (!this.firstElement) return {
                left: 0,
                top: 0
            };
            var rect = this.firstElement.getBoundingClientRect();
            var bodyMarginLeft = $LG("body").style().marginLeft;
            return {
                left: rect.left - parseFloat(bodyMarginLeft) + this.scrollLeft(),
                top: rect.top + this.scrollTop()
            };
        };
        lgQuery.prototype.style = function() {
            if (!this.firstElement) return {};
            return this.firstElement.currentStyle || window.getComputedStyle(this.firstElement);
        };
        lgQuery.prototype.width = function() {
            var style = this.style();
            return this.firstElement.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        };
        lgQuery.prototype.height = function() {
            var style = this.style();
            return this.firstElement.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        };
        lgQuery.eventListeners = {};
        return lgQuery;
    }();
    function $LG(selector) {
        initLgPolyfills();
        return new lgQuery(selector);
    }
    var defaultDynamicOptions = [ "src", "sources", "subHtml", "subHtmlUrl", "html", "video", "poster", "slideName", "responsive", "srcset", "sizes", "iframe", "downloadUrl", "download", "width", "facebookShareUrl", "tweetText", "iframeTitle", "twitterShareUrl", "pinterestShareUrl", "pinterestText", "fbHtml", "disqusIdentifier", "disqusUrl" ];
    function convertToData(attr) {
        if (attr === "href") return "src";
        attr = attr.replace("data-", "");
        attr = attr.charAt(0).toLowerCase() + attr.slice(1);
        attr = attr.replace(/-([a-z])/g, (function(g) {
            return g[1].toUpperCase();
        }));
        return attr;
    }
    var utils = {
        getSize: function(el, container, spacing, defaultLgSize) {
            if (spacing === void 0) spacing = 0;
            var LGel = $LG(el);
            var lgSize = LGel.attr("data-lg-size") || defaultLgSize;
            if (!lgSize) return;
            var isResponsiveSizes = lgSize.split(",");
            if (isResponsiveSizes[1]) {
                var wWidth = window.innerWidth;
                for (var i = 0; i < isResponsiveSizes.length; i++) {
                    var size_1 = isResponsiveSizes[i];
                    var responsiveWidth = parseInt(size_1.split("-")[2], 10);
                    if (responsiveWidth > wWidth) {
                        lgSize = size_1;
                        break;
                    }
                    if (i === isResponsiveSizes.length - 1) lgSize = size_1;
                }
            }
            var size = lgSize.split("-");
            var width = parseInt(size[0], 10);
            var height = parseInt(size[1], 10);
            var cWidth = container.width();
            var cHeight = container.height() - spacing;
            var maxWidth = Math.min(cWidth, width);
            var maxHeight = Math.min(cHeight, height);
            var ratio = Math.min(maxWidth / width, maxHeight / height);
            return {
                width: width * ratio,
                height: height * ratio
            };
        },
        getTransform: function(el, container, top, bottom, imageSize) {
            if (!imageSize) return;
            var LGel = $LG(el).find("img").first();
            if (!LGel.get()) return;
            var containerRect = container.get().getBoundingClientRect();
            var wWidth = containerRect.width;
            var wHeight = container.height() - (top + bottom);
            var elWidth = LGel.width();
            var elHeight = LGel.height();
            var elStyle = LGel.style();
            var x = (wWidth - elWidth) / 2 - LGel.offset().left + (parseFloat(elStyle.paddingLeft) || 0) + (parseFloat(elStyle.borderLeft) || 0) + $LG(window).scrollLeft() + containerRect.left;
            var y = (wHeight - elHeight) / 2 - LGel.offset().top + (parseFloat(elStyle.paddingTop) || 0) + (parseFloat(elStyle.borderTop) || 0) + $LG(window).scrollTop() + top;
            var scX = elWidth / imageSize.width;
            var scY = elHeight / imageSize.height;
            var transform = "translate3d(" + (x *= -1) + "px, " + (y *= -1) + "px, 0) scale3d(" + scX + ", " + scY + ", 1)";
            return transform;
        },
        getIframeMarkup: function(iframeWidth, iframeHeight, iframeMaxWidth, iframeMaxHeight, src, iframeTitle) {
            var title = iframeTitle ? 'title="' + iframeTitle + '"' : "";
            return '<div class="lg-video-cont lg-has-iframe" style="width:' + iframeWidth + "; max-width:" + iframeMaxWidth + "; height: " + iframeHeight + "; max-height:" + iframeMaxHeight + '">\n                    <iframe class="lg-object" frameborder="0" ' + title + ' src="' + src + '"  allowfullscreen="true"></iframe>\n                </div>';
        },
        getImgMarkup: function(index, src, altAttr, srcset, sizes, sources) {
            var srcsetAttr = srcset ? 'srcset="' + srcset + '"' : "";
            var sizesAttr = sizes ? 'sizes="' + sizes + '"' : "";
            var imgMarkup = "<img " + altAttr + " " + srcsetAttr + "  " + sizesAttr + ' class="lg-object lg-image" data-index="' + index + '" src="' + src + '" />';
            var sourceTag = "";
            if (sources) {
                var sourceObj = typeof sources === "string" ? JSON.parse(sources) : sources;
                sourceTag = sourceObj.map((function(source) {
                    var attrs = "";
                    Object.keys(source).forEach((function(key) {
                        attrs += " " + key + '="' + source[key] + '"';
                    }));
                    return "<source " + attrs + "></source>";
                }));
            }
            return "" + sourceTag + imgMarkup;
        },
        getResponsiveSrc: function(srcItms) {
            var rsWidth = [];
            var rsSrc = [];
            var src = "";
            for (var i = 0; i < srcItms.length; i++) {
                var _src = srcItms[i].split(" ");
                if (_src[0] === "") _src.splice(0, 1);
                rsSrc.push(_src[0]);
                rsWidth.push(_src[1]);
            }
            var wWidth = window.innerWidth;
            for (var j = 0; j < rsWidth.length; j++) if (parseInt(rsWidth[j], 10) > wWidth) {
                src = rsSrc[j];
                break;
            }
            return src;
        },
        isImageLoaded: function(img) {
            if (!img) return false;
            if (!img.complete) return false;
            if (img.naturalWidth === 0) return false;
            return true;
        },
        getVideoPosterMarkup: function(_poster, dummyImg, videoContStyle, playVideoString, _isVideo) {
            var videoClass = "";
            if (_isVideo && _isVideo.youtube) videoClass = "lg-has-youtube"; else if (_isVideo && _isVideo.vimeo) videoClass = "lg-has-vimeo"; else videoClass = "lg-has-html5";
            return '<div class="lg-video-cont ' + videoClass + '" style="' + videoContStyle + '">\n                <div class="lg-video-play-button">\n                <svg\n                    viewBox="0 0 20 20"\n                    preserveAspectRatio="xMidYMid"\n                    focusable="false"\n                    aria-labelledby="' + playVideoString + '"\n                    role="img"\n                    class="lg-video-play-icon"\n                >\n                    <title>' + playVideoString + '</title>\n                    <polygon class="lg-video-play-icon-inner" points="1,0 20,10 1,20"></polygon>\n                </svg>\n                <svg class="lg-video-play-icon-bg" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle></svg>\n                <svg class="lg-video-play-icon-circle" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle>\n                </svg>\n            </div>\n            ' + (dummyImg || "") + '\n            <img class="lg-object lg-video-poster" src="' + _poster + '" />\n        </div>';
        },
        getFocusableElements: function(container) {
            var elements = container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
            var visibleElements = [].filter.call(elements, (function(element) {
                var style = window.getComputedStyle(element);
                return style.display !== "none" && style.visibility !== "hidden";
            }));
            return visibleElements;
        },
        getDynamicOptions: function(items, extraProps, getCaptionFromTitleOrAlt, exThumbImage) {
            var dynamicElements = [];
            var availableDynamicOptions = __spreadArrays(defaultDynamicOptions, extraProps);
            [].forEach.call(items, (function(item) {
                var dynamicEl = {};
                for (var i = 0; i < item.attributes.length; i++) {
                    var attr = item.attributes[i];
                    if (attr.specified) {
                        var dynamicAttr = convertToData(attr.name);
                        var label = "";
                        if (availableDynamicOptions.indexOf(dynamicAttr) > -1) label = dynamicAttr;
                        if (label) dynamicEl[label] = attr.value;
                    }
                }
                var currentItem = $LG(item);
                var alt = currentItem.find("img").first().attr("alt");
                var title = currentItem.attr("title");
                var thumb = exThumbImage ? currentItem.attr(exThumbImage) : currentItem.find("img").first().attr("src");
                dynamicEl.thumb = thumb;
                if (getCaptionFromTitleOrAlt && !dynamicEl.subHtml) dynamicEl.subHtml = title || alt || "";
                dynamicEl.alt = alt || title || "";
                dynamicElements.push(dynamicEl);
            }));
            return dynamicElements;
        },
        isMobile: function() {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        },
        isVideo: function(src, isHTML5VIdeo, index) {
            if (!src) if (isHTML5VIdeo) return {
                html5: true
            }; else {
                console.error("lightGallery :- data-src is not provided on slide item " + (index + 1) + ". Please make sure the selector property is properly configured. More info - https://www.lightgalleryjs.com/demos/html-markup/");
                return;
            }
            var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)([\&|?][\S]*)*/i);
            var vimeo = src.match(/\/\/(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?([0-9a-z\-_]+)(.*)?/i);
            var wistia = src.match(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/(medias|embed)\/([0-9a-z\-_]+)(.*)/);
            if (youtube) return {
                youtube
            }; else if (vimeo) return {
                vimeo
            }; else if (wistia) return {
                wistia
            };
        }
    };
    var lgId = 0;
    var LightGallery = function() {
        function LightGallery(element, options) {
            this.lgOpened = false;
            this.index = 0;
            this.plugins = [];
            this.lGalleryOn = false;
            this.lgBusy = false;
            this.currentItemsInDom = [];
            this.prevScrollTop = 0;
            this.bodyPaddingRight = 0;
            this.isDummyImageRemoved = false;
            this.dragOrSwipeEnabled = false;
            this.mediaContainerPosition = {
                top: 0,
                bottom: 0
            };
            if (!element) return this;
            lgId++;
            this.lgId = lgId;
            this.el = element;
            this.LGel = $LG(element);
            this.generateSettings(options);
            this.buildModules();
            if (this.settings.dynamic && this.settings.dynamicEl !== void 0 && !Array.isArray(this.settings.dynamicEl)) throw "When using dynamic mode, you must also define dynamicEl as an Array.";
            this.galleryItems = this.getItems();
            this.normalizeSettings();
            this.init();
            this.validateLicense();
            return this;
        }
        LightGallery.prototype.generateSettings = function(options) {
            this.settings = __assign(__assign({}, lightGalleryCoreSettings), options);
            if (this.settings.isMobile && typeof this.settings.isMobile === "function" ? this.settings.isMobile() : utils.isMobile()) {
                var mobileSettings = __assign(__assign({}, this.settings.mobileSettings), this.settings.mobileSettings);
                this.settings = __assign(__assign({}, this.settings), mobileSettings);
            }
        };
        LightGallery.prototype.normalizeSettings = function() {
            if (this.settings.slideEndAnimation) this.settings.hideControlOnEnd = false;
            if (!this.settings.closable) this.settings.swipeToClose = false;
            this.zoomFromOrigin = this.settings.zoomFromOrigin;
            if (this.settings.dynamic) this.zoomFromOrigin = false;
            if (!this.settings.container) this.settings.container = document.body;
            this.settings.preload = Math.min(this.settings.preload, this.galleryItems.length);
        };
        LightGallery.prototype.init = function() {
            var _this = this;
            this.addSlideVideoInfo(this.galleryItems);
            this.buildStructure();
            this.LGel.trigger(lGEvents.init, {
                instance: this
            });
            if (this.settings.keyPress) this.keyPress();
            setTimeout((function() {
                _this.enableDrag();
                _this.enableSwipe();
                _this.triggerPosterClick();
            }), 50);
            this.arrow();
            if (this.settings.mousewheel) this.mousewheel();
            if (!this.settings.dynamic) this.openGalleryOnItemClick();
        };
        LightGallery.prototype.openGalleryOnItemClick = function() {
            var _this = this;
            var _loop_1 = function(index) {
                var element = this_1.items[index];
                var $element = $LG(element);
                var uuid = lgQuery.generateUUID();
                $element.attr("data-lg-id", uuid).on("click.lgcustom-item-" + uuid, (function(e) {
                    e.preventDefault();
                    var currentItemIndex = _this.settings.index || index;
                    _this.openGallery(currentItemIndex, element);
                }));
            };
            var this_1 = this;
            for (var index = 0; index < this.items.length; index++) _loop_1(index);
        };
        LightGallery.prototype.buildModules = function() {
            var _this = this;
            this.settings.plugins.forEach((function(plugin) {
                _this.plugins.push(new plugin(_this, $LG));
            }));
        };
        LightGallery.prototype.validateLicense = function() {
            if (!this.settings.licenseKey) console.error("Please provide a valid license key"); else if (this.settings.licenseKey === "0000-0000-000-0000") console.warn("lightGallery: " + this.settings.licenseKey + " license key is not valid for production use");
        };
        LightGallery.prototype.getSlideItem = function(index) {
            return $LG(this.getSlideItemId(index));
        };
        LightGallery.prototype.getSlideItemId = function(index) {
            return "#lg-item-" + this.lgId + "-" + index;
        };
        LightGallery.prototype.getIdName = function(id) {
            return id + "-" + this.lgId;
        };
        LightGallery.prototype.getElementById = function(id) {
            return $LG("#" + this.getIdName(id));
        };
        LightGallery.prototype.manageSingleSlideClassName = function() {
            if (this.galleryItems.length < 2) this.outer.addClass("lg-single-item"); else this.outer.removeClass("lg-single-item");
        };
        LightGallery.prototype.buildStructure = function() {
            var _this = this;
            var container = this.$container && this.$container.get();
            if (container) return;
            var controls = "";
            var subHtmlCont = "";
            if (this.settings.controls) controls = '<button type="button" id="' + this.getIdName("lg-prev") + '" aria-label="' + this.settings.strings["previousSlide"] + '" class="lg-prev lg-icon"> ' + this.settings.prevHtml + ' </button>\n                <button type="button" id="' + this.getIdName("lg-next") + '" aria-label="' + this.settings.strings["nextSlide"] + '" class="lg-next lg-icon"> ' + this.settings.nextHtml + " </button>";
            if (this.settings.appendSubHtmlTo !== ".lg-item") subHtmlCont = '<div class="lg-sub-html" role="status" aria-live="polite"></div>';
            var addClasses = "";
            if (this.settings.allowMediaOverlap) addClasses += "lg-media-overlap ";
            var ariaLabelledby = this.settings.ariaLabelledby ? 'aria-labelledby="' + this.settings.ariaLabelledby + '"' : "";
            var ariaDescribedby = this.settings.ariaDescribedby ? 'aria-describedby="' + this.settings.ariaDescribedby + '"' : "";
            var containerClassName = "lg-container " + this.settings.addClass + " " + (document.body !== this.settings.container ? "lg-inline" : "");
            var closeIcon = this.settings.closable && this.settings.showCloseIcon ? '<button type="button" aria-label="' + this.settings.strings["closeGallery"] + '" id="' + this.getIdName("lg-close") + '" class="lg-close lg-icon"></button>' : "";
            var maximizeIcon = this.settings.showMaximizeIcon ? '<button type="button" aria-label="' + this.settings.strings["toggleMaximize"] + '" id="' + this.getIdName("lg-maximize") + '" class="lg-maximize lg-icon"></button>' : "";
            var template = '\n        <div class="' + containerClassName + '" id="' + this.getIdName("lg-container") + '" tabindex="-1" aria-modal="true" ' + ariaLabelledby + " " + ariaDescribedby + ' role="dialog"\n        >\n            <div id="' + this.getIdName("lg-backdrop") + '" class="lg-backdrop"></div>\n\n            <div id="' + this.getIdName("lg-outer") + '" class="lg-outer lg-use-css3 lg-css3 lg-hide-items ' + addClasses + ' ">\n\n              <div id="' + this.getIdName("lg-content") + '" class="lg-content">\n                <div id="' + this.getIdName("lg-inner") + '" class="lg-inner">\n                </div>\n                ' + controls + '\n              </div>\n                <div id="' + this.getIdName("lg-toolbar") + '" class="lg-toolbar lg-group">\n                    ' + maximizeIcon + "\n                    " + closeIcon + "\n                    </div>\n                    " + (this.settings.appendSubHtmlTo === ".lg-outer" ? subHtmlCont : "") + '\n                <div id="' + this.getIdName("lg-components") + '" class="lg-components">\n                    ' + (this.settings.appendSubHtmlTo === ".lg-sub-html" ? subHtmlCont : "") + "\n                </div>\n            </div>\n        </div>\n        ";
            $LG(this.settings.container).append(template);
            if (document.body !== this.settings.container) $LG(this.settings.container).css("position", "relative");
            this.outer = this.getElementById("lg-outer");
            this.$lgComponents = this.getElementById("lg-components");
            this.$backdrop = this.getElementById("lg-backdrop");
            this.$container = this.getElementById("lg-container");
            this.$inner = this.getElementById("lg-inner");
            this.$content = this.getElementById("lg-content");
            this.$toolbar = this.getElementById("lg-toolbar");
            this.$backdrop.css("transition-duration", this.settings.backdropDuration + "ms");
            var outerClassNames = this.settings.mode + " ";
            this.manageSingleSlideClassName();
            if (this.settings.enableDrag) outerClassNames += "lg-grab ";
            this.outer.addClass(outerClassNames);
            this.$inner.css("transition-timing-function", this.settings.easing);
            this.$inner.css("transition-duration", this.settings.speed + "ms");
            if (this.settings.download) this.$toolbar.append('<a id="' + this.getIdName("lg-download") + '" target="_blank" rel="noopener" aria-label="' + this.settings.strings["download"] + '" download class="lg-download lg-icon"></a>');
            this.counter();
            $LG(window).on("resize.lg.global" + this.lgId + " orientationchange.lg.global" + this.lgId, (function() {
                _this.refreshOnResize();
            }));
            this.hideBars();
            this.manageCloseGallery();
            this.toggleMaximize();
            this.initModules();
        };
        LightGallery.prototype.refreshOnResize = function() {
            if (this.lgOpened) {
                var currentGalleryItem = this.galleryItems[this.index];
                var __slideVideoInfo = currentGalleryItem.__slideVideoInfo;
                this.mediaContainerPosition = this.getMediaContainerPosition();
                var _a = this.mediaContainerPosition, top_1 = _a.top, bottom = _a.bottom;
                this.currentImageSize = utils.getSize(this.items[this.index], this.outer, top_1 + bottom, __slideVideoInfo && this.settings.videoMaxSize);
                if (__slideVideoInfo) this.resizeVideoSlide(this.index, this.currentImageSize);
                if (this.zoomFromOrigin && !this.isDummyImageRemoved) {
                    var imgStyle = this.getDummyImgStyles(this.currentImageSize);
                    this.outer.find(".lg-current .lg-dummy-img").first().attr("style", imgStyle);
                }
                this.LGel.trigger(lGEvents.containerResize);
            }
        };
        LightGallery.prototype.resizeVideoSlide = function(index, imageSize) {
            var lgVideoStyle = this.getVideoContStyle(imageSize);
            var currentSlide = this.getSlideItem(index);
            currentSlide.find(".lg-video-cont").attr("style", lgVideoStyle);
        };
        LightGallery.prototype.updateSlides = function(items, index) {
            if (this.index > items.length - 1) this.index = items.length - 1;
            if (items.length === 1) this.index = 0;
            if (!items.length) {
                this.closeGallery();
                return;
            }
            var currentSrc = this.galleryItems[index].src;
            this.galleryItems = items;
            this.updateControls();
            this.$inner.empty();
            this.currentItemsInDom = [];
            var _index = 0;
            this.galleryItems.some((function(galleryItem, itemIndex) {
                if (galleryItem.src === currentSrc) {
                    _index = itemIndex;
                    return true;
                }
                return false;
            }));
            this.currentItemsInDom = this.organizeSlideItems(_index, -1);
            this.loadContent(_index, true);
            this.getSlideItem(_index).addClass("lg-current");
            this.index = _index;
            this.updateCurrentCounter(_index);
            this.LGel.trigger(lGEvents.updateSlides);
        };
        LightGallery.prototype.getItems = function() {
            this.items = [];
            if (!this.settings.dynamic) {
                if (this.settings.selector === "this") this.items.push(this.el); else if (this.settings.selector) if (typeof this.settings.selector === "string") if (this.settings.selectWithin) {
                    var selectWithin = $LG(this.settings.selectWithin);
                    this.items = selectWithin.find(this.settings.selector).get();
                } else this.items = this.el.querySelectorAll(this.settings.selector); else this.items = this.settings.selector; else this.items = this.el.children;
                return utils.getDynamicOptions(this.items, this.settings.extraProps, this.settings.getCaptionFromTitleOrAlt, this.settings.exThumbImage);
            } else return this.settings.dynamicEl || [];
        };
        LightGallery.prototype.shouldHideScrollbar = function() {
            return this.settings.hideScrollbar && document.body === this.settings.container;
        };
        LightGallery.prototype.hideScrollbar = function() {
            if (!this.shouldHideScrollbar()) return;
            this.bodyPaddingRight = parseFloat($LG("body").style().paddingRight);
            var bodyRect = document.documentElement.getBoundingClientRect();
            var scrollbarWidth = window.innerWidth - bodyRect.width;
            $LG(document.body).css("padding-right", scrollbarWidth + this.bodyPaddingRight + "px");
            $LG(document.body).addClass("lg-overlay-open");
        };
        LightGallery.prototype.resetScrollBar = function() {
            if (!this.shouldHideScrollbar()) return;
            $LG(document.body).css("padding-right", this.bodyPaddingRight + "px");
            $LG(document.body).removeClass("lg-overlay-open");
        };
        LightGallery.prototype.openGallery = function(index, element) {
            var _this = this;
            if (index === void 0) index = this.settings.index;
            if (this.lgOpened) return;
            this.lgOpened = true;
            this.outer.removeClass("lg-hide-items");
            this.hideScrollbar();
            this.$container.addClass("lg-show");
            var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, index);
            this.currentItemsInDom = itemsToBeInsertedToDom;
            var items = "";
            itemsToBeInsertedToDom.forEach((function(item) {
                items = items + '<div id="' + item + '" class="lg-item"></div>';
            }));
            this.$inner.append(items);
            this.addHtml(index);
            var transform = "";
            this.mediaContainerPosition = this.getMediaContainerPosition();
            var _a = this.mediaContainerPosition, top = _a.top, bottom = _a.bottom;
            if (!this.settings.allowMediaOverlap) this.setMediaContainerPosition(top, bottom);
            var __slideVideoInfo = this.galleryItems[index].__slideVideoInfo;
            if (this.zoomFromOrigin && element) {
                this.currentImageSize = utils.getSize(element, this.outer, top + bottom, __slideVideoInfo && this.settings.videoMaxSize);
                transform = utils.getTransform(element, this.outer, top, bottom, this.currentImageSize);
            }
            if (!this.zoomFromOrigin || !transform) {
                this.outer.addClass(this.settings.startClass);
                this.getSlideItem(index).removeClass("lg-complete");
            }
            var timeout = this.settings.zoomFromOrigin ? 100 : this.settings.backdropDuration;
            setTimeout((function() {
                _this.outer.addClass("lg-components-open");
            }), timeout);
            this.index = index;
            this.LGel.trigger(lGEvents.beforeOpen);
            this.getSlideItem(index).addClass("lg-current");
            this.lGalleryOn = false;
            this.prevScrollTop = $LG(window).scrollTop();
            setTimeout((function() {
                if (_this.zoomFromOrigin && transform) {
                    var currentSlide_1 = _this.getSlideItem(index);
                    currentSlide_1.css("transform", transform);
                    setTimeout((function() {
                        currentSlide_1.addClass("lg-start-progress lg-start-end-progress").css("transition-duration", _this.settings.startAnimationDuration + "ms");
                        _this.outer.addClass("lg-zoom-from-image");
                    }));
                    setTimeout((function() {
                        currentSlide_1.css("transform", "translate3d(0, 0, 0)");
                    }), 100);
                }
                setTimeout((function() {
                    _this.$backdrop.addClass("in");
                    _this.$container.addClass("lg-show-in");
                }), 10);
                setTimeout((function() {
                    if (_this.settings.trapFocus && document.body === _this.settings.container) _this.trapFocus();
                }), _this.settings.backdropDuration + 50);
                if (!_this.zoomFromOrigin || !transform) setTimeout((function() {
                    _this.outer.addClass("lg-visible");
                }), _this.settings.backdropDuration);
                _this.slide(index, false, false, false);
                _this.LGel.trigger(lGEvents.afterOpen);
            }));
            if (document.body === this.settings.container) $LG("html").addClass("lg-on");
        };
        LightGallery.prototype.getMediaContainerPosition = function() {
            if (this.settings.allowMediaOverlap) return {
                top: 0,
                bottom: 0
            };
            var top = this.$toolbar.get().clientHeight || 0;
            var subHtml = this.outer.find(".lg-components .lg-sub-html").get();
            var captionHeight = this.settings.defaultCaptionHeight || subHtml && subHtml.clientHeight || 0;
            var thumbContainer = this.outer.find(".lg-thumb-outer").get();
            var thumbHeight = thumbContainer ? thumbContainer.clientHeight : 0;
            var bottom = thumbHeight + captionHeight;
            return {
                top,
                bottom
            };
        };
        LightGallery.prototype.setMediaContainerPosition = function(top, bottom) {
            if (top === void 0) top = 0;
            if (bottom === void 0) bottom = 0;
            this.$content.css("top", top + "px").css("bottom", bottom + "px");
        };
        LightGallery.prototype.hideBars = function() {
            var _this = this;
            setTimeout((function() {
                _this.outer.removeClass("lg-hide-items");
                if (_this.settings.hideBarsDelay > 0) {
                    _this.outer.on("mousemove.lg click.lg touchstart.lg", (function() {
                        _this.outer.removeClass("lg-hide-items");
                        clearTimeout(_this.hideBarTimeout);
                        _this.hideBarTimeout = setTimeout((function() {
                            _this.outer.addClass("lg-hide-items");
                        }), _this.settings.hideBarsDelay);
                    }));
                    _this.outer.trigger("mousemove.lg");
                }
            }), this.settings.showBarsAfter);
        };
        LightGallery.prototype.initPictureFill = function($img) {
            if (this.settings.supportLegacyBrowser) try {
                picturefill({
                    elements: [ $img.get() ]
                });
            } catch (e) {
                console.warn("lightGallery :- If you want srcset or picture tag to be supported for older browser please include picturefil javascript library in your document.");
            }
        };
        LightGallery.prototype.counter = function() {
            if (this.settings.counter) {
                var counterHtml = '<div class="lg-counter" role="status" aria-live="polite">\n                <span id="' + this.getIdName("lg-counter-current") + '" class="lg-counter-current">' + (this.index + 1) + ' </span> /\n                <span id="' + this.getIdName("lg-counter-all") + '" class="lg-counter-all">' + this.galleryItems.length + " </span></div>";
                this.outer.find(this.settings.appendCounterTo).append(counterHtml);
            }
        };
        LightGallery.prototype.addHtml = function(index) {
            var subHtml;
            var subHtmlUrl;
            if (this.galleryItems[index].subHtmlUrl) subHtmlUrl = this.galleryItems[index].subHtmlUrl; else subHtml = this.galleryItems[index].subHtml;
            if (!subHtmlUrl) if (subHtml) {
                var fL = subHtml.substring(0, 1);
                if (fL === "." || fL === "#") if (this.settings.subHtmlSelectorRelative && !this.settings.dynamic) subHtml = $LG(this.items).eq(index).find(subHtml).first().html(); else subHtml = $LG(subHtml).first().html();
            } else subHtml = "";
            if (this.settings.appendSubHtmlTo !== ".lg-item") if (subHtmlUrl) this.outer.find(".lg-sub-html").load(subHtmlUrl); else this.outer.find(".lg-sub-html").html(subHtml); else {
                var currentSlide = $LG(this.getSlideItemId(index));
                if (subHtmlUrl) currentSlide.load(subHtmlUrl); else currentSlide.append('<div class="lg-sub-html">' + subHtml + "</div>");
            }
            if (typeof subHtml !== "undefined" && subHtml !== null) if (subHtml === "") this.outer.find(this.settings.appendSubHtmlTo).addClass("lg-empty-html"); else this.outer.find(this.settings.appendSubHtmlTo).removeClass("lg-empty-html");
            this.LGel.trigger(lGEvents.afterAppendSubHtml, {
                index
            });
        };
        LightGallery.prototype.preload = function(index) {
            for (var i = 1; i <= this.settings.preload; i++) {
                if (i >= this.galleryItems.length - index) break;
                this.loadContent(index + i, false);
            }
            for (var j = 1; j <= this.settings.preload; j++) {
                if (index - j < 0) break;
                this.loadContent(index - j, false);
            }
        };
        LightGallery.prototype.getDummyImgStyles = function(imageSize) {
            if (!imageSize) return "";
            return "width:" + imageSize.width + "px;\n                margin-left: -" + imageSize.width / 2 + "px;\n                margin-top: -" + imageSize.height / 2 + "px;\n                height:" + imageSize.height + "px";
        };
        LightGallery.prototype.getVideoContStyle = function(imageSize) {
            if (!imageSize) return "";
            return "width:" + imageSize.width + "px;\n                height:" + imageSize.height + "px";
        };
        LightGallery.prototype.getDummyImageContent = function($currentSlide, index, alt) {
            var $currentItem;
            if (!this.settings.dynamic) $currentItem = $LG(this.items).eq(index);
            if ($currentItem) {
                var _dummyImgSrc = void 0;
                if (!this.settings.exThumbImage) _dummyImgSrc = $currentItem.find("img").first().attr("src"); else _dummyImgSrc = $currentItem.attr(this.settings.exThumbImage);
                if (!_dummyImgSrc) return "";
                var imgStyle = this.getDummyImgStyles(this.currentImageSize);
                var dummyImgContent = "<img " + alt + ' style="' + imgStyle + '" class="lg-dummy-img" src="' + _dummyImgSrc + '" />';
                $currentSlide.addClass("lg-first-slide");
                this.outer.addClass("lg-first-slide-loading");
                return dummyImgContent;
            }
            return "";
        };
        LightGallery.prototype.setImgMarkup = function(src, $currentSlide, index) {
            var currentGalleryItem = this.galleryItems[index];
            var alt = currentGalleryItem.alt, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
            var imgContent = "";
            var altAttr = alt ? 'alt="' + alt + '"' : "";
            if (this.isFirstSlideWithZoomAnimation()) imgContent = this.getDummyImageContent($currentSlide, index, altAttr); else imgContent = utils.getImgMarkup(index, src, altAttr, srcset, sizes, sources);
            var imgMarkup = '<picture class="lg-img-wrap"> ' + imgContent + "</picture>";
            $currentSlide.prepend(imgMarkup);
        };
        LightGallery.prototype.onSlideObjectLoad = function($slide, isHTML5VideoWithoutPoster, onLoad, onError) {
            var mediaObject = $slide.find(".lg-object").first();
            if (utils.isImageLoaded(mediaObject.get()) || isHTML5VideoWithoutPoster) onLoad(); else {
                mediaObject.on("load.lg error.lg", (function() {
                    onLoad && onLoad();
                }));
                mediaObject.on("error.lg", (function() {
                    onError && onError();
                }));
            }
        };
        LightGallery.prototype.onLgObjectLoad = function(currentSlide, index, delay, speed, isFirstSlide, isHTML5VideoWithoutPoster) {
            var _this = this;
            this.onSlideObjectLoad(currentSlide, isHTML5VideoWithoutPoster, (function() {
                _this.triggerSlideItemLoad(currentSlide, index, delay, speed, isFirstSlide);
            }), (function() {
                currentSlide.addClass("lg-complete lg-complete_");
                currentSlide.html('<span class="lg-error-msg">' + _this.settings.strings["mediaLoadingFailed"] + "</span>");
            }));
        };
        LightGallery.prototype.triggerSlideItemLoad = function($currentSlide, index, delay, speed, isFirstSlide) {
            var _this = this;
            var currentGalleryItem = this.galleryItems[index];
            var _speed = isFirstSlide && this.getSlideType(currentGalleryItem) === "video" && !currentGalleryItem.poster ? speed : 0;
            setTimeout((function() {
                $currentSlide.addClass("lg-complete lg-complete_");
                _this.LGel.trigger(lGEvents.slideItemLoad, {
                    index,
                    delay: delay || 0,
                    isFirstSlide
                });
            }), _speed);
        };
        LightGallery.prototype.isFirstSlideWithZoomAnimation = function() {
            return !!(!this.lGalleryOn && this.zoomFromOrigin && this.currentImageSize);
        };
        LightGallery.prototype.addSlideVideoInfo = function(items) {
            var _this = this;
            items.forEach((function(element, index) {
                element.__slideVideoInfo = utils.isVideo(element.src, !!element.video, index);
                if (element.__slideVideoInfo && _this.settings.loadYouTubePoster && !element.poster && element.__slideVideoInfo.youtube) element.poster = "//img.youtube.com/vi/" + element.__slideVideoInfo.youtube[1] + "/maxresdefault.jpg";
            }));
        };
        LightGallery.prototype.loadContent = function(index, rec) {
            var _this = this;
            var currentGalleryItem = this.galleryItems[index];
            var $currentSlide = $LG(this.getSlideItemId(index));
            var poster = currentGalleryItem.poster, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
            var src = currentGalleryItem.src;
            var video = currentGalleryItem.video;
            var _html5Video = video && typeof video === "string" ? JSON.parse(video) : video;
            if (currentGalleryItem.responsive) {
                var srcDyItms = currentGalleryItem.responsive.split(",");
                src = utils.getResponsiveSrc(srcDyItms) || src;
            }
            var videoInfo = currentGalleryItem.__slideVideoInfo;
            var lgVideoStyle = "";
            var iframe = !!currentGalleryItem.iframe;
            var isFirstSlide = !this.lGalleryOn;
            var delay = 0;
            if (isFirstSlide) if (this.zoomFromOrigin && this.currentImageSize) delay = this.settings.startAnimationDuration + 10; else delay = this.settings.backdropDuration + 10;
            if (!$currentSlide.hasClass("lg-loaded")) {
                if (videoInfo) {
                    var _a = this.mediaContainerPosition, top_2 = _a.top, bottom = _a.bottom;
                    var videoSize = utils.getSize(this.items[index], this.outer, top_2 + bottom, videoInfo && this.settings.videoMaxSize);
                    lgVideoStyle = this.getVideoContStyle(videoSize);
                }
                if (iframe) {
                    var markup = utils.getIframeMarkup(this.settings.iframeWidth, this.settings.iframeHeight, this.settings.iframeMaxWidth, this.settings.iframeMaxHeight, src, currentGalleryItem.iframeTitle);
                    $currentSlide.prepend(markup);
                } else if (poster) {
                    var dummyImg = "";
                    var hasStartAnimation = isFirstSlide && this.zoomFromOrigin && this.currentImageSize;
                    if (hasStartAnimation) dummyImg = this.getDummyImageContent($currentSlide, index, "");
                    markup = utils.getVideoPosterMarkup(poster, dummyImg || "", lgVideoStyle, this.settings.strings["playVideo"], videoInfo);
                    $currentSlide.prepend(markup);
                } else if (videoInfo) {
                    markup = '<div class="lg-video-cont " style="' + lgVideoStyle + '"></div>';
                    $currentSlide.prepend(markup);
                } else {
                    this.setImgMarkup(src, $currentSlide, index);
                    if (srcset || sources) {
                        var $img = $currentSlide.find(".lg-object");
                        this.initPictureFill($img);
                    }
                }
                if (poster || videoInfo) this.LGel.trigger(lGEvents.hasVideo, {
                    index,
                    src,
                    html5Video: _html5Video,
                    hasPoster: !!poster
                });
                this.LGel.trigger(lGEvents.afterAppendSlide, {
                    index
                });
                if (this.lGalleryOn && this.settings.appendSubHtmlTo === ".lg-item") this.addHtml(index);
            }
            var _speed = 0;
            if (delay && !$LG(document.body).hasClass("lg-from-hash")) _speed = delay;
            if (this.isFirstSlideWithZoomAnimation()) {
                setTimeout((function() {
                    $currentSlide.removeClass("lg-start-end-progress lg-start-progress").removeAttr("style");
                }), this.settings.startAnimationDuration + 100);
                if (!$currentSlide.hasClass("lg-loaded")) setTimeout((function() {
                    if (_this.getSlideType(currentGalleryItem) === "image") {
                        var alt = currentGalleryItem.alt;
                        var altAttr = alt ? 'alt="' + alt + '"' : "";
                        $currentSlide.find(".lg-img-wrap").append(utils.getImgMarkup(index, src, altAttr, srcset, sizes, currentGalleryItem.sources));
                        if (srcset || sources) {
                            var $img = $currentSlide.find(".lg-object");
                            _this.initPictureFill($img);
                        }
                    }
                    if (_this.getSlideType(currentGalleryItem) === "image" || _this.getSlideType(currentGalleryItem) === "video" && poster) {
                        _this.onLgObjectLoad($currentSlide, index, delay, _speed, true, false);
                        _this.onSlideObjectLoad($currentSlide, !!(videoInfo && videoInfo.html5 && !poster), (function() {
                            _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
                        }), (function() {
                            _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
                        }));
                    }
                }), this.settings.startAnimationDuration + 100);
            }
            $currentSlide.addClass("lg-loaded");
            if (!this.isFirstSlideWithZoomAnimation() || this.getSlideType(currentGalleryItem) === "video" && !poster) this.onLgObjectLoad($currentSlide, index, delay, _speed, isFirstSlide, !!(videoInfo && videoInfo.html5 && !poster));
            if ((!this.zoomFromOrigin || !this.currentImageSize) && $currentSlide.hasClass("lg-complete_") && !this.lGalleryOn) setTimeout((function() {
                $currentSlide.addClass("lg-complete");
            }), this.settings.backdropDuration);
            this.lGalleryOn = true;
            if (rec === true) if (!$currentSlide.hasClass("lg-complete_")) $currentSlide.find(".lg-object").first().on("load.lg error.lg", (function() {
                _this.preload(index);
            })); else this.preload(index);
        };
        LightGallery.prototype.loadContentOnFirstSlideLoad = function(index, $currentSlide, speed) {
            var _this = this;
            setTimeout((function() {
                $currentSlide.find(".lg-dummy-img").remove();
                $currentSlide.removeClass("lg-first-slide");
                _this.outer.removeClass("lg-first-slide-loading");
                _this.isDummyImageRemoved = true;
                _this.preload(index);
            }), speed + 300);
        };
        LightGallery.prototype.getItemsToBeInsertedToDom = function(index, prevIndex, numberOfItems) {
            var _this = this;
            if (numberOfItems === void 0) numberOfItems = 0;
            var itemsToBeInsertedToDom = [];
            var possibleNumberOfItems = Math.max(numberOfItems, 3);
            possibleNumberOfItems = Math.min(possibleNumberOfItems, this.galleryItems.length);
            var prevIndexItem = "lg-item-" + this.lgId + "-" + prevIndex;
            if (this.galleryItems.length <= 3) {
                this.galleryItems.forEach((function(_element, index) {
                    itemsToBeInsertedToDom.push("lg-item-" + _this.lgId + "-" + index);
                }));
                return itemsToBeInsertedToDom;
            }
            if (index < (this.galleryItems.length - 1) / 2) {
                for (var idx = index; idx > index - possibleNumberOfItems / 2 && idx >= 0; idx--) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
                var numberOfExistingItems = itemsToBeInsertedToDom.length;
                for (idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index + idx + 1));
            } else {
                for (idx = index; idx <= this.galleryItems.length - 1 && idx < index + possibleNumberOfItems / 2; idx++) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
                numberOfExistingItems = itemsToBeInsertedToDom.length;
                for (idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index - idx - 1));
            }
            if (this.settings.loop) if (index === this.galleryItems.length - 1) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + 0); else if (index === 0) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (this.galleryItems.length - 1));
            if (itemsToBeInsertedToDom.indexOf(prevIndexItem) === -1) itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + prevIndex);
            return itemsToBeInsertedToDom;
        };
        LightGallery.prototype.organizeSlideItems = function(index, prevIndex) {
            var _this = this;
            var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, prevIndex, this.settings.numberOfSlideItemsInDom);
            itemsToBeInsertedToDom.forEach((function(item) {
                if (_this.currentItemsInDom.indexOf(item) === -1) _this.$inner.append('<div id="' + item + '" class="lg-item"></div>');
            }));
            this.currentItemsInDom.forEach((function(item) {
                if (itemsToBeInsertedToDom.indexOf(item) === -1) $LG("#" + item).remove();
            }));
            return itemsToBeInsertedToDom;
        };
        LightGallery.prototype.getPreviousSlideIndex = function() {
            var prevIndex = 0;
            try {
                var currentItemId = this.outer.find(".lg-current").first().attr("id");
                prevIndex = parseInt(currentItemId.split("-")[3]) || 0;
            } catch (error) {
                prevIndex = 0;
            }
            return prevIndex;
        };
        LightGallery.prototype.setDownloadValue = function(index) {
            if (this.settings.download) {
                var currentGalleryItem = this.galleryItems[index];
                var hideDownloadBtn = currentGalleryItem.downloadUrl === false || currentGalleryItem.downloadUrl === "false";
                if (hideDownloadBtn) this.outer.addClass("lg-hide-download"); else {
                    var $download = this.getElementById("lg-download");
                    this.outer.removeClass("lg-hide-download");
                    $download.attr("href", currentGalleryItem.downloadUrl || currentGalleryItem.src);
                    if (currentGalleryItem.download) $download.attr("download", currentGalleryItem.download);
                }
            }
        };
        LightGallery.prototype.makeSlideAnimation = function(direction, currentSlideItem, previousSlideItem) {
            var _this = this;
            if (this.lGalleryOn) previousSlideItem.addClass("lg-slide-progress");
            setTimeout((function() {
                _this.outer.addClass("lg-no-trans");
                _this.outer.find(".lg-item").removeClass("lg-prev-slide lg-next-slide");
                if (direction === "prev") {
                    currentSlideItem.addClass("lg-prev-slide");
                    previousSlideItem.addClass("lg-next-slide");
                } else {
                    currentSlideItem.addClass("lg-next-slide");
                    previousSlideItem.addClass("lg-prev-slide");
                }
                setTimeout((function() {
                    _this.outer.find(".lg-item").removeClass("lg-current");
                    currentSlideItem.addClass("lg-current");
                    _this.outer.removeClass("lg-no-trans");
                }), 50);
            }), this.lGalleryOn ? this.settings.slideDelay : 0);
        };
        LightGallery.prototype.slide = function(index, fromTouch, fromThumb, direction) {
            var _this = this;
            var prevIndex = this.getPreviousSlideIndex();
            this.currentItemsInDom = this.organizeSlideItems(index, prevIndex);
            if (this.lGalleryOn && prevIndex === index) return;
            var numberOfGalleryItems = this.galleryItems.length;
            if (!this.lgBusy) {
                if (this.settings.counter) this.updateCurrentCounter(index);
                var currentSlideItem = this.getSlideItem(index);
                var previousSlideItem_1 = this.getSlideItem(prevIndex);
                var currentGalleryItem = this.galleryItems[index];
                var videoInfo = currentGalleryItem.__slideVideoInfo;
                this.outer.attr("data-lg-slide-type", this.getSlideType(currentGalleryItem));
                this.setDownloadValue(index);
                if (videoInfo) {
                    var _a = this.mediaContainerPosition, top_3 = _a.top, bottom = _a.bottom;
                    var videoSize = utils.getSize(this.items[index], this.outer, top_3 + bottom, videoInfo && this.settings.videoMaxSize);
                    this.resizeVideoSlide(index, videoSize);
                }
                this.LGel.trigger(lGEvents.beforeSlide, {
                    prevIndex,
                    index,
                    fromTouch: !!fromTouch,
                    fromThumb: !!fromThumb
                });
                this.lgBusy = true;
                clearTimeout(this.hideBarTimeout);
                this.arrowDisable(index);
                if (!direction) if (index < prevIndex) direction = "prev"; else if (index > prevIndex) direction = "next";
                if (!fromTouch) this.makeSlideAnimation(direction, currentSlideItem, previousSlideItem_1); else {
                    this.outer.find(".lg-item").removeClass("lg-prev-slide lg-current lg-next-slide");
                    var touchPrev = void 0;
                    var touchNext = void 0;
                    if (numberOfGalleryItems > 2) {
                        touchPrev = index - 1;
                        touchNext = index + 1;
                        if (index === 0 && prevIndex === numberOfGalleryItems - 1) {
                            touchNext = 0;
                            touchPrev = numberOfGalleryItems - 1;
                        } else if (index === numberOfGalleryItems - 1 && prevIndex === 0) {
                            touchNext = 0;
                            touchPrev = numberOfGalleryItems - 1;
                        }
                    } else {
                        touchPrev = 0;
                        touchNext = 1;
                    }
                    if (direction === "prev") this.getSlideItem(touchNext).addClass("lg-next-slide"); else this.getSlideItem(touchPrev).addClass("lg-prev-slide");
                    currentSlideItem.addClass("lg-current");
                }
                if (!this.lGalleryOn) this.loadContent(index, true); else setTimeout((function() {
                    _this.loadContent(index, true);
                    if (_this.settings.appendSubHtmlTo !== ".lg-item") _this.addHtml(index);
                }), this.settings.speed + 50 + (fromTouch ? 0 : this.settings.slideDelay));
                setTimeout((function() {
                    _this.lgBusy = false;
                    previousSlideItem_1.removeClass("lg-slide-progress");
                    _this.LGel.trigger(lGEvents.afterSlide, {
                        prevIndex,
                        index,
                        fromTouch,
                        fromThumb
                    });
                }), (this.lGalleryOn ? this.settings.speed + 100 : 100) + (fromTouch ? 0 : this.settings.slideDelay));
            }
            this.index = index;
        };
        LightGallery.prototype.updateCurrentCounter = function(index) {
            this.getElementById("lg-counter-current").html(index + 1 + "");
        };
        LightGallery.prototype.updateCounterTotal = function() {
            this.getElementById("lg-counter-all").html(this.galleryItems.length + "");
        };
        LightGallery.prototype.getSlideType = function(item) {
            if (item.__slideVideoInfo) return "video"; else if (item.iframe) return "iframe"; else return "image";
        };
        LightGallery.prototype.touchMove = function(startCoords, endCoords, e) {
            var distanceX = endCoords.pageX - startCoords.pageX;
            var distanceY = endCoords.pageY - startCoords.pageY;
            var allowSwipe = false;
            if (this.swipeDirection) allowSwipe = true; else if (Math.abs(distanceX) > 15) {
                this.swipeDirection = "horizontal";
                allowSwipe = true;
            } else if (Math.abs(distanceY) > 15) {
                this.swipeDirection = "vertical";
                allowSwipe = true;
            }
            if (!allowSwipe) return;
            var $currentSlide = this.getSlideItem(this.index);
            if (this.swipeDirection === "horizontal") {
                e === null || e === void 0 ? void 0 : e.preventDefault();
                this.outer.addClass("lg-dragging");
                this.setTranslate($currentSlide, distanceX, 0);
                var width = $currentSlide.get().offsetWidth;
                var slideWidthAmount = width * 15 / 100;
                var gutter = slideWidthAmount - Math.abs(distanceX * 10 / 100);
                this.setTranslate(this.outer.find(".lg-prev-slide").first(), -width + distanceX - gutter, 0);
                this.setTranslate(this.outer.find(".lg-next-slide").first(), width + distanceX + gutter, 0);
            } else if (this.swipeDirection === "vertical") if (this.settings.swipeToClose) {
                e === null || e === void 0 ? void 0 : e.preventDefault();
                this.$container.addClass("lg-dragging-vertical");
                var opacity = 1 - Math.abs(distanceY) / window.innerHeight;
                this.$backdrop.css("opacity", opacity);
                var scale = 1 - Math.abs(distanceY) / (window.innerWidth * 2);
                this.setTranslate($currentSlide, 0, distanceY, scale, scale);
                if (Math.abs(distanceY) > 100) this.outer.addClass("lg-hide-items").removeClass("lg-components-open");
            }
        };
        LightGallery.prototype.touchEnd = function(endCoords, startCoords, event) {
            var _this = this;
            var distance;
            if (this.settings.mode !== "lg-slide") this.outer.addClass("lg-slide");
            setTimeout((function() {
                _this.$container.removeClass("lg-dragging-vertical");
                _this.outer.removeClass("lg-dragging lg-hide-items").addClass("lg-components-open");
                var triggerClick = true;
                if (_this.swipeDirection === "horizontal") {
                    distance = endCoords.pageX - startCoords.pageX;
                    var distanceAbs = Math.abs(endCoords.pageX - startCoords.pageX);
                    if (distance < 0 && distanceAbs > _this.settings.swipeThreshold) {
                        _this.goToNextSlide(true);
                        triggerClick = false;
                    } else if (distance > 0 && distanceAbs > _this.settings.swipeThreshold) {
                        _this.goToPrevSlide(true);
                        triggerClick = false;
                    }
                } else if (_this.swipeDirection === "vertical") {
                    distance = Math.abs(endCoords.pageY - startCoords.pageY);
                    if (_this.settings.closable && _this.settings.swipeToClose && distance > 100) {
                        _this.closeGallery();
                        return;
                    } else _this.$backdrop.css("opacity", 1);
                }
                _this.outer.find(".lg-item").removeAttr("style");
                if (triggerClick && Math.abs(endCoords.pageX - startCoords.pageX) < 5) {
                    var target = $LG(event.target);
                    if (_this.isPosterElement(target)) _this.LGel.trigger(lGEvents.posterClick);
                }
                _this.swipeDirection = void 0;
            }));
            setTimeout((function() {
                if (!_this.outer.hasClass("lg-dragging") && _this.settings.mode !== "lg-slide") _this.outer.removeClass("lg-slide");
            }), this.settings.speed + 100);
        };
        LightGallery.prototype.enableSwipe = function() {
            var _this = this;
            var startCoords = {};
            var endCoords = {};
            var isMoved = false;
            var isSwiping = false;
            if (this.settings.enableSwipe) {
                this.$inner.on("touchstart.lg", (function(e) {
                    _this.dragOrSwipeEnabled = true;
                    var $item = _this.getSlideItem(_this.index);
                    if (($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) && !_this.outer.hasClass("lg-zoomed") && !_this.lgBusy && e.touches.length === 1) {
                        isSwiping = true;
                        _this.touchAction = "swipe";
                        _this.manageSwipeClass();
                        startCoords = {
                            pageX: e.touches[0].pageX,
                            pageY: e.touches[0].pageY
                        };
                    }
                }));
                this.$inner.on("touchmove.lg", (function(e) {
                    if (isSwiping && _this.touchAction === "swipe" && e.touches.length === 1) {
                        endCoords = {
                            pageX: e.touches[0].pageX,
                            pageY: e.touches[0].pageY
                        };
                        _this.touchMove(startCoords, endCoords, e);
                        isMoved = true;
                    }
                }));
                this.$inner.on("touchend.lg", (function(event) {
                    if (_this.touchAction === "swipe") {
                        if (isMoved) {
                            isMoved = false;
                            _this.touchEnd(endCoords, startCoords, event);
                        } else if (isSwiping) {
                            var target = $LG(event.target);
                            if (_this.isPosterElement(target)) _this.LGel.trigger(lGEvents.posterClick);
                        }
                        _this.touchAction = void 0;
                        isSwiping = false;
                    }
                }));
            }
        };
        LightGallery.prototype.enableDrag = function() {
            var _this = this;
            var startCoords = {};
            var endCoords = {};
            var isDraging = false;
            var isMoved = false;
            if (this.settings.enableDrag) {
                this.outer.on("mousedown.lg", (function(e) {
                    _this.dragOrSwipeEnabled = true;
                    var $item = _this.getSlideItem(_this.index);
                    if ($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) if (!_this.outer.hasClass("lg-zoomed") && !_this.lgBusy) {
                        e.preventDefault();
                        if (!_this.lgBusy) {
                            _this.manageSwipeClass();
                            startCoords = {
                                pageX: e.pageX,
                                pageY: e.pageY
                            };
                            isDraging = true;
                            _this.outer.get().scrollLeft += 1;
                            _this.outer.get().scrollLeft -= 1;
                            _this.outer.removeClass("lg-grab").addClass("lg-grabbing");
                            _this.LGel.trigger(lGEvents.dragStart);
                        }
                    }
                }));
                $LG(window).on("mousemove.lg.global" + this.lgId, (function(e) {
                    if (isDraging && _this.lgOpened) {
                        isMoved = true;
                        endCoords = {
                            pageX: e.pageX,
                            pageY: e.pageY
                        };
                        _this.touchMove(startCoords, endCoords);
                        _this.LGel.trigger(lGEvents.dragMove);
                    }
                }));
                $LG(window).on("mouseup.lg.global" + this.lgId, (function(event) {
                    if (!_this.lgOpened) return;
                    var target = $LG(event.target);
                    if (isMoved) {
                        isMoved = false;
                        _this.touchEnd(endCoords, startCoords, event);
                        _this.LGel.trigger(lGEvents.dragEnd);
                    } else if (_this.isPosterElement(target)) _this.LGel.trigger(lGEvents.posterClick);
                    if (isDraging) {
                        isDraging = false;
                        _this.outer.removeClass("lg-grabbing").addClass("lg-grab");
                    }
                }));
            }
        };
        LightGallery.prototype.triggerPosterClick = function() {
            var _this = this;
            this.$inner.on("click.lg", (function(event) {
                if (!_this.dragOrSwipeEnabled && _this.isPosterElement($LG(event.target))) _this.LGel.trigger(lGEvents.posterClick);
            }));
        };
        LightGallery.prototype.manageSwipeClass = function() {
            var _touchNext = this.index + 1;
            var _touchPrev = this.index - 1;
            if (this.settings.loop && this.galleryItems.length > 2) if (this.index === 0) _touchPrev = this.galleryItems.length - 1; else if (this.index === this.galleryItems.length - 1) _touchNext = 0;
            this.outer.find(".lg-item").removeClass("lg-next-slide lg-prev-slide");
            if (_touchPrev > -1) this.getSlideItem(_touchPrev).addClass("lg-prev-slide");
            this.getSlideItem(_touchNext).addClass("lg-next-slide");
        };
        LightGallery.prototype.goToNextSlide = function(fromTouch) {
            var _this = this;
            var _loop = this.settings.loop;
            if (fromTouch && this.galleryItems.length < 3) _loop = false;
            if (!this.lgBusy) if (this.index + 1 < this.galleryItems.length) {
                this.index++;
                this.LGel.trigger(lGEvents.beforeNextSlide, {
                    index: this.index
                });
                this.slide(this.index, !!fromTouch, false, "next");
            } else if (_loop) {
                this.index = 0;
                this.LGel.trigger(lGEvents.beforeNextSlide, {
                    index: this.index
                });
                this.slide(this.index, !!fromTouch, false, "next");
            } else if (this.settings.slideEndAnimation && !fromTouch) {
                this.outer.addClass("lg-right-end");
                setTimeout((function() {
                    _this.outer.removeClass("lg-right-end");
                }), 400);
            }
        };
        LightGallery.prototype.goToPrevSlide = function(fromTouch) {
            var _this = this;
            var _loop = this.settings.loop;
            if (fromTouch && this.galleryItems.length < 3) _loop = false;
            if (!this.lgBusy) if (this.index > 0) {
                this.index--;
                this.LGel.trigger(lGEvents.beforePrevSlide, {
                    index: this.index,
                    fromTouch
                });
                this.slide(this.index, !!fromTouch, false, "prev");
            } else if (_loop) {
                this.index = this.galleryItems.length - 1;
                this.LGel.trigger(lGEvents.beforePrevSlide, {
                    index: this.index,
                    fromTouch
                });
                this.slide(this.index, !!fromTouch, false, "prev");
            } else if (this.settings.slideEndAnimation && !fromTouch) {
                this.outer.addClass("lg-left-end");
                setTimeout((function() {
                    _this.outer.removeClass("lg-left-end");
                }), 400);
            }
        };
        LightGallery.prototype.keyPress = function() {
            var _this = this;
            $LG(window).on("keydown.lg.global" + this.lgId, (function(e) {
                if (_this.lgOpened && _this.settings.escKey === true && e.keyCode === 27) {
                    e.preventDefault();
                    if (_this.settings.allowMediaOverlap && _this.outer.hasClass("lg-can-toggle") && _this.outer.hasClass("lg-components-open")) _this.outer.removeClass("lg-components-open"); else _this.closeGallery();
                }
                if (_this.lgOpened && _this.galleryItems.length > 1) {
                    if (e.keyCode === 37) {
                        e.preventDefault();
                        _this.goToPrevSlide();
                    }
                    if (e.keyCode === 39) {
                        e.preventDefault();
                        _this.goToNextSlide();
                    }
                }
            }));
        };
        LightGallery.prototype.arrow = function() {
            var _this = this;
            this.getElementById("lg-prev").on("click.lg", (function() {
                _this.goToPrevSlide();
            }));
            this.getElementById("lg-next").on("click.lg", (function() {
                _this.goToNextSlide();
            }));
        };
        LightGallery.prototype.arrowDisable = function(index) {
            if (!this.settings.loop && this.settings.hideControlOnEnd) {
                var $prev = this.getElementById("lg-prev");
                var $next = this.getElementById("lg-next");
                if (index + 1 === this.galleryItems.length) $next.attr("disabled", "disabled").addClass("disabled"); else $next.removeAttr("disabled").removeClass("disabled");
                if (index === 0) $prev.attr("disabled", "disabled").addClass("disabled"); else $prev.removeAttr("disabled").removeClass("disabled");
            }
        };
        LightGallery.prototype.setTranslate = function($el, xValue, yValue, scaleX, scaleY) {
            if (scaleX === void 0) scaleX = 1;
            if (scaleY === void 0) scaleY = 1;
            $el.css("transform", "translate3d(" + xValue + "px, " + yValue + "px, 0px) scale3d(" + scaleX + ", " + scaleY + ", 1)");
        };
        LightGallery.prototype.mousewheel = function() {
            var _this = this;
            var lastCall = 0;
            this.outer.on("wheel.lg", (function(e) {
                if (!e.deltaY || _this.galleryItems.length < 2) return;
                e.preventDefault();
                var now = (new Date).getTime();
                if (now - lastCall < 1e3) return;
                lastCall = now;
                if (e.deltaY > 0) _this.goToNextSlide(); else if (e.deltaY < 0) _this.goToPrevSlide();
            }));
        };
        LightGallery.prototype.isSlideElement = function(target) {
            return target.hasClass("lg-outer") || target.hasClass("lg-item") || target.hasClass("lg-img-wrap");
        };
        LightGallery.prototype.isPosterElement = function(target) {
            var playButton = this.getSlideItem(this.index).find(".lg-video-play-button").get();
            return target.hasClass("lg-video-poster") || target.hasClass("lg-video-play-button") || playButton && playButton.contains(target.get());
        };
        LightGallery.prototype.toggleMaximize = function() {
            var _this = this;
            this.getElementById("lg-maximize").on("click.lg", (function() {
                _this.$container.toggleClass("lg-inline");
                _this.refreshOnResize();
            }));
        };
        LightGallery.prototype.invalidateItems = function() {
            for (var index = 0; index < this.items.length; index++) {
                var element = this.items[index];
                var $element = $LG(element);
                $element.off("click.lgcustom-item-" + $element.attr("data-lg-id"));
            }
        };
        LightGallery.prototype.trapFocus = function() {
            var _this = this;
            this.$container.get().focus({
                preventScroll: true
            });
            $LG(window).on("keydown.lg.global" + this.lgId, (function(e) {
                if (!_this.lgOpened) return;
                var isTabPressed = e.key === "Tab" || e.keyCode === 9;
                if (!isTabPressed) return;
                var focusableEls = utils.getFocusableElements(_this.$container.get());
                var firstFocusableEl = focusableEls[0];
                var lastFocusableEl = focusableEls[focusableEls.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }));
        };
        LightGallery.prototype.manageCloseGallery = function() {
            var _this = this;
            if (!this.settings.closable) return;
            var mousedown = false;
            this.getElementById("lg-close").on("click.lg", (function() {
                _this.closeGallery();
            }));
            if (this.settings.closeOnTap) {
                this.outer.on("mousedown.lg", (function(e) {
                    var target = $LG(e.target);
                    if (_this.isSlideElement(target)) mousedown = true; else mousedown = false;
                }));
                this.outer.on("mousemove.lg", (function() {
                    mousedown = false;
                }));
                this.outer.on("mouseup.lg", (function(e) {
                    var target = $LG(e.target);
                    if (_this.isSlideElement(target) && mousedown) if (!_this.outer.hasClass("lg-dragging")) _this.closeGallery();
                }));
            }
        };
        LightGallery.prototype.closeGallery = function(force) {
            var _this = this;
            if (!this.lgOpened || !this.settings.closable && !force) return 0;
            this.LGel.trigger(lGEvents.beforeClose);
            if (this.settings.resetScrollPosition && !this.settings.hideScrollbar) $LG(window).scrollTop(this.prevScrollTop);
            var currentItem = this.items[this.index];
            var transform;
            if (this.zoomFromOrigin && currentItem) {
                var _a = this.mediaContainerPosition, top_4 = _a.top, bottom = _a.bottom;
                var _b = this.galleryItems[this.index], __slideVideoInfo = _b.__slideVideoInfo, poster = _b.poster;
                var imageSize = utils.getSize(currentItem, this.outer, top_4 + bottom, __slideVideoInfo && poster && this.settings.videoMaxSize);
                transform = utils.getTransform(currentItem, this.outer, top_4, bottom, imageSize);
            }
            if (this.zoomFromOrigin && transform) {
                this.outer.addClass("lg-closing lg-zoom-from-image");
                this.getSlideItem(this.index).addClass("lg-start-end-progress").css("transition-duration", this.settings.startAnimationDuration + "ms").css("transform", transform);
            } else {
                this.outer.addClass("lg-hide-items");
                this.outer.removeClass("lg-zoom-from-image");
            }
            this.destroyModules();
            this.lGalleryOn = false;
            this.isDummyImageRemoved = false;
            this.zoomFromOrigin = this.settings.zoomFromOrigin;
            clearTimeout(this.hideBarTimeout);
            this.hideBarTimeout = false;
            $LG("html").removeClass("lg-on");
            this.outer.removeClass("lg-visible lg-components-open");
            this.$backdrop.removeClass("in").css("opacity", 0);
            var removeTimeout = this.zoomFromOrigin && transform ? Math.max(this.settings.startAnimationDuration, this.settings.backdropDuration) : this.settings.backdropDuration;
            this.$container.removeClass("lg-show-in");
            setTimeout((function() {
                if (_this.zoomFromOrigin && transform) _this.outer.removeClass("lg-zoom-from-image");
                _this.$container.removeClass("lg-show");
                _this.resetScrollBar();
                _this.$backdrop.removeAttr("style").css("transition-duration", _this.settings.backdropDuration + "ms");
                _this.outer.removeClass("lg-closing " + _this.settings.startClass);
                _this.getSlideItem(_this.index).removeClass("lg-start-end-progress");
                _this.$inner.empty();
                if (_this.lgOpened) _this.LGel.trigger(lGEvents.afterClose, {
                    instance: _this
                });
                if (_this.$container.get()) _this.$container.get().blur();
                _this.lgOpened = false;
            }), removeTimeout + 100);
            return removeTimeout + 100;
        };
        LightGallery.prototype.initModules = function() {
            this.plugins.forEach((function(module) {
                try {
                    module.init();
                } catch (err) {
                    console.warn("lightGallery:- make sure lightGallery module is properly initiated");
                }
            }));
        };
        LightGallery.prototype.destroyModules = function(destroy) {
            this.plugins.forEach((function(module) {
                try {
                    if (destroy) module.destroy(); else module.closeGallery && module.closeGallery();
                } catch (err) {
                    console.warn("lightGallery:- make sure lightGallery module is properly destroyed");
                }
            }));
        };
        LightGallery.prototype.refresh = function(galleryItems) {
            if (!this.settings.dynamic) this.invalidateItems();
            if (galleryItems) this.galleryItems = galleryItems; else this.galleryItems = this.getItems();
            this.updateControls();
            this.openGalleryOnItemClick();
            this.LGel.trigger(lGEvents.updateSlides);
        };
        LightGallery.prototype.updateControls = function() {
            this.addSlideVideoInfo(this.galleryItems);
            this.updateCounterTotal();
            this.manageSingleSlideClassName();
        };
        LightGallery.prototype.destroyGallery = function() {
            this.destroyModules(true);
            if (!this.settings.dynamic) this.invalidateItems();
            $LG(window).off(".lg.global" + this.lgId);
            this.LGel.off(".lg");
            this.$container.remove();
        };
        LightGallery.prototype.destroy = function() {
            var closeTimeout = this.closeGallery(true);
            if (closeTimeout) setTimeout(this.destroyGallery.bind(this), closeTimeout); else this.destroyGallery();
            return closeTimeout;
        };
        return LightGallery;
    }();
    function lightGallery(el, options) {
        return new LightGallery(el, options);
    }
    const lightgallery_es5 = lightGallery;
    const galleries = document.querySelectorAll("[data-gallery]");
    if (galleries.length) {
        let galleyItems = [];
        galleries.forEach((gallery => {
            galleyItems.push({
                gallery,
                galleryClass: lightgallery_es5(gallery, {
                    licenseKey: "7EC452A9-0CFD441C-BD984C7C-17C8456E",
                    speed: 500,
                    download: false,
                    getCaptionFromTitleOrAlt: false
                })
            });
        }));
        modules_flsModules.gallery = galleyItems;
    }
    const script_anchors = Array.from(document.querySelectorAll("[data-goto-anchor]"));
    document.querySelectorAll("[data-goto-next]").forEach((next => {
        const anchor = script_anchors.find((anchor => next.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING));
        if (anchor) {
            next.setAttribute("href", `#${anchor.id}`);
            next.setAttribute("data-goto", `#${anchor.id}`);
            next.removeAttribute("data-goto-next", `#${anchor.id}`);
        } else next.remove();
    }));
    document.querySelectorAll("[data-phone-format]").forEach((element => {
        let phoneNumber = element.textContent.trim();
        if (/^\d{12}$/.test(phoneNumber)) element.textContent = `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10)}`;
    }));
    const script_elements = document.querySelectorAll("[data-dynamic-theme]");
    const firstHasLightClass = script_elements[0].classList.contains("_light");
    firstHasLightClass ? document.querySelector("header.header").classList.add("_dark") : null;
    script_elements.forEach(((el, i) => {
        if (firstHasLightClass ? i % 2 === 0 : i % 2 !== 0) el.classList.add("_light");
    }));
    isWebp();
    menuInit();
    pageNavigation();
    headerScroll();
})();