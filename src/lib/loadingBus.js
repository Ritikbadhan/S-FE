"use client";

let activeRequests = 0;
const listeners = new Set();

function emit() {
  const isLoading = activeRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
}

export function startGlobalLoading() {
  activeRequests += 1;
  emit();
}

export function stopGlobalLoading() {
  activeRequests = Math.max(0, activeRequests - 1);
  emit();
}

export function subscribeGlobalLoading(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }
  listeners.add(listener);
  listener(activeRequests > 0);
  return () => listeners.delete(listener);
}

