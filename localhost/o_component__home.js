// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";

let o_component__home = {
    name: 'component-home',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'o_home',
        a_o: [
            {
                s_tag: 'h1',
                innerText: 'PolyPrints',
            },
        ],
    })).outerHTML,
};

export { o_component__home };
