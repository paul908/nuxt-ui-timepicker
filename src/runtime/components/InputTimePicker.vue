<script setup lang="ts">
import {ref, computed, watch, onMounted, toRefs, useAttrs} from 'vue'
import ClockDial from "./ClockDial.vue";

const time = defineModel<string>('time')
const is24h = defineModel<boolean>('is24h')

// capture "extra" attributes like inputClass, variant, etc.
const attrs = useAttrs()

const DEBUG = false;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

function formatTime(hour: number, minute: number): string {
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  debugLog('InputTimePicker formatTime: ', hh, ':', mm, `${hh}:${mm}`);
  return `${hh}:${mm}`;
}

const setLocalTime = (time: string | undefined) => {
  const strValue: string = time ?? '00:00';
  debugLog('InputTimePicker setLocalTime => time.value: ', strValue);
  const [hhStr, mmStr] = strValue.split(":");
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  pm.value = hh >= 12;
  if (hh ===24) {
    localHour.value = 0;
  } else{
    localHour.value = hh;
  }
  localMinute.value = mm;
}

const open = ref(false)
const selecting = ref<'hour' | 'minute'>('hour')
const localHour = ref(0)
const localMinute = ref(0)
const pm = ref(false)
setLocalTime(time.value);

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

const safeIs24h = computed(() => {
  debugLog('TimePicker.vue safeIs24h: ', is24h.value ?? true);
  return is24h.value ?? true
})

const pmLabel = computed(() => {
  return pm.value ? 'PM' : 'AM';
})

const paddedTime = computed(() => ({
  hour: localHour.value.toString().padStart(2, '0'),
  minute: localMinute.value.toString().padStart(2, '0')
}))

const ampmHour = computed(() => {
  let x = localHour.value;
  if (x > 12) {
    x -= 12;
  } else if (x === 0 || x === 24) {
    x = 12;
  }
  return x
})

watch(() => time.value, () => {
  debugLog('InputTimePicker watch(() => time.value: ', time.value);
  setLocalTime(time.value);
})

watch(() => pm.value, () => {
  if (pm.value) {
    if (localHour.value <= 12) {
      localHour.value += 12
    }
  } else {
    if (localHour.value >= 12) {
      localHour.value -= 12
    }
  }
  if (localHour.value === 24) {
    localHour.value = 0;
  }
  time.value = formatTime(localHour.value, localMinute.value);
  debugLog("InputTimePicker.vue watch pm.value: ", pm.value, localHour.value, ':', localMinute.value,
    ' - time.value: ', time.value);
})

watch(open, (val) => {
  selecting.value = 'hour'
})

function onClockSelect(value: number) {
  if (selecting.value === 'hour') {
    localHour.value = value
    if (pm.value && !is24h.value) {
      localHour.value += 12;
    }
    // selecting.value = 'minute'
  } else {
    localMinute.value = value
    // selecting.value = 'hour'
  }
  time.value = formatTime(localHour.value, localMinute.value);
  debugLog("InputTimePicker onClockSelect: ", localHour.value, ':', localMinute.value, 'time: ', time.value);
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
    open.value = false;
  }
}

function onUpdateAmPm(value: boolean) {
  debugLog('InputTimePicker.vue onUpdateAmPm: ', value);
  pm.value = localHour.value >= 12;
}

function activeTabClass(tab: 'hour' | 'minute') {
  return tab === selecting.value
    ? 'text-neutral-100 font-bold text-5xl'
    : 'text-neutral-100 text-5xl'
}

</script>

<template>
  <div class="flex flex-row m-4">
    <UTooltip text="Click on icon for entering the time">
      <UInput type="text" v-bind="attrs" v-model="time"/>
    </UTooltip>
    <UPopover v-model:open="open">
      <UButton icon="i-lucide-clock-3" size="md" color="primary" variant="solid"/>
      <template #content class="w-125 flex flex-col items-center justify-center">
        <!-- Time Display 24h -->
        <div v-if="is24h" :style="{ backgroundColor: primaryColor }"
             class="flex flex-row items-center justify-center gap-4 text-neutral-100 p-2">
          <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
            {{ localHour }}
          </button>
          <span class="text-5xl font-semibold">:</span>
          <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
            {{ paddedTime.minute }}
          </button>
        </div>
        <!-- Time Display AM/PM -->
        <div v-if="!is24h" :style="{ backgroundColor: primaryColor }"
             class="flex flex-row items-center justify-center align-center gap-4 text-neutral-100 p-2">
          <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
            {{ ampmHour }}
          </button>
          <span class="text-5xl font-semibold text-center align-middle">:</span>
          <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
            {{ paddedTime.minute }}
          </button>
          <button @click="selecting = 'minute'" class="text-2xl font-semibold">
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
          :hour="localHour"
          :minute="localMinute"
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
