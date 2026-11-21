"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAraStore, VortexShape } from "@/store/useAraStore";
import { hexToRgb } from "@/lib/theme/palettes";
import { VORTEX_VERTEX_SHADER, VORTEX_FRAGMENT_SHADER } from "./shaders";

function generateGeometryPositions(shape: VortexShape, count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const rNorm = Math.random();
    let x = 0, y = 0, z = 0;

    if (shape === "tensor-toroid") {
      const p = 3;
      const q = 7;
      const t = u;
      const braid = 2.15 + 0.85 * Math.cos(q * t);
      const tubeR = 0.52 + 0.36 * Math.sin(p * t + v);
      const scatter = (Math.random() - 0.5) * 0.42;
      x = (braid + tubeR * Math.cos(v)) * Math.cos(p * t * 0.333) + scatter;
      y = (braid + tubeR * Math.cos(v)) * Math.sin(p * t * 0.333) + scatter;
      z = tubeR * Math.sin(v) * 2.2 + 0.9 * Math.sin(q * t) + scatter;
    } else if (shape === "black-hole") {
      if (i % 7 === 0) {
        const h = (Math.random() - 0.5) * 7.2;
        const rad = 0.14 + Math.abs(h) * 0.18 * Math.random();
        x = Math.cos(u) * rad;
        y = h;
        z = Math.sin(u) * rad;
      } else {
        const rad = 1.25 + Math.pow(rNorm, 1.45) * 3.8;
        const spiral = u + rad * 1.45;
        const thickness = (Math.random() - 0.5) * (0.28 / (rad * 0.45));
        x = Math.cos(spiral) * rad;
        y = thickness + Math.sin(rad * 2.0) * 0.12;
        z = Math.sin(spiral) * rad;
      }
    } else if (shape === "quantum-helix") {
      const strand = i % 3;
      const h = (rNorm - 0.5) * 6.8;
      const theta = h * 1.9 + (strand * Math.PI * 2) / 3;
      const rad = 1.65 + (Math.random() - 0.5) * 0.55;
      x = Math.cos(theta) * rad;
      y = h;
      z = Math.sin(theta) * rad;
    } else if (shape === "harmonic-sphere") {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const harmonic = 2.4 + 0.72 * Math.sin(5 * phi) * Math.cos(4 * theta);
      const rad = harmonic + (Math.random() - 0.5) * 0.22;
      x = rad * Math.sin(phi) * Math.cos(theta);
      y = rad * Math.cos(phi);
      z = rad * Math.sin(phi) * Math.sin(theta);
    } else if (shape === "lorenz-chaos") {
      const t = (i / count) * 40.0;
      const lobe = i % 2 === 0 ? 1 : -1;
      const rad = 1.1 + 1.5 * Math.sin(t * 0.7 + rNorm * 3.0);
      x = lobe * 1.35 + Math.cos(u) * rad * 0.85 + (Math.random() - 0.5) * 0.35;
      y = Math.sin(u) * rad * 1.1 + (Math.random() - 0.5) * 0.35;
      z = Math.sin(u * 2.0) * 1.45 + (Math.random() - 0.5) * 0.4;
    } else {
      const arm = i % 4;
      const rad = Math.pow(rNorm, 0.75) * 4.4;
      const angle = rad * 1.7 + (arm * Math.PI) / 2 + (Math.random() - 0.5) * 0.45;
      x = Math.cos(angle) * rad;
      y = (Math.random() - 0.5) * (0.95 * Math.exp(-rad * 0.45));
      z = Math.sin(angle) * rad;
    }

    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  }

  return arr;
}

const WebGLVortexLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vortex = useAraStore((s) => s.vortex);
  const theme = useAraStore((s) => s.theme);
  const mouseMode = useAraStore((s) => s.mouseMode);
  const cameraResetSignal = useAraStore((s) => s.cameraResetSignal);
  const isThinking = useAraStore((s) => s.isThinking);

  const stateRef = useRef({ vortex, theme, mouseMode, isThinking });
  stateRef.current = { vortex, theme, mouseMode, isThinking };

  const cameraStateRef = useRef({
    rotX: 0.22,
    rotY: 0.4,
    targetRotX: 0.22,
    targetRotY: 0.4,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    zoom: 7.4,
    targetZoom: 7.4,
  });

  useEffect(() => {
    cameraStateRef.current.targetRotX = 0.22;
    cameraStateRef.current.targetRotY = 0.4;
    cameraStateRef.current.targetPanX = 0;
    cameraStateRef.current.targetPanY = 0;
    cameraStateRef.current.targetZoom = 7.4;
  }, [cameraResetSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const count = Math.min(120000, Math.max(10000, stateRef.current.vortex.particleCount));
    const geometry = new THREE.BufferGeometry();
    const positions = generateGeometryPositions(stateRef.current.vortex.shape, count);
    const seeds = new Float32Array(count);
    const layers = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random();
      layers[i] = (i % 10) / 10;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(positions.slice(), 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));

    const a1 = hexToRgb(stateRef.current.theme.accentPrimary);
    const a2 = hexToRgb(stateRef.current.theme.accentSecondary);

    const uniforms = {
      uTime: { value: 0 },
      uPointSize: { value: stateRef.current.vortex.particleSize },
      uSharpness: { value: stateRef.current.vortex.sharpness },
      uTurbulence: { value: stateRef.current.vortex.turbulence },
      uAudioEnergy: { value: 0.12 },
      uThinkingBoost: { value: 0 },
      uTwist: { value: stateRef.current.vortex.twistDeg },
      uHue: { value: stateRef.current.vortex.hue },
      uWhiteCoreMix: { value: stateRef.current.vortex.whiteCoreMix },
      uIsLightMode: { value: stateRef.current.theme.colorMode === "light" ? 1.0 : 0.0 },
      uOpacity: { value: stateRef.current.vortex.opacity },
      uAccent1: { value: new THREE.Vector3(a1.r / 255, a1.g / 255, a1.b / 255) },
      uAccent2: { value: new THREE.Vector3(a2.r / 255, a2.g / 255, a2.b / 255) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VORTEX_VERTEX_SHADER,
      fragmentShader: VORTEX_FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending:
        stateRef.current.theme.colorMode === "light" ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const coreGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: stateRef.current.theme.accentSecondary });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    let isDragging = false;
    let dragPan = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragPan = e.button === 2 || e.shiftKey || stateRef.current.mouseMode === "pan";
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (dragPan) {
        cameraStateRef.current.targetPanX += dx * 0.008;
        cameraStateRef.current.targetPanY -= dy * 0.008;
      } else {
        cameraStateRef.current.targetRotY += dx * 0.0065;
        cameraStateRef.current.targetRotX += dy * 0.0065;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraStateRef.current.targetZoom = Math.min(
        16,
        Math.max(3.2, cameraStateRef.current.targetZoom + e.deltaY * 0.005)
      );
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("contextmenu", onContextMenu);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let rafId = 0;
    let currentShape = stateRef.current.vortex.shape;
    let currentMode = stateRef.current.theme.colorMode;
    let thinkingSmooth = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const st = stateRef.current;

      if (currentShape !== st.vortex.shape) {
        currentShape = st.vortex.shape;
        const nextPos = generateGeometryPositions(currentShape, count);
        geometry.setAttribute("position", new THREE.BufferAttribute(nextPos, 3));
        geometry.setAttribute("aTarget", new THREE.BufferAttribute(nextPos.slice(), 3));
      }

      if (currentMode !== st.theme.colorMode) {
        currentMode = st.theme.colorMode;
        material.blending = currentMode === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
        material.needsUpdate = true;
      }

      thinkingSmooth += ((st.isThinking ? 1 : 0) - thinkingSmooth) * 0.06;

      const c1 = hexToRgb(st.theme.accentPrimary);
      const c2 = hexToRgb(st.theme.accentSecondary);
      uniforms.uAccent1.value.set(c1.r / 255, c1.g / 255, c1.b / 255);
      uniforms.uAccent2.value.set(c2.r / 255, c2.g / 255, c2.b / 255);
      coreMat.color.set(st.theme.accentSecondary);

      uniforms.uTime.value += dt * st.vortex.speed * (1 + thinkingSmooth * 0.9);
      uniforms.uPointSize.value = st.vortex.particleSize;
      uniforms.uSharpness.value = st.vortex.sharpness;
      uniforms.uTurbulence.value = st.vortex.turbulence;
      uniforms.uTwist.value = st.vortex.twistDeg;
      uniforms.uHue.value = st.vortex.hue;
      uniforms.uWhiteCoreMix.value = st.vortex.whiteCoreMix;
      uniforms.uIsLightMode.value = st.theme.colorMode === "light" ? 1.0 : 0.0;
      uniforms.uOpacity.value = st.vortex.opacity;
      uniforms.uAudioEnergy.value = st.vortex.audioFftEnabled ? st.vortex.audioEnergy : 0.1;
      uniforms.uThinkingBoost.value = thinkingSmooth;

      const cs = cameraStateRef.current;
      if (!isDragging) {
        cs.targetRotY += dt * 0.11 * st.vortex.speed;
      }
      cs.rotX += (cs.targetRotX - cs.rotX) * 0.08;
      cs.rotY += (cs.targetRotY - cs.rotY) * 0.08;
      cs.panX += (cs.targetPanX - cs.panX) * 0.08;
      cs.panY += (cs.targetPanY - cs.panY) * 0.08;
      cs.zoom += (cs.targetZoom - cs.zoom) * 0.08;

      points.rotation.x = cs.rotX;
      points.rotation.y = cs.rotY;
      points.position.set(cs.panX, cs.panY, 0);
      coreMesh.position.set(cs.panX, cs.panY, 0);
      camera.position.z = cs.zoom;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, [vortex.particleCount]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 cursor-grab active:cursor-grabbing select-none"
      aria-label="Ara OS 12+ 3D GPU Particle Vortex"
    />
  );
};

export const VortexCanvas: React.FC = () => {
  const vortexEnabled = useAraStore((s) => s.vortex.enabled);
  const backdropStyle = useAraStore((s) => s.theme.backdropStyle);
  const backdropIntensity = useAraStore((s) => s.theme.backdropIntensity);

  const backdropClass =
    backdropStyle === "solid" ? "" : `ara-backdrop-${backdropStyle}`;

  return (
    <>
      {/* Global Theme Background + Optional Ambient Pattern */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-300"
        style={{ backgroundColor: "var(--ara-bg)" }}
      >
        {backdropClass && (
          <div
            className={`absolute inset-0 ${backdropClass} transition-opacity duration-300`}
            style={{ opacity: vortexEnabled ? backdropIntensity * 0.45 : backdropIntensity }}
          />
        )}
      </div>

      {/* Unmounts WebGL completely (0% GPU) when user disables the vortex */}
      {vortexEnabled && <WebGLVortexLayer />}
    </>
  );
};
