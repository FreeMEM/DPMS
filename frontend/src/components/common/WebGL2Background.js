/**
 * WebGL2Background - Renders pure WebGL2 shaders as backgrounds
 *
 * This component allows loading any WebGL2/GLSL ES 3.0 shader (like from Shadertoy)
 * without needing to port them to Three.js.
 *
 * Standard uniforms provided:
 * - iTime: float - Time in seconds since start
 * - iResolution: vec3 - Viewport resolution (width, height, 1.0)
 * - iMouse: vec2 - Mouse position in pixels
 * - iFrame: int - Frame counter
 */

import React, { useRef, useEffect } from 'react';

// Default vertex shader for fullscreen quad (GLSL ES 3.0)
const DEFAULT_VERTEX_SHADER = `#version 300 es
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`;

// Wuhu Boxes raymarching shader - Original (cyan/blue)
const WUHU_BOXES_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform int iFrame;
uniform vec2 iMouse;

float gTime = 0.;
float REPEAT = 5.0;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c,s,-s,c);
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
  pos *= scale;
  float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
  pos.xy *= 5.;
  pos.y -= 3.5;
  pos.xy *= rot(.75);
  float result = -base;
  return result;
}

float box_set(vec3 pos, float iTime) {
  vec3 pos_origin = pos;
  pos = pos_origin;
  pos .y += sin(gTime * 0.4) * 2.5;
  pos.xy *=   rot(.8);
  float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  pos = pos_origin;
  pos .y -=sin(gTime * 0.4) * 2.5;
  pos.xy *=   rot(.8);
  float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  pos = pos_origin;
  pos .x +=sin(gTime * 0.4) * 2.5;
  pos.xy *=   rot(.8);
  float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  pos = pos_origin;
  pos .x -=sin(gTime * 0.4) * 2.5;
  pos.xy *=   rot(.8);
  float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  pos = pos_origin;
  pos.xy *=   rot(.8);
  float box5 = box(pos,.5) * 6.;
  pos = pos_origin;
  float box6 = box(pos,.5) * 6.;
  float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
  return result;
}

float map(vec3 pos, float iTime) {
  vec3 pos_origin = pos;
  float box_set1 = box_set(pos, iTime);
  return box_set1;
}

out vec4 fragColor;

void main() {
  vec2 p = (gl_FragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec3 ro = vec3(0., -0.2 ,iTime * 4.);
  vec3 ray = normalize(vec3(p, 1.5));
  ray.xy = ray.xy * rot(sin(iTime * .03) * 5.);
  ray.yz = ray.yz * rot(sin(iTime * .05) * .2);
  float t = 0.1;
  vec3 col = vec3(0.);
  float ac = 0.0;

  for (int i = 0; i < 99; i++){
    vec3 pos = ro + ray * t;
    pos = mod(pos-2., 4.) -2.;
    gTime = iTime -float(i) * 0.01;

    float d = map(pos, iTime);

    d = max(abs(d), 0.01);
    ac += exp(-d*23.);

    t += d* 0.55;
  }

  col = vec3(ac * 0.02);
  col +=vec3(0.,0.2 * abs(sin(iTime)),0.5 + sin(iTime) * 0.2);

  fragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (iTime)));
}`;

// Wuhu Boxes - Fire variant (orange/red, faster)
const WUHU_BOXES_FIRE_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform int iFrame;
uniform vec2 iMouse;

float gTime = 0.;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c,s,-s,c);
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
  pos *= scale;
  float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
  pos.xy *= 5.;
  pos.y -= 3.5;
  pos.xy *= rot(.75);
  return -base;
}

float box_set(vec3 pos) {
  vec3 pos_origin = pos;
  pos = pos_origin;
  pos.y += sin(gTime * 0.6) * 2.5;
  pos.xy *= rot(.8);
  float box1 = box(pos, 2. - abs(sin(gTime * 0.6)) * 1.5);
  pos = pos_origin;
  pos.y -= sin(gTime * 0.6) * 2.5;
  pos.xy *= rot(.8);
  float box2 = box(pos, 2. - abs(sin(gTime * 0.6)) * 1.5);
  pos = pos_origin;
  pos.x += sin(gTime * 0.6) * 2.5;
  pos.xy *= rot(.8);
  float box3 = box(pos, 2. - abs(sin(gTime * 0.6)) * 1.5);
  pos = pos_origin;
  pos.x -= sin(gTime * 0.6) * 2.5;
  pos.xy *= rot(.8);
  float box4 = box(pos, 2. - abs(sin(gTime * 0.6)) * 1.5);
  pos = pos_origin;
  pos.xy *= rot(.8);
  float box5 = box(pos, .5) * 6.;
  pos = pos_origin;
  float box6 = box(pos, .5) * 6.;
  return max(max(max(max(max(box1,box2),box3),box4),box5),box6);
}

float map(vec3 pos) {
  return box_set(pos);
}

out vec4 fragColor;

void main() {
  vec2 p = (gl_FragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec3 ro = vec3(0., -0.2, iTime * 6.);  // Faster movement
  vec3 ray = normalize(vec3(p, 1.5));
  ray.xy = ray.xy * rot(sin(iTime * .04) * 5.);
  ray.yz = ray.yz * rot(sin(iTime * .06) * .2);
  float t = 0.1;
  vec3 col = vec3(0.);
  float ac = 0.0;

  for (int i = 0; i < 99; i++){
    vec3 pos = ro + ray * t;
    pos = mod(pos-2., 4.) -2.;
    gTime = iTime - float(i) * 0.01;

    float d = map(pos);
    d = max(abs(d), 0.01);
    ac += exp(-d*23.);
    t += d * 0.55;
  }

  col = vec3(ac * 0.025);
  // Fire colors: orange/red/yellow
  col += vec3(0.6 + sin(iTime) * 0.2, 0.2 * abs(sin(iTime * 1.5)), 0.05);

  fragColor = vec4(col, 1.0 - t * (0.02 + 0.02 * sin(iTime)));
}`;

// Wuhu Boxes - Purple variant (purple/pink, slower and smoother)
const WUHU_BOXES_PURPLE_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform int iFrame;
uniform vec2 iMouse;

float gTime = 0.;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c,s,-s,c);
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
  pos *= scale;
  float base = sdBox(pos, vec3(.5,.5,.15)) / 1.5;  // Slightly larger boxes
  pos.xy *= 4.;
  pos.y -= 3.0;
  pos.xy *= rot(.6);
  return -base;
}

float box_set(vec3 pos) {
  vec3 pos_origin = pos;
  pos = pos_origin;
  pos.y += sin(gTime * 0.25) * 3.0;  // Slower, wider movement
  pos.xy *= rot(.7);
  float box1 = box(pos, 2.2 - abs(sin(gTime * 0.25)) * 1.2);
  pos = pos_origin;
  pos.y -= sin(gTime * 0.25) * 3.0;
  pos.xy *= rot(.7);
  float box2 = box(pos, 2.2 - abs(sin(gTime * 0.25)) * 1.2);
  pos = pos_origin;
  pos.x += sin(gTime * 0.25) * 3.0;
  pos.xy *= rot(.7);
  float box3 = box(pos, 2.2 - abs(sin(gTime * 0.25)) * 1.2);
  pos = pos_origin;
  pos.x -= sin(gTime * 0.25) * 3.0;
  pos.xy *= rot(.7);
  float box4 = box(pos, 2.2 - abs(sin(gTime * 0.25)) * 1.2);
  pos = pos_origin;
  pos.xy *= rot(.7);
  float box5 = box(pos, .6) * 5.;
  pos = pos_origin;
  float box6 = box(pos, .6) * 5.;
  return max(max(max(max(max(box1,box2),box3),box4),box5),box6);
}

float map(vec3 pos) {
  return box_set(pos);
}

out vec4 fragColor;

void main() {
  vec2 p = (gl_FragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec3 ro = vec3(0., -0.2, iTime * 2.5);  // Slower movement
  vec3 ray = normalize(vec3(p, 1.5));
  ray.xy = ray.xy * rot(sin(iTime * .02) * 4.);
  ray.yz = ray.yz * rot(sin(iTime * .03) * .15);
  float t = 0.1;
  vec3 col = vec3(0.);
  float ac = 0.0;

  for (int i = 0; i < 99; i++){
    vec3 pos = ro + ray * t;
    pos = mod(pos-2., 4.) -2.;
    gTime = iTime - float(i) * 0.01;

    float d = map(pos);
    d = max(abs(d), 0.01);
    ac += exp(-d * 20.);  // Softer glow
    t += d * 0.55;
  }

  col = vec3(ac * 0.02);
  // Purple/pink colors
  col += vec3(0.4 + sin(iTime * 0.5) * 0.2, 0.1, 0.5 + cos(iTime * 0.7) * 0.2);

  fragColor = vec4(col, 1.0 - t * (0.015 + 0.015 * sin(iTime)));
}`;

// Floating Spheres - Complex organic nebula with volumetric glow (Wuhu style, optimized)
const FLOATING_SPHERES_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec2 iMouse;

float gTime = 0.0;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float map(vec3 p) {
  float d = 1e10;

  // Central pulsing sphere
  float pulse = 0.8 + sin(gTime * 2.0) * 0.2;
  d = min(d, sdSphere(p, pulse));

  // Hollow shells
  d = min(d, abs(sdSphere(p, 1.8)) - 0.05);
  d = min(d, abs(sdSphere(p, 2.8)) - 0.03);

  // Two rotating rings
  vec3 p1 = p;
  p1.xy = rot(gTime * 0.3) * p1.xy;
  d = min(d, sdTorus(p1, vec2(1.3, 0.06)));

  vec3 p2 = p;
  p2.xz = rot(gTime * 0.25) * p2.xz;
  p2.xy = rot(1.57) * p2.xy;
  d = min(d, sdTorus(p2, vec2(1.3, 0.06)));

  // Orbital spheres (reduced from 6 to 4)
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float angle = fi * 1.57 + gTime * 0.2;
    vec3 offset = vec3(cos(angle) * 4.0, sin(gTime * 0.3 + fi) * 1.5, sin(angle) * 4.0);
    d = min(d, sdSphere(p - offset, 0.5));

    // One satellite per sphere (reduced from 3)
    float satAngle = gTime * 0.8 + fi;
    vec3 satOffset = offset + vec3(cos(satAngle) * 0.9, 0.0, sin(satAngle) * 0.9);
    d = min(d, sdSphere(p - satOffset, 0.15));
  }

  // Outer orbital layer (reduced from 8 to 5)
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float angle = fi * 1.256 + gTime * 0.4;
    vec3 offset = vec3(cos(angle) * 6.0, sin(gTime * 0.5 + fi) * 2.0, sin(angle) * 6.0);
    d = min(d, sdSphere(p - offset, 0.3));
  }

  // Simplified spiral energy (2 instead of 4)
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float spiralAngle = fi * 3.14 + p.y * 0.5 + gTime * 1.5;
    vec3 spiralPos = vec3(cos(spiralAngle) * 2.5, 0.0, sin(spiralAngle) * 2.5);
    d = min(d, length(p.xz - spiralPos.xz) - 0.03);
  }

  // Reduced debris (from 20 to 8)
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec3 offset = vec3(
      sin(fi * 1.234 + gTime * 0.1) * 7.0,
      cos(fi * 2.345 + gTime * 0.15) * 4.0,
      sin(fi * 3.456 + gTime * 0.12) * 7.0
    );
    d = min(d, sdSphere(p - offset, 0.06));
  }

  return d;
}

out vec4 fragColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

  // Camera circling the structure
  vec3 ro = vec3(sin(iTime * 0.15) * 12.0, cos(iTime * 0.1) * 4.0, cos(iTime * 0.15) * 12.0);

  // Look at center
  vec3 forward = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);
  vec3 rd = normalize(forward * 1.5 + right * uv.x + up * uv.y);

  float t = 0.1;
  float ac = 0.0;

  // Reduced iterations (from 100 to 64), larger step
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * t;
    gTime = iTime - float(i) * 0.01;

    float d = map(p);
    d = max(abs(d), 0.02);

    ac += exp(-d * 15.0);
    t += d * 0.7;
    if (t > 22.0) break;
  }

  // Simplified color calculation
  vec3 col = vec3(ac * 0.02);
  col += vec3(0.1, 0.5, 0.6) * ac * 0.025;
  col += vec3(0.2, 0.9, 1.0) * ac * ac * 0.0008;

  float alpha = clamp(1.0 - t * 0.03, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}`;

// Spinning Toroids - Complex interlocking ring system with volumetric glow (Wuhu style, optimized)
const SPINNING_TOROIDS_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec2 iMouse;

float gTime = 0.0;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  float d = 1e10;

  // Central ring system (4 main rings instead of 7)
  vec3 p1 = p;
  p1.xy = rot(gTime * 0.2) * p1.xy;
  d = min(d, sdTorus(p1, vec2(2.5, 0.3)));

  vec3 p2 = p;
  p2.xy = rot(1.57) * p2.xy;
  p2.xz = rot(gTime * 0.25) * p2.xz;
  d = min(d, sdTorus(p2, vec2(2.5, 0.25)));

  vec3 p3 = p;
  p3.xy = rot(0.785) * p3.xy;
  p3.yz = rot(gTime * 0.3) * p3.yz;
  d = min(d, sdTorus(p3, vec2(2.0, 0.2)));

  vec3 p4 = p;
  p4.xz = rot(gTime * 0.5) * p4.xz;
  d = min(d, sdTorus(p4, vec2(1.2, 0.12)));

  // Simplified helix (1 strand, 5 elements instead of 2x8)
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float angle = fi * 0.8 + gTime * 0.3;
    float yPos = fi * 1.2 - 2.4;
    vec3 offset = vec3(cos(angle) * 4.5, yPos, sin(angle) * 4.5);

    vec3 tp = p - offset;
    tp.xz = rot(angle) * tp.xz;
    tp.xy = rot(gTime * 0.4) * tp.xy;
    d = min(d, sdTorus(tp, vec2(0.4, 0.1)));
  }

  // Reduced orbital rings (3 instead of 4, no mini satellites)
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float orbitAngle = fi * 2.094 + gTime * 0.15;
    vec3 orbitPos = vec3(cos(orbitAngle) * 6.5, sin(gTime * 0.2 + fi) * 2.0, sin(orbitAngle) * 6.5);

    vec3 tp = p - orbitPos;
    tp.xz = rot(orbitAngle + 1.57) * tp.xz;
    tp.xy = rot(gTime * 0.6 + fi) * tp.xy;
    d = min(d, sdTorus(tp, vec2(0.7, 0.1)));
  }

  // Simplified energy spirals (2 instead of 6)
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float spiralAngle = fi * 3.14 + p.y * 0.8 + gTime * 2.0;
    vec3 spiralPos = vec3(cos(spiralAngle) * 2.2, 0.0, sin(spiralAngle) * 2.2);
    d = min(d, length(p.xz - spiralPos.xz) - 0.03);
  }

  // Reduced floating gems (6 instead of 12)
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec3 offset = vec3(
      sin(fi * 1.1 + gTime * 0.2) * 5.0,
      cos(fi * 0.9 + gTime * 0.25) * 3.0,
      sin(fi * 1.3 + gTime * 0.18) * 5.0
    );
    vec3 bp = p - offset;
    bp.xy = rot(gTime * 0.5 + fi) * bp.xy;
    d = min(d, sdBox(bp, vec3(0.12)));
  }

  return d;
}

out vec4 fragColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

  // Camera orbiting
  vec3 ro = vec3(sin(iTime * 0.12) * 13.0, cos(iTime * 0.08) * 5.0 + 2.0, cos(iTime * 0.12) * 13.0);

  // Look at center
  vec3 forward = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);
  vec3 rd = normalize(forward * 1.5 + right * uv.x + up * uv.y);

  float t = 0.1;
  float ac = 0.0;

  // Reduced iterations (from 110 to 70), larger step
  for (int i = 0; i < 70; i++) {
    vec3 p = ro + rd * t;
    gTime = iTime - float(i) * 0.008;

    float d = map(p);
    d = max(abs(d), 0.02);

    ac += exp(-d * 18.0);
    t += d * 0.6;
    if (t > 25.0) break;
  }

  // Simplified color calculation
  vec3 col = vec3(ac * 0.018);
  col += vec3(0.6, 0.4, 0.15) * ac * 0.025;
  col += vec3(1.0, 0.75, 0.3) * ac * ac * 0.001;
  col += vec3(1.0, 0.95, 0.85) * ac * ac * ac * 0.00003;

  float alpha = clamp(1.0 - t * 0.025, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}`;

// Crystal Pyramids - Octahedron/diamond shapes (cyan/white crystalline, optimized)
const CRYSTAL_PYRAMIDS_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec2 iMouse;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.577;
}

float map(vec3 p) {
  float d = 1e10;

  // Central rotating octahedron
  vec3 p1 = p;
  p1.xy = rot(iTime * 0.2) * p1.xy;
  p1.yz = rot(iTime * 0.15) * p1.yz;
  d = min(d, sdOctahedron(p1, 1.5));

  // Orbiting crystals (reduced from 6 to 4)
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float angle = fi * 1.57 + iTime * 0.3;
    vec3 offset = vec3(cos(angle) * 3.0, sin(iTime * 0.4 + fi) * 0.8, sin(angle) * 3.0);
    vec3 cp = p - offset;
    cp.xy = rot(iTime * 0.5 + fi) * cp.xy;
    d = min(d, sdOctahedron(cp, 0.5));
  }

  // Floating octahedrons (reduced from 8 pyramids to 5 octahedrons - simpler SDF)
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec3 offset = vec3(
      sin(iTime * 0.2 + fi * 1.2) * 4.0,
      cos(iTime * 0.3 + fi * 0.8) * 2.0,
      sin(iTime * 0.25 + fi * 1.5) * 4.0
    );
    vec3 pp = p - offset;
    pp.xy = rot(iTime * 0.6 + fi) * pp.xy;
    d = min(d, sdOctahedron(pp, 0.35));
  }

  return d;
}

out vec4 fragColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

  vec3 ro = vec3(0.0, 0.5, -9.0);
  vec3 rd = normalize(vec3(uv, 1.3));
  rd.xz = rot(sin(iTime * 0.15) * 0.5) * rd.xz;
  rd.yz = rot(cos(iTime * 0.12) * 0.25) * rd.yz;

  float t = 0.0;
  float glow = 0.0;

  // Reduced iterations (from 90 to 55)
  for (int i = 0; i < 55; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);

    glow += exp(-d * 7.0) * 0.022;
    if (d < 0.002 || t > 18.0) break;
    t += d * 0.85;
  }

  // Simplified color
  vec3 col = vec3(0.2, 0.5, 0.6) * glow;
  col += vec3(0.4, 0.8, 1.0) * glow * glow * 2.0;
  col += vec3(0.9, 0.95, 1.0) * glow * glow * glow * 2.0;

  fragColor = vec4(col, min(glow * 2.0, 0.95));
}`;

// Infinite Tunnel - Complex geometric tunnel with volumetric glow (Wuhu style)
const INFINITE_TUNNEL_SHADER = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec2 iMouse;

float gTime = 0.0;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.577;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float tunnelFrame(vec3 p) {
  // Octagonal tunnel frame
  float d = 1e10;

  // Main beams forming octagonal structure
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float angle = fi * 0.785 + gTime * 0.1;
    vec3 beamPos = vec3(cos(angle) * 2.2, sin(angle) * 2.2, 0.0);
    d = min(d, sdBox(p - beamPos, vec3(0.08, 0.08, 1.5)));
  }

  // Connecting rings
  d = min(d, abs(sdTorus(p.xzy, vec2(2.2, 0.06))) - 0.02);

  return d;
}

float innerStructures(vec3 p, float idZ) {
  float d = 1e10;

  // Central rotating octahedron
  vec3 p1 = p;
  p1.xy = rot(gTime * 0.5 + idZ) * p1.xy;
  p1.yz = rot(gTime * 0.3 + idZ * 0.5) * p1.yz;
  d = min(d, sdOctahedron(p1, 0.6 + sin(gTime + idZ) * 0.2));

  // Orbiting smaller shapes
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float orbitAngle = fi * 1.047 + gTime * 0.4 + idZ * 0.3;
    float orbitRadius = 1.0 + sin(gTime * 0.5 + fi) * 0.3;
    vec3 orbitPos = vec3(cos(orbitAngle) * orbitRadius, sin(orbitAngle) * orbitRadius, 0.0);

    vec3 op = p - orbitPos;
    op.xy = rot(gTime + fi) * op.xy;

    // Alternate between boxes and octahedrons
    if (i % 2 == 0) {
      d = min(d, sdBox(op, vec3(0.15 + sin(gTime * 0.7 + fi) * 0.05)));
    } else {
      d = min(d, sdOctahedron(op, 0.2 + cos(gTime * 0.6 + fi) * 0.05));
    }
  }

  // Floating ring
  vec3 p2 = p;
  p2.xy = rot(gTime * 0.2) * p2.xy;
  p2.xz = rot(gTime * 0.15 + idZ) * p2.xz;
  d = min(d, sdTorus(p2, vec2(1.4, 0.08)));

  return d;
}

float map(vec3 p) {
  // Infinite repetition along Z
  float cellZ = 5.0;
  float idZ = floor(p.z / cellZ);
  vec3 cellP = p;
  cellP.z = mod(p.z + cellZ * 0.5, cellZ) - cellZ * 0.5;

  // Twist tunnel based on depth
  float twist = idZ * 0.25 + gTime * 0.15;
  cellP.xy = rot(twist) * cellP.xy;

  // Tunnel frame
  float frame = tunnelFrame(cellP);

  // Inner structures
  float inner = innerStructures(cellP, idZ);

  // Combine
  float d = min(frame, inner);

  // Energy streams along the walls
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float streamAngle = fi * 1.57 + p.z * 0.3 + gTime * 2.0;
    vec3 streamPos = vec3(cos(streamAngle) * 2.0, sin(streamAngle) * 2.0, 0.0);
    d = min(d, length(cellP.xy - streamPos.xy) - 0.03);
  }

  return d;
}

out vec4 fragColor;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

  // Camera flying through tunnel
  vec3 ro = vec3(
    sin(iTime * 0.3) * 0.5,
    cos(iTime * 0.4) * 0.5,
    iTime * 4.0
  );

  vec3 rd = normalize(vec3(p, 1.5));
  rd.xy = rot(sin(iTime * 0.2) * 0.15) * rd.xy;
  rd.xz = rot(cos(iTime * 0.15) * 0.1) * rd.xz;

  float t = 0.1;
  vec3 col = vec3(0.0);
  float ac = 0.0;

  // Raymarching with volumetric accumulation (Wuhu style)
  for (int i = 0; i < 120; i++) {
    vec3 pos = ro + rd * t;
    gTime = iTime - float(i) * 0.008;

    float d = map(pos);
    d = max(abs(d), 0.01);

    // Accumulate glow
    ac += exp(-d * 20.0);

    t += d * 0.5;
    if (t > 30.0) break;
  }

  // Base volumetric color
  col = vec3(ac * 0.02);

  // Dynamic neon colors based on time
  float phase = iTime * 0.3;
  vec3 color1 = vec3(
    0.5 + 0.5 * sin(phase),
    0.5 + 0.5 * sin(phase + 2.094),
    0.5 + 0.5 * sin(phase + 4.188)
  );
  vec3 color2 = vec3(
    0.5 + 0.5 * cos(phase * 0.7),
    0.5 + 0.5 * cos(phase * 0.7 + 2.094),
    0.5 + 0.5 * cos(phase * 0.7 + 4.188)
  );

  col += mix(color1, color2, sin(iTime * 0.5) * 0.5 + 0.5) * ac * 0.03;

  // Add white hot core
  col += vec3(1.0) * pow(ac * 0.02, 2.0) * 0.5;

  float alpha = 1.0 - t * (0.02 + 0.01 * sin(iTime));
  alpha = clamp(alpha, 0.0, 1.0);

  fragColor = vec4(col, alpha);
}`;

// Available shaders
export const WEBGL2_SHADERS = {
  'wuhu-boxes': {
    name: 'Wuhu Boxes',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: WUHU_BOXES_SHADER,
  },
  'wuhu-boxes-fire': {
    name: 'Wuhu Boxes Fire',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: WUHU_BOXES_FIRE_SHADER,
  },
  'wuhu-boxes-purple': {
    name: 'Wuhu Boxes Purple',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: WUHU_BOXES_PURPLE_SHADER,
  },
  'floating-spheres': {
    name: 'Floating Spheres',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: FLOATING_SPHERES_SHADER,
  },
  'spinning-toroids': {
    name: 'Spinning Toroids',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: SPINNING_TOROIDS_SHADER,
  },
  'crystal-pyramids': {
    name: 'Crystal Pyramids',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: CRYSTAL_PYRAMIDS_SHADER,
  },
  'infinite-tunnel': {
    name: 'Infinite Tunnel',
    vertexShader: DEFAULT_VERTEX_SHADER,
    fragmentShader: INFINITE_TUNNEL_SHADER,
  },
};

const WebGL2Background = ({ shaderName = 'wuhu-boxes', style = {} }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get shader configuration
    const shaderConfig = WEBGL2_SHADERS[shaderName];
    if (!shaderConfig) {
      console.error(`WebGL2Background: Unknown shader "${shaderName}"`);
      return;
    }

    // Initialize WebGL2
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }
    glRef.current = gl;

    // Compile vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderConfig.vertexShader);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
      return;
    }

    // Compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderConfig.fragmentShader);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    programRef.current = program;

    // Get uniform locations
    const uniforms = {
      iTime: gl.getUniformLocation(program, 'iTime'),
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iFrame: gl.getUniformLocation(program, 'iFrame'),
      iMouse: gl.getUniformLocation(program, 'iMouse'),
    };

    // Handle resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Handle mouse move
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = rect.height - (e.clientY - rect.top) - 1;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation loop
    const animate = () => {
      const time = (Date.now() - startTimeRef.current) / 1000;
      frameRef.current++;

      gl.uniform1f(uniforms.iTime, time);
      gl.uniform1i(uniforms.iFrame, frameRef.current);
      gl.uniform2f(uniforms.iMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [shaderName]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        ...style,
      }}
    />
  );
};

export default WebGL2Background;
