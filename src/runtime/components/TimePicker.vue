<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import ClockDial from "./ClockDial.vue";

const DEBUG = false;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

const hourMinute = defineModel<{ hour: number, minute: number }>('hourMinute')
const is24h = defineModel<boolean>('is24h')

const safeHourMinute = computed(() => {
  const h = hourMinute.value?.hour ?? 0
  const m = hourMinute.value?.minute ?? 0
  debugLog('TimePicker.vue safeHourMinute: ', hourMinute.value ?? {hour: 0, minute: 0});
  return {hour: h, minute: m}
})

const safeHour = computed(() => {
  const h = hourMinute.value?.hour ?? 0
  debugLog('TimePicker.vue safeHour: ', h);
  return h;
})

const paddedHour = computed(() => {
  const h = hourMinute.value?.hour ?? 0
  debugLog('TimePicker.vue paddedHour: ', String(h).padStart(2, '0'));
  return `${String(h).padStart(2, '0')}`
})

const safeMinute = computed(() => {
  const m = hourMinute.value?.minute ?? 0
  debugLog('TimePicker.vue safeMinute: ', m);
  return m;
})

const paddedMinute = computed(() => {
  const m = hourMinute.value?.minute ?? 0
  debugLog('TimePicker.vue paddedMinute: ', String(m).padStart(2, '0'));
  return `${String(m).padStart(2, '0')}`
})

const safeIs24h = computed(() => {
  debugLog('TimePicker.vue safeIs24h: ', is24h.value ?? true);
  return is24h.value ?? true
})

const ampmHour = computed(() => {
  if (hourMinute.value) {
    let x = hourMinute.value.hour;
    if (x > 12) {
      x -= 12;
    } else if (x === 0) {
      x = 12;
    }
    return x
  } else return 0;
})

const open = ref(false)
const selecting = ref<'hour' | 'minute'>('hour')
const pm = ref(false)

pm.value = safeHourMinute.value.hour >= 12

var primaryColor = '';
var secondaryColor = '';
var neutralColor = '';
var textColor = '';

onMounted(() => {
  const root = getComputedStyle(document.documentElement);
  primaryColor = root.getPropertyValue('--ui-color-primary-500').trim();
  secondaryColor = root.getPropertyValue('--ui-color-secondary-500').trim();
  neutralColor = root.getPropertyValue('--ui-color-neutral-200').trim();
  textColor = root.getPropertyValue('--ui-color-neutral-700').trim();
  debugLog("primaryColor: ", primaryColor);
})

const pmLabel = computed(() => {
  debugLog('TimePicker.vue pmLabel: ', pm.value ? 'PM' : 'AM');
  return pm.value ? 'PM' : 'AM';
})

watch(() => hourMinute.value, () => {
  debugLog('TimePicker.vue watch hourMinute.value: ', hourMinute.value);
  if (hourMinute.value) {
    pm.value = hourMinute.value.hour >= 12;
  }
})

watch(() => hourMinute.value?.hour, () => {
  if (hourMinute.value) {
    if (hourMinute.value.hour === 24) {
      hourMinute.value.hour = 0;
    }
    pm.value = hourMinute.value.hour >= 12;
  }
  debugLog('TimePicker.vue watch hourMinute.value.hour: ', hourMinute.value?.hour);
})

watch(() => hourMinute.value?.minute, () => {
  debugLog('TimePicker.vue watch hourMinute.value.minute: ', hourMinute.value?.minute);
})

watch(() => pm.value, () => {
  debugLog("TimePicker.vue watch pm.value: ", pm.value, hourMinute.value?.hour, ':',
    hourMinute.value?.minute);
  if (hourMinute.value) {
    const updated = {...hourMinute.value}
    debugLog(' if (hourMinute.value) ...');
    if (pm.value) {
      debugLog('if pm.value ...');
      if (hourMinute.value.hour <= 12) {
        debugLog('if hourMinute.value.hour <= 12 ...');
        updated.hour += 12
      }
    } else {
      debugLog('else pm.value ...');
      if (hourMinute.value.hour >= 12) {
        debugLog('if hourMinute.value.hour >= 12 ...');
        updated.hour -= 12
      }
    }
    hourMinute.value = updated // 🛠️ Reassign to trigger reactivity
  }
})

watch(open, (val) => {
  selecting.value = 'hour'
})

function onClockSelect(value: number) {
  if (hourMinute.value) {
    const updated = {...hourMinute.value}
    debugLog('in if hourMinute.value: ', hourMinute.value);
    if (selecting.value === 'hour') {
      updated.hour = value
      if (pm.value && !is24h.value) {
        updated.hour += 12;
      }
      // selecting.value = 'minute'
    } else {
      updated.minute = value
      // selecting.value = 'hour'
    }
    hourMinute.value = updated // 🛠️ Reassign to trigger reactivity
    debugLog("TimePicker onClockSelect: ", hourMinute.value, 'selecting: ', selecting.value);
  }
}

function switchMode() {
  debugLog('TimePicker.vue switchMode: ', selecting.value);
  if (selecting.value === 'hour') {
    selecting.value = 'minute'
  } else {
    selecting.value = 'hour'
  }
}

function switchToMinutes() {
  debugLog('TimePicker.vue switchMode: ', selecting.value);
  if (selecting.value === 'hour') {
    selecting.value = 'minute'
  } else {
    open.value = false
  }
}

function onUpdateAmPm(value: boolean) {
  debugLog('TimePicker.vue onUpdateAmPm: ', value);
  pm.value = safeHour.value >= 12;
}

function confirm() {
  debugLog('TimePicker.vue emit update:hourMinute', {...localTime.value});
  emit('update:hourMinute', {...localTime.value})

}

function activeTabClass(tab: 'hour' | 'minute') {
  return tab === selecting.value
    ? 'text-neutral-100 text-5xl font-bold'
    : 'text-neutral-100 text-5xl'
}

</script>

<template>
  <!--  <div class="bg-prim h-32 w-32">Hello</div>-->
  <UPopover v-model:open="open">
    <UButton icon="i-lucide-clock-3" size="md" color="primary" variant="solid"/>
    <template #content class="w-125 flex flex-col items-center justify-center">
      <!-- Time Display 24h -->
      <div v-if="is24h" :style="{ backgroundColor: primaryColor }"
           class="flex flex-row items-center justify-center gap-4 text-neutral-100 p-2">
        <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
          {{ safeHour }}
        </button>
        <span class="text-5xl font-semibold">:</span>
        <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
          {{ paddedMinute }}
        </button>
      </div>
      <!-- Time Display AM/PM -->
      <div v-if="!is24h" :style="{ backgroundColor: primaryColor }"
           class="flex flex-row items-center justify-center align-center gap-4 text-neutral-100 p-2">
        <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
          {{ ampmHour }}
        </button>
        <span class=" text-5xl font-semibold text-center align-middle text-neutral-100">:</span>
        <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
          {{ paddedMinute }}
        </button>
        <button @click="selecting = 'minute'" class="text-2xl font-semibold text-neutral-100">
          {{ pm ? 'PM' : 'AM' }}
        </button>
      </div>

      <!-- Format Switch -->
      <div class="flex flex-row gap-2 items-center justify-center p-2">
        <USwitch class="w-10" v-model="is24h"/>
        <div class="text-lg text-center w-15">{{ is24h ? '24h' : 'AM/PM' }}</div>
        <UCheckbox v-if="!is24h" class="w-10" v-model="pm" :label="pmLabel"/>
        <div v-else class="w-10"></div>
      </div>
      <div class="w256 h256">
        <!-- Clock Dial -->
        <ClockDial
          :mode="selecting"
          :hour="safeHour"
          :minute="safeMinute"
          :is24h="safeIs24h"
          :pm="pm"
          @update="onClockSelect"
          @updatePm="onUpdateAmPm"
          @switch="switchToMinutes"
        />
      </div>
      <div class="flex flex-row gap-2 items-center justify-center p-2">
        <UButton v-if="selecting === 'hour'" class="w-full justify-center" color="primary" @click="switchMode">Switch to minutes</UButton>
        <UButton v-if="selecting === 'minute'" class="w-full justify-center" color="primary" @click="switchMode">Switch to hours</UButton>
      </div>
    </template>
  </UPopover>
</template>

<style>
.text-5xl {
  font-size: 3rem; /* 48px */
  line-height: 1;
}

.font-semibold {
  font-weight: 600;
}

.text-2xl {
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
}

.font-bold {
  font-weight: 700;
}

.text-neutral-100 {
  color: #f5f5f5;
}

.text-neutral-100 {
  color: #f5f5f5;
}

.text-primary {
  color: oklch(69.6% 0.17 162.48);
}

.w256 {
  width: 256px;
}

.h256 {
  height: 256px;
}

</style>
