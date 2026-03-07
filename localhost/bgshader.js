// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.
let o_canvas = document.getElementById('background');
let o_gl = o_canvas.getContext('webgl', { antialias: true, alpha: false });

// --- Config ---
let n_num_points = 150;
let n_connection_dist = 0.28;
let n_point_size = 3.0;
let n_wander_radius = 0.025;
let n_grid_padding = 0.3;

// --- Shaders ---
let s_vert__line = `
  attribute vec2 a_pos;
  attribute float a_alpha;
  varying float v_alpha;
  uniform vec2 u_resolution;
  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = a_pos;
    p.x /= aspect;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    gl_Position.x *= aspect;
    v_alpha = a_alpha;
  }
`;
let s_frag__line = `
  precision mediump float;
  varying float v_alpha;
  uniform vec3 u_color_a;
  uniform vec3 u_color_b;
  uniform float u_time;
  void main() {
    vec3 col = mix(u_color_a, u_color_b, v_alpha * 0.5 + 0.5 * sin(u_time * 0.4));
    gl_FragColor = vec4(col, v_alpha * 0.45);
  }
`;
let s_vert__point = `
  attribute vec2 a_pos;
  attribute float a_bright;
  varying float v_bright;
  uniform vec2 u_resolution;
  uniform float u_point_size;
  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = a_pos;
    p.x /= aspect;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    gl_Position.x *= aspect;
    gl_PointSize = u_point_size * (0.6 + a_bright * 0.6);
    v_bright = a_bright;
  }
`;
let s_frag__point = `
  precision mediump float;
  varying float v_bright;
  uniform vec3 u_color_a;
  uniform vec3 u_color_b;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float glow = 1.0 - d;
    glow = pow(glow, 1.5);
    vec3 col = mix(u_color_a, u_color_b, v_bright);
    gl_FragColor = vec4(col, glow * (0.6 + v_bright * 0.4));
  }
`;

let f_o_shader__compile = function(s_src, n_type) {
    let o_shader = o_gl.createShader(n_type);
    o_gl.shaderSource(o_shader, s_src);
    o_gl.compileShader(o_shader);
    if (!o_gl.getShaderParameter(o_shader, o_gl.COMPILE_STATUS))
        console.error(o_gl.getShaderInfoLog(o_shader));
    return o_shader;
};
let f_o_prog = function(s_vs, s_fs) {
    let o_prog = o_gl.createProgram();
    o_gl.attachShader(o_prog, f_o_shader__compile(s_vs, o_gl.VERTEX_SHADER));
    o_gl.attachShader(o_prog, f_o_shader__compile(s_fs, o_gl.FRAGMENT_SHADER));
    o_gl.linkProgram(o_prog);
    return o_prog;
};

let o_prog__line = f_o_prog(s_vert__line, s_frag__line);
let o_prog__point = f_o_prog(s_vert__point, s_frag__point);

// --- Uniform locations ---
let o_uniforms__line = {
    u_resolution: o_gl.getUniformLocation(o_prog__line, 'u_resolution'),
    u_color_a:    o_gl.getUniformLocation(o_prog__line, 'u_color_a'),
    u_color_b:    o_gl.getUniformLocation(o_prog__line, 'u_color_b'),
    u_time:       o_gl.getUniformLocation(o_prog__line, 'u_time'),
};
let o_uniforms__point = {
    u_resolution: o_gl.getUniformLocation(o_prog__point, 'u_resolution'),
    u_color_a:    o_gl.getUniformLocation(o_prog__point, 'u_color_a'),
    u_color_b:    o_gl.getUniformLocation(o_prog__point, 'u_color_b'),
    u_point_size: o_gl.getUniformLocation(o_prog__point, 'u_point_size'),
};

// --- Attribute locations ---
let n_loc__line_pos   = o_gl.getAttribLocation(o_prog__line, 'a_pos');
let n_loc__line_alpha = o_gl.getAttribLocation(o_prog__line, 'a_alpha');
let n_loc__point_pos    = o_gl.getAttribLocation(o_prog__point, 'a_pos');
let n_loc__point_bright = o_gl.getAttribLocation(o_prog__point, 'a_bright');

// --- Buffers ---
let o_buf__line_pos   = o_gl.createBuffer();
let o_buf__line_alpha = o_gl.createBuffer();
let o_buf__point_pos    = o_gl.createBuffer();
let o_buf__point_bright = o_gl.createBuffer();

// --- Points on an aspect-ratio-aware grid larger than screen ---
let a_o_point = [];

let f_init_grid = function() {
    let n_aspect = window.innerWidth / window.innerHeight;
    let n_rows = Math.round(Math.sqrt(n_num_points / n_aspect));
    let n_cols = Math.round(n_rows * n_aspect);
    a_o_point = [];
    for (let r = 0; r < n_rows; r++) {
        for (let c = 0; c < n_cols; c++) {
            let n_hx = -n_grid_padding + (c + 0.5) / n_cols * (1.0 + 2.0 * n_grid_padding);
            let n_hy = -n_grid_padding + (r + 0.5) / n_rows * (1.0 + 2.0 * n_grid_padding);
            a_o_point.push({
                n_home_x: n_hx,
                n_home_y: n_hy,
                n_x: n_hx,
                n_y: n_hy,
                n_bright: Math.random(),
                n_phase: Math.random() * Math.PI * 2,
                n_freq_x: 0.08 + Math.random() * 0.12,
                n_freq_y: 0.08 + Math.random() * 0.12,
            });
        }
    }
};
f_init_grid();

// --- Resize ---
let f_resize = function() {
    o_canvas.width = window.innerWidth * devicePixelRatio;
    o_canvas.height = window.innerHeight * devicePixelRatio;
    o_gl.viewport(0, 0, o_canvas.width, o_canvas.height);
    f_init_grid();
};
window.addEventListener('resize', f_resize);
f_resize();

// --- Color palette: deep teal → electric cyan ---
let a_col_a = [0.1, 0.6, 0.75];
let a_col_b = [0.4, 0.9, 1.0];

// --- Blending ---
o_gl.enable(o_gl.BLEND);
o_gl.blendFunc(o_gl.SRC_ALPHA, o_gl.ONE_MINUS_SRC_ALPHA);

// --- Animation ---
let n_id__raf = 0;

let f_loop = function(n_ms) {
    let n_time = n_ms * 0.001;
    let n_aspect = o_canvas.width / o_canvas.height;

    // Update points
    for (let o of a_o_point) {
        o.n_x = o.n_home_x + Math.sin(n_time * o.n_freq_x + o.n_phase) * n_wander_radius
                            + Math.sin(n_time * o.n_freq_x * 0.4 + o.n_phase * 2.0) * n_wander_radius * 0.3;
        o.n_y = o.n_home_y + Math.cos(n_time * o.n_freq_y + o.n_phase) * n_wander_radius
                            + Math.cos(n_time * o.n_freq_y * 0.5 + o.n_phase * 1.5) * n_wander_radius * 0.3;
        o.n_bright = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(n_time * 0.3 + o.n_phase));
    }

    // Build line data
    let a_line_pos = [];
    let a_line_alpha = [];

    for (let i = 0; i < a_o_point.length; i++) {
        for (let j = i + 1; j < a_o_point.length; j++) {
            let o_a = a_o_point[i], o_b = a_o_point[j];
            let n_dx = (o_a.n_x - o_b.n_x) * n_aspect;
            let n_dy = o_a.n_y - o_b.n_y;
            let n_d = Math.sqrt(n_dx * n_dx + n_dy * n_dy);
            if (n_d < n_connection_dist) {
                let n_alpha = 1.0 - n_d / n_connection_dist;
                a_line_pos.push(o_a.n_x, o_a.n_y, o_b.n_x, o_b.n_y);
                a_line_alpha.push(n_alpha * o_a.n_bright, n_alpha * o_b.n_bright);
            }
        }
    }

    // Build point data
    let a_point_pos = [];
    let a_point_bright = [];
    for (let o of a_o_point) {
        a_point_pos.push(o.n_x, o.n_y);
        a_point_bright.push(o.n_bright);
    }

    // --- Draw ---
    o_gl.clearColor(0.035, 0.035, 0.07, 1.0);
    o_gl.clear(o_gl.COLOR_BUFFER_BIT);

    let a_res = [o_canvas.width, o_canvas.height];

    // Lines
    if (a_line_pos.length > 0) {
        o_gl.useProgram(o_prog__line);
        o_gl.uniform2fv(o_uniforms__line.u_resolution, a_res);
        o_gl.uniform3fv(o_uniforms__line.u_color_a, a_col_a);
        o_gl.uniform3fv(o_uniforms__line.u_color_b, a_col_b);
        o_gl.uniform1f(o_uniforms__line.u_time, n_time);

        o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buf__line_pos);
        o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_line_pos), o_gl.DYNAMIC_DRAW);
        o_gl.enableVertexAttribArray(n_loc__line_pos);
        o_gl.vertexAttribPointer(n_loc__line_pos, 2, o_gl.FLOAT, false, 0, 0);

        o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buf__line_alpha);
        o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_line_alpha), o_gl.DYNAMIC_DRAW);
        o_gl.enableVertexAttribArray(n_loc__line_alpha);
        o_gl.vertexAttribPointer(n_loc__line_alpha, 1, o_gl.FLOAT, false, 0, 0);

        o_gl.drawArrays(o_gl.LINES, 0, a_line_pos.length / 2);
    }

    // Points
    o_gl.useProgram(o_prog__point);
    o_gl.uniform2fv(o_uniforms__point.u_resolution, a_res);
    o_gl.uniform3fv(o_uniforms__point.u_color_a, a_col_a);
    o_gl.uniform3fv(o_uniforms__point.u_color_b, a_col_b);
    o_gl.uniform1f(o_uniforms__point.u_point_size, n_point_size * devicePixelRatio);

    o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buf__point_pos);
    o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_point_pos), o_gl.DYNAMIC_DRAW);
    o_gl.enableVertexAttribArray(n_loc__point_pos);
    o_gl.vertexAttribPointer(n_loc__point_pos, 2, o_gl.FLOAT, false, 0, 0);

    o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buf__point_bright);
    o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_point_bright), o_gl.DYNAMIC_DRAW);
    o_gl.enableVertexAttribArray(n_loc__point_bright);
    o_gl.vertexAttribPointer(n_loc__point_bright, 1, o_gl.FLOAT, false, 0, 0);

    o_gl.drawArrays(o_gl.POINTS, 0, a_o_point.length);

    n_id__raf = requestAnimationFrame(f_loop);
};

// --- Bouncing clock ---
let o_clock = document.getElementById('clock');
let n_bx = Math.random() * (window.innerWidth - 150);
let n_by = Math.random() * (window.innerHeight - 30);
let n_bvx = 0.4 + Math.random() * 0.3;
let n_bvy = 0.3 + Math.random() * 0.3;
o_clock.style.top = n_by + 'px';
o_clock.style.left = n_bx + 'px';

let f_update_clock = function() {
    let o_now = new Date();
    let s_s = String(o_now.getSeconds()).padStart(2, '0');
    let s_ms = String(o_now.getMilliseconds()).padStart(3, '0');
    o_clock.textContent = s_s + ':' + s_ms;
    requestAnimationFrame(f_update_clock);
};
f_update_clock();

let f_bounce_clock = function() {
    let o_rect = o_clock.getBoundingClientRect();
    let n_w = o_rect.width;
    let n_h = o_rect.height;

    n_bx += n_bvx;
    n_by += n_bvy;

    if (n_bx <= 0) { n_bx = 0; n_bvx = Math.abs(n_bvx); }
    if (n_bx + n_w >= window.innerWidth) { n_bx = window.innerWidth - n_w; n_bvx = -Math.abs(n_bvx); }
    if (n_by <= 0) { n_by = 0; n_bvy = Math.abs(n_bvy); }
    if (n_by + n_h >= window.innerHeight) { n_by = window.innerHeight - n_h; n_bvy = -Math.abs(n_bvy); }

    o_clock.style.left = n_bx + 'px';
    o_clock.style.top = n_by + 'px';

    requestAnimationFrame(f_bounce_clock);
};
f_bounce_clock();

window.addEventListener('resize', function() {
    n_bx = Math.min(n_bx, window.innerWidth - 100);
    n_by = Math.min(n_by, window.innerHeight - 30);
});

let f_start = function() {
    n_id__raf = requestAnimationFrame(f_loop);
};

let f_stop = function() {
    cancelAnimationFrame(n_id__raf);
};

export {
    f_start,
    f_stop,
    n_id__raf,
};
