'use client';

import React, { useMemo, useRef, type ReactNode } from 'react';
import { useToast, type ToastDismissFn, type ToastCollisionBehavior } from '@astryxdesign/core/Toast';
import { Button } from '@astryxdesign/core/Button';

/**
 * Tunable defaults for the sonner→Astryx mapping. Edit these to change toast
 * behavior app-wide.
 */
export const TOAST_DEFAULTS = {
  /** success/info map to Astryx's 'info' type. Duration before auto-dismiss. */
  successDuration: 5000,
  infoDuration: 5000,
  /** warning maps to Astryx's 'error' type (for the color) but stays auto-hiding. */
  warningDuration: 5000,
  /** error maps to Astryx's 'error' type. Persists until dismissed by default,
   *  per Astryx's own guidance ("use error type for failures that need attention").
   *  Set errorAutoHide true to have errors auto-dismiss like the others. */
  errorAutoHide: false,
  errorDuration: 5000,
};

interface AppToastOptions {
  description?: ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
  uniqueID?: string;
  collisionBehavior?: ToastCollisionBehavior;
}

function composeBody(body: ReactNode, description?: ReactNode): ReactNode {
  if (!description) return body;
  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
    React.createElement('span', null, body),
    React.createElement('span', { style: { fontSize: '12px', opacity: 0.7, fontWeight: 400 } }, description)
  );
}

function endContentFor(action?: AppToastOptions['action']): ReactNode | undefined {
  if (!action) return undefined;
  return React.createElement(Button, { label: action.label, variant: 'ghost', size: 'sm', onClick: action.onClick });
}

/**
 * Drop-in replacement for sonner's `toast.success/error/warning/info/loading/dismiss`
 * API, backed by Astryx's `useToast()`. Astryx only ships `info`/`error` toast types,
 * so `success`→info and `warning`→error (auto-hiding, unlike error's default persist).
 */
export function useAppToast() {
  const show = useToast();
  const lastDismiss = useRef<ToastDismissFn | null>(null);

  return useMemo(() => ({
    success: (body: ReactNode, opts?: AppToastOptions) => show({
      body: composeBody(body, opts?.description),
      type: 'info',
      isAutoHide: true,
      autoHideDuration: opts?.duration ?? TOAST_DEFAULTS.successDuration,
      ...(opts?.action ? { endContent: endContentFor(opts.action) } : {}),
      ...(opts?.uniqueID ? { uniqueID: opts.uniqueID } : {}),
      ...(opts?.collisionBehavior ? { collisionBehavior: opts.collisionBehavior } : {}),
    }),
    error: (body: ReactNode, opts?: AppToastOptions) => show({
      body: composeBody(body, opts?.description),
      type: 'error',
      isAutoHide: opts?.duration ? true : TOAST_DEFAULTS.errorAutoHide,
      autoHideDuration: opts?.duration ?? TOAST_DEFAULTS.errorDuration,
      ...(opts?.action ? { endContent: endContentFor(opts.action) } : {}),
      ...(opts?.uniqueID ? { uniqueID: opts.uniqueID } : {}),
      ...(opts?.collisionBehavior ? { collisionBehavior: opts.collisionBehavior } : {}),
    }),
    warning: (body: ReactNode, opts?: AppToastOptions) => show({
      body: composeBody(body, opts?.description),
      type: 'error',
      isAutoHide: true,
      autoHideDuration: opts?.duration ?? TOAST_DEFAULTS.warningDuration,
      ...(opts?.action ? { endContent: endContentFor(opts.action) } : {}),
      ...(opts?.uniqueID ? { uniqueID: opts.uniqueID } : {}),
      ...(opts?.collisionBehavior ? { collisionBehavior: opts.collisionBehavior } : {}),
    }),
    info: (body: ReactNode, opts?: AppToastOptions) => show({
      body: composeBody(body, opts?.description),
      type: 'info',
      isAutoHide: true,
      autoHideDuration: opts?.duration ?? TOAST_DEFAULTS.infoDuration,
      ...(opts?.action ? { endContent: endContentFor(opts.action) } : {}),
      ...(opts?.uniqueID ? { uniqueID: opts.uniqueID } : {}),
      ...(opts?.collisionBehavior ? { collisionBehavior: opts.collisionBehavior } : {}),
    }),
    loading: (body: ReactNode) => {
      lastDismiss.current = show({ body, type: 'info', isAutoHide: false });
    },
    dismiss: () => {
      lastDismiss.current?.();
      lastDismiss.current = null;
    },
  }), [show]);
}
