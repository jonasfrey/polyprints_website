// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { o_state } from './index.js';

let o_component__background = {
    name: 'component-background',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'o_background',
        'v-on:click': 'f_toggle_nav',
        a_o: [
            {
                s_tag: 'div',
                class: 'o_background__hint',
                'v-show': 'b_show_hint',
                innerText: 'Click anywhere to toggle navigation',
            },
        ],
    })).outerHTML,
    data: function() {
        return {
            b_show_hint: true,
        };
    },
    methods: {
        f_toggle_nav: function() {
            o_state.b_ui_visible = !o_state.b_ui_visible;
            this.b_show_hint = false;
        },
    },
    unmounted: function() {
        o_state.b_ui_visible = true;
    },
};

export { o_component__background };
