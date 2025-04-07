<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import ClockDial from "./ClockDial.vue";

const DEBUG = true;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

// const time = defineModel<string>('time')
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

// const props = defineProps<{
//   is24h: boolean
//   hourMinute: { hour: number; minute: number }
// }>()
//
// const emit = defineEmits<{
//   (e: 'update:hourMinute', value: { hour: number; minute: number }): void,
//   (e: 'update24h:format', value: boolean): void
// }>()


const selecting = ref<'hour' | 'minute'>('hour')
// const localTime = ref({...hourMinute.value})
// const format24h = ref(is24h.value ?? true)
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
  console.log("primaryColor: ", primaryColor);
})

// const pm = computed<boolean>(() => {
//   if (hourMinute.value) {
//     return hourMinute.value.hour >= 12;
//   } else return false;
// })

const pmLabel = computed(() => {
  debugLog('TimePicker.vue pmLabel: ', pm.value ? 'PM' : 'AM');
  return pm.value ? 'PM' : 'AM';
})

// const paddedTime = computed(() => ({
//   hour: localTime.value.hour.toString().padStart(2, '0'),
//   minute: localTime.value.minute.toString().padStart(2, '0')
// }))

const pmTime = computed(() => {
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

watch(() => hourMinute.value, () => {
  debugLog('TimePicker.vue watch hourMinute.value: ', hourMinute.value);
  // localTime.value = {...hourMinute.value}
  // pm.value = localTime.value.hour >= 12;
})

watch(() => hourMinute.value?.hour, () => {
  debugLog('TimePicker.vue watch hourMinute.value.hour: ', hourMinute.value?.hour);
  // localTime.value = {...hourMinute.value}
  // pm.value = localTime.value.hour >= 12;
})

watch(() => hourMinute.value?.minute, () => {
  debugLog('TimePicker.vue watch hourMinute.value.minute: ', hourMinute.value?.minute);
  // localTime.value = {...hourMinute.value}
  // pm.value = localTime.value.hour >= 12;
})

// watch(() => is24h.value, () => {
//   format24h.value = is24h.value
//   debugLog('TimePicker.vue watch is24h.value format.value = is24h.value: ', format24h.value);
// })

// watch(() => format24h.value, () => {
//   debugLog('TimePicker.vue watch format24h.value: ', format24h.value);
//   if (!format24h.value) {
//     pm.value = localTime.value.hour >= 12
//   }
//   emit('update24h:format', format24h.value);
// })

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
  // confirm();
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
      selecting.value = 'minute'
    } else {
      updated.minute = value
      selecting.value = 'hour'
    }
    hourMinute.value = updated // 🛠️ Reassign to trigger reactivity
    debugLog("TimePicker onClockSelect: ", hourMinute.value, 'selecting: ', selecting.value);
  }
  // confirm();
}

function onUpdateAmPm(value: boolean) {
  debugLog('TimePicker.vue onUpdateAmPm: ', value);
  pm.value = value
}

// function confirm() {
//   debugLog('TimePicker.vue emit update:hourMinute', {...localTime.value});
//   emit('update:hourMinute', {...localTime.value})
//
// }

function activeTabClass(tab: 'hour' | 'minute') {
  return tab === selecting.value
    ? 'text-neutral-100 text-5xl font-bold'
    : 'text-neutral-100 text-5xl'
}

</script>

<template>
  <!--  <div class="bg-prim h-32 w-32">Hello</div>-->
  <UPopover>
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
          {{ safeHour }}
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

      <!-- Clock Dial -->
      <ClockDial
        :mode="selecting"
        :hour="safeHour"
        :minute="safeMinute"
        :is24h="safeIs24h"
        :pm="pm"
        @update="onClockSelect"
        @updatePm="onUpdateAmPm"
      />
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
</style>
