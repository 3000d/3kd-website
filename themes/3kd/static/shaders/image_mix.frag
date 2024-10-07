#ifdef GL_ES
precision mediump float;
#endif

const float INTENSITY = 5.0;

varying vec2 vTextureCoord;

uniform float u_offset;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_progress;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform float u_hasTex1; // 0.0 or 1.0
uniform float u_hasTex2;

highp float tv_noise(vec2 st) {
    highp float c = 4378.5453;
    vec2 mouse = u_mouse / u_resolution;
    mouse += 0.1;
    highp float dt= dot(st.xy, vec2(1.0, 7.0) * mouse);
    return fract(sin(dt) * c);
}

void main() {
    vec2 st = (gl_FragCoord.xy - vec2(u_offset, 0)) / u_resolution.xy;
    st.y = 1.0 - st.y;

    // noise when no texture
    float noise = tv_noise(st + u_time / 10.0);
    vec4 no_tex = vec4(vec3(noise * 0.2), 1.0);

    vec4 d1 = mix(no_tex, texture2D(u_tex1, st), u_hasTex1);
    vec4 d2 = mix(no_tex, texture2D(u_tex2, st), u_hasTex2);

    // Mouse position
//    vec2 offset = vec2(0.0);
//    float lens_radius = min(0.3 * u_resolution.x, 250.0);
//    // Calculate the direction to the mouse position and the distance
//    vec2 mouse_direction = u_mouse - gl_FragCoord.xy;
//    float mouse_distance = length(mouse_direction);
//
//    if (mouse_distance < lens_radius) {
//        // Calculate the pixel offset
//        float exp = 1.0;
//        offset = vec2(200.0, 0.0);
//    }

    // displacement on scroll
    float displace1 = (d1.r + d1.g + d1.b) * .5;
    float displace2 = (d2.r + d2.g + d2.b) * .5;
    vec4 t1 = mix(no_tex, texture2D(u_tex1, vec2(st.x, st.y + u_progress * (displace1 * INTENSITY))), u_hasTex1);
    vec4 t2 = mix(no_tex, texture2D(u_tex2, vec2(st.x, st.y + (1.0 - u_progress) * (displace2 * INTENSITY))), u_hasTex2);

    gl_FragColor = mix(t1, t2, u_progress);
}