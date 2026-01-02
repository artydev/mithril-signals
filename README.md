# Mithril-Signals

A tiny (~1KB) reactive signal system for Mithril.js. 

Inspired by **usignal** by Andrea Giammarchi, this library provides fine-grained reactivity and automatic dependency tracking, while hooking directly into Mithril's `m.redraw()` cycle.

## Features
- **Automatic Redraws**: Signal updates trigger batched `requestAnimationFrame` redraws.
- **Memory Safe**: Effects automatically unsubscribe from signals when re-run or disposed.
- **Recursion Guard**: Built-in re-entrancy protection and `.peek()` method to prevent infinite loops.
- **Glitch-free**: Computeds only re-evaluate when dependencies truly change.

## API
- `signal(value)`: Create reactive state.
- `signal.peek()`: Read value without subscribing.
- `computed(fn)`: Derive state with automatic caching.
- `effect(fn)`: Create side effects.
- `batch(fn)`: Group multiple updates into one redraw.

## Installation
```bash
npm install
npm run dev