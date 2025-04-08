<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, toRefs, useAttrs } from 'vue'
import {formatHex} from 'culori';

const props = defineProps<{
  mode: 'hour' | 'minute'
  is24h: boolean
  hour: number
  minute: number
  pm: boolean
}>()

const root = getComputedStyle(document.documentElement);
const primaryColor = root.getPropertyValue('--ui-color-primary-500').trim();
const secondaryColor = root.getPropertyValue('--ui-color-secondary-500').trim();
const neutralColor = root.getPropertyValue('--ui-color-neutral-200').trim();
const textColor = root.getPropertyValue('--ui-color-neutral-700').trim();
const RADIUS_BIG_FACTOR = 0.42;
const RADIUS_SMALL_FACTOR = 0.26;
const BETWEEN_BIG_SMALL = (RADIUS_BIG_FACTOR + RADIUS_SMALL_FACTOR) / 2;
const BETWEEN_ZERO_SMALL = RADIUS_SMALL_FACTOR - (RADIUS_BIG_FACTOR - RADIUS_SMALL_FACTOR) / 2;
const DOT_RADIUS_FACTOR = 0.065;
const DEBUG = false;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'updatePm', value: boolean): void
  (e: 'switch'): void
}>()

const canvasRef = ref<HTMLCanvasElement>()
const index = ref<number>(0)
const lastHour = ref<number>(props.hour)
const lastMinute = ref<number>(props.minute)
setIndex();
// draw();

let primary = formatHex(primaryColor) ?? "#808080";
let secondary = formatHex(secondaryColor) ?? "#808080";
let neutral = formatHex(neutralColor) ?? "#808080";
let textCol = formatHex(textColor) ?? "#000000";

onMounted(() => {
  // we do it this way because of violation warning in chrome:
  // [Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event.
  // Consider marking event handler as 'passive' to make the page more responsive.
  // See https://www.chromestatus.com/feature/5745543795965952
  const canvas = canvasRef.value

  if (canvas) {

    draw();

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
  }

})

onBeforeUnmount(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchmove', onTouchMove)
    canvas.removeEventListener('touchend', onTouchEnd)
  }
})

watch(() => [props.mode, props.hour, props.minute, props.is24h], () => {
  debugLog("watch props.mode, props.hour, props.minute, props.is24h");
  setIndex();
  draw();
})

watch(index, () => {
  debugLog("watch index: ", index.value);
  draw()
})

watch(() => [props.pm], () => {
})

function setIndex() {
  debugLog('setIndex()');
  if (props.mode === 'hour')
    if (props.is24h) {
      index.value = props.hour;
    } else {
      if (props.hour > 12) {
        updatePm(true);
        index.value = props.hour - 12;
      } else {
        updatePm(false);
        index.value = props.hour;
        if (props.hour == 0) {
          index.value = 0;
          updatePm(false);
        }
        if (props.hour == 12) {
          index.value = 0;
          updatePm(true);
        }
      }
    }
  if (props.mode === 'minute') {
    index.value = props.minute;
  }
  debugLog('setIndex() index.value: ', index.value);
}

function updatePm(value: boolean) {
  debugLog('updatePm', value)
  emit('updatePm', value)
}

function drawRoundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  debugLog('drawRoundedRect()');
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function draw() {
  debugLog('draw()');
  const el = canvasRef.value
  if (!el) return

  const ctx = el.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  el.width = 256 * dpr
  el.height = 256 * dpr
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
  const width = el.width = el.offsetWidth
  const height = el.height = el.offsetHeight
  const x_center = width / 2;
  const y_center = height / 2;
  const radiusBig = RADIUS_BIG_FACTOR * width;
  const radiusSmall = RADIUS_SMALL_FACTOR * width;
  const dotRadius = DOT_RADIUS_FACTOR * width;

  ctx.clearRect(0, 0, width, height)

  // Draw circular background inside canvas
  ctx.beginPath()
  ctx.arc(128, 128, 128, 0, 2 * Math.PI)
  ctx.fillStyle = neutral // Tailwind neutral-200
  ctx.fill()

  const steps = props.mode === 'hour'
      ? (props.is24h ? 24 : 12)
      : 60

  // Draw center rectangle
  let halfSide = 15;
  let x1 = 0.0;
  let y1 = 0.0;
  if (props.mode === 'hour') {
    x1 = width / 2 - halfSide * 2;
    y1 = height / 2 - halfSide;
    drawRoundedRect(ctx, x1, y1, halfSide * 4, halfSide * 2, 6);
  } else {
    x1 = width / 2 - halfSide * 2.5;
    y1 = height / 2 - halfSide;
    drawRoundedRect(ctx, x1, y1, halfSide * 5, halfSide * 2, 6);
  }

  ctx.fillStyle = primary;
  ctx.fill(); // Render the path

  // hours draw
  if (props.mode === 'hour') {
    if (!props.is24h) {  // mode AM/PM hour 1 --> 12
      for (let i = 0; i < steps; i++) {
        if (index.value !== i) {
          const angle = (i / steps) * Math.PI * 2
          const x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig
          const y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig

          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = neutral;
          ctx.fill()

          ctx.fillStyle = textCol;
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (props.pm) {
            if (i == 0 || i == 12) {
              ctx.fillText('12', x, y)
            } else {
              ctx.fillText(i >= 0 && i < 13 ? i.toString() : (i + 12).toString(), x, y)
            }
          } else {
            if (i == 0 || i == 12) {
              ctx.fillText('12', x, y)
            } else {
              ctx.fillText(i.toString(), x, y)
            }
          }
        }
      }
    }
    if (props.is24h) {  // mode 24h - hour 0 --> 23
      for (let i = 0; i < steps; i++) {
        let i_index = 0;
        if (index.value === 12) {
          i_index = 0;
        } else if (index.value === 0) {
          i_index = 12;
        } else {
          i_index = index.value;
        }
        if (i_index !== i) {
          const angle = ((2 * i) / steps) * Math.PI * 2
          let x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig;
          let y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig;
          if (i >= 12) {
            x = x_center + Math.cos(angle - Math.PI / 2) * radiusSmall
            y = y_center + Math.sin(angle - Math.PI / 2) * radiusSmall
          }

          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = neutral;
          ctx.fill()

          ctx.fillStyle = textCol;
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (i == 0) {
            ctx.fillText('12', x, y)
          } else if (i == 12) {
            ctx.fillText('0', x, y)
          } else {
            ctx.fillText(i.toString(), x, y)
          }
        }
      }
    }
  }
  // highlighted hours draw
  if (props.mode === 'hour') {
    if (!props.is24h) {
      for (let i = 0; i < steps; i++) {
        if (index.value === i) {
          const angle = (i / steps) * Math.PI * 2
          const x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig
          const y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig

          // Set line color and width
          ctx.beginPath();
          ctx.moveTo(x_center, y_center);
          ctx.lineTo(x, y);
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = primary;
          ctx.fill()

          ctx.fillStyle = 'white';
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (i == 0 || i == 12) {
            ctx.fillText('12', x, y)
          } else if (props.pm && !props.is24h) {
            ctx.fillText(i >= 0 && i < 13 ? i.toString() : (i + 12).toString(), x, y)
          } else {
            ctx.fillText(i.toString(), x, y)
          }
        }
      }
    }
    if (props.is24h) {
      debugLog('steps: ', steps);
      for (let i = 0; i < steps; i++) {
        let i_index = 0;
        if (index.value === 12) {
          i_index = 0;
        } else if (index.value === 0) {
          i_index = 12;
        } else {
          i_index = index.value;
        }
        if (i_index === i) {
          const angle = ((2 * i) / steps) * Math.PI * 2
          let x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig;
          let y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig;
          if (i >= 12) {
            x = x_center + Math.cos(angle - Math.PI / 2) * radiusSmall
            y = y_center + Math.sin(angle - Math.PI / 2) * radiusSmall
          }

          // Set line color and width
          ctx.beginPath();
          ctx.moveTo(x_center, y_center);
          ctx.lineTo(x, y);
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = primary;
          ctx.fill()

          ctx.fillStyle = 'white';
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (i == 0) {
            ctx.fillText('12', x, y)
          } else if (i == 12) {
            ctx.fillText('0', x, y)
          } else {
            ctx.fillText(i.toString(), x, y)
          }
        }
      }
    }
  }

  if (props.mode === 'minute') {
    // minutes draw
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig
      const y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig
      if (props.mode === 'minute') {
        if (i !== index.value && i % 5 === 0) {
          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = neutral;
          ctx.fill()
          ctx.fillStyle = textCol;
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(i.toString(), x, y)
        }
      }
    }
    // highlighted draw of minutes
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const x = x_center + Math.cos(angle - Math.PI / 2) * radiusBig
      const x1 = x_center + Math.cos(angle - Math.PI / 2) * (x_center - dotRadius)
      const y = y_center + Math.sin(angle - Math.PI / 2) * radiusBig
      const y1 = y_center + Math.sin(angle - Math.PI / 2) * (x_center - dotRadius)
      if (props.mode === 'minute') {
        if (i === index.value) {
          ctx.beginPath();
          ctx.moveTo(x_center, y_center);
          ctx.lineTo(x1, y1);
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = primary;
          ctx.fill()
          ctx.fillStyle = 'white';
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(i.toString(), x, y)
        }
      }
    }
  }

  // Draw center text
  ctx.fillStyle = 'white';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(props.mode, x_center, y_center);
}

function move(clientX: number, clientY: number) {
  const el = canvasRef.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!canvasRef.value || !rect) return

  const x = clientX - rect.left
  const y = clientY - rect.top
  const cx = rect.width / 2
  const cy = rect.height / 2
  const dx = x - cx
  const dy = y - cy
  let angle = Math.atan2(dy, dx) + Math.PI / 2;
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  const radius = Math.sqrt(dx * dx + dy * dy);
  // debugLog('radius: ', radius);
  const steps = props.mode === 'hour'
      ? (props.is24h ? 12 : 12)
      : 60
  const stepAngle = (Math.PI * 2) / steps

  if (props.mode === 'hour') {
    if (props.is24h) {  // 24h mode
      if (radius >= rect.width * BETWEEN_BIG_SMALL) {
        index.value = Math.round(angle / stepAngle)
        if (index.value >= steps) index.value = 0
        if (index.value < 0) index.value += steps
      } else if (radius >= rect.width * BETWEEN_ZERO_SMALL && radius < rect.width * BETWEEN_BIG_SMALL) {
        index.value = Math.round(angle / stepAngle)
        index.value += 12;
      }
      if (index.value === 12) {
        index.value = 0;
      } else if (index.value === 0) {
        index.value = 12;
      }
    } else {  // AM/PM mode
      if (radius >= rect.width * BETWEEN_BIG_SMALL) {
        if (!props.pm) {  // AM mode
          index.value = Math.round(angle / stepAngle)
          if (index.value >= steps) index.value = 0
          if (index.value < 0) index.value += steps
        } else {  // PM mode
          index.value = Math.round(angle / stepAngle)
          if (index.value >= steps) index.value = 0
          if (index.value < 0) index.value += steps
        }
      }
    }
  } else if (props.mode === 'minute') {
    if (radius >= rect.width * BETWEEN_BIG_SMALL) {
      index.value = Math.round(angle / stepAngle)
      if (index.value >= steps) index.value = 0
      if (index.value < 0) index.value += steps
    }
  }
  emitIndex();
}

function onMouseMove(e: MouseEvent) {
  e.preventDefault();
  move(e.clientX, e.clientY);
  debugLog('onMousemove() index.value: ', index.value);
}

function onTouchStart(e: TouchEvent) {
  e.preventDefault();
  if (e.touches[0]) {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    move(clientX, clientY);
  }
  debugLog('onTouchMove() index.value: ', index.value);
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (e.touches[0]) {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    move(clientX, clientY);
  }
  debugLog('onTouchMove() index.value: ', index.value);
}

function emitIndex() {
  if (props.mode === 'hour') {
    lastHour.value = index.value;
  } else if (props.mode === 'minute') {
    lastMinute.value = index.value;
  }
  emit('update', index.value)
}

function emitSwitch() {
  {
    emit('switch');
  }
}

function onClick(e: MouseEvent) {
  e.preventDefault();
  debugLog('click');
  emitIndex();
  emitSwitch();
}

function onTouchEnd(e: TouchEvent) {
  e.preventDefault();
  debugLog('click');
  emitIndex();
  emitSwitch();
}
</script>

<template>
  <div class="m-2">
    <canvas
      ref="canvasRef"
      class="w256 h256 bg-neutral-200 dark:bg-neutral-800 rounded-full"
      @click="onClick"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<style>
.w256 {
  width: 256px;
}

.h256 {
  height: 256px;
}
</style>
