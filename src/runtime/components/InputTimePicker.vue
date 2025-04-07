<script setup lang="ts">
import { ref, computed, watch, onMounted, toRefs, useAttrs } from 'vue'
import ClockDial from "./ClockDial.vue";


// const model = defineModel<string>('12:00')
const stime = defineModel<string>('stime');
const is24h = defineModel<boolean>('is24h')

// const props = defineProps<{
//   is24h: boolean
// }>()

// const emit = defineEmits<{
//   (e: 'update24h:format', value: boolean): void
// }>()


// capture "extra" attributes like inputClass, variant, etc.
const attrs = useAttrs()

const DEBUG = true;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

function formatTime(hour: number, minute: number): string {
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  debugLog('formatTime: ', hh, ':', mm, `${hh}:${mm}`);
  return `${hh}:${mm}`;
}

const selecting = ref<'hour' | 'minute'>('hour')
const localHour = ref(0)
const localMinute = ref(0)
const format24h = ref(props.is24h ?? true)
const pm = ref(false)
pm.value = localHour.value >= 12

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

const pmLabel = computed(() => {
  return pm.value ? 'PM' : 'AM';
})

const paddedTime = computed(() => ({
  hour: localHour.value.toString().padStart(2, '0'),
  minute: localMinute.value.toString().padStart(2, '0')
}))

const pmTime = computed(() => {
  let x = localHour.value;
  if (x > 12) {
    x -= 12;
  } else if (x === 0) {
    x = 12;
  }
  return x
})

watch(() => stime.value, () => {
  debugLog('InputTimePicker watch(() => stime: ', stime.value);
  const strValue: string = stime.value ?? '00:00';
  const [hhStr, mmStr] = strValue.split(":");
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  pm.value = hh >= 12;
})

watch(() => props.is24h, () => {
  format24h.value = props.is24h;
  debugLog('InputTimePicker.vue watch props.is24h format.value = props.is24h: ', format24h.value);
})

watch(() => format24h.value, () => {
  if (!format24h.value) {
    pm.value = localHour.value >= 12
  }
  // emit('update24h:format', format24h.value);
  debugLog('InputTimePicker.vue watch format24h.value emit update24h:format', format24h.value);
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
  stime.value = formatTime(localHour.value, localMinute.value);
  debugLog("InputTimePicker.vue watch pm.value: ", pm.value, localHour.value, ':', localMinute.value,
    ' - sTime.value: ', stime.value);
})

function onClockSelect(value: number) {
  if (selecting.value === 'hour') {
    localHour.value = value
    if (pm.value && !format24h.value) {
      localHour.value += 12;
    }
    selecting.value = 'minute'
  } else {
    localMinute.value = value
    selecting.value = 'hour'
  }
  stime.value = formatTime(localHour.value, localMinute.value);
  debugLog("onClockSelect: ", localHour.value, ':', localMinute.value, 'stime: ', stime.value);
}

function onUpdateAmPm(value: boolean) {
  pm.value = value
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
      <UInput type="text" v-bind="attrs" v-model="stime" />
    </UTooltip>
    <UPopover>
      <UButton icon="i-lucide-clock-3" size="md" color="primary" variant="solid"/>
      <template #content class="w-125 flex flex-col items-center justify-center">
        <!-- Time Display 24h -->
        <div v-if="format24h"  :style="{ backgroundColor: primaryColor }"
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
        <div v-if="!format24h" :style="{ backgroundColor: primaryColor }"
             class="flex flex-row items-center justify-center align-center gap-4 text-neutral-100 p-2">
          <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
            {{ pmTime }}
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
          <USwitch class="w-10" v-model="format24h"/>
          <div class="text-lg text-center w-15">{{ format24h ? '24h' : 'AM/PM' }}</div>
          <UCheckbox v-if="!format24h" class="w-10" v-model="pm" :label="pmLabel"/>
          <div v-else class="w-10"></div>
        </div>

        <!-- Clock Dial -->
        <ClockDial
            :mode="selecting"
            :hour="localHour"
            :minute="localMinute"
            :is24h="format24h"
            :pm="pm"
            @update="onClockSelect"
            @updatePm="onUpdateAmPm"
        />
      </template>
    </UPopover>
  </div>
</template>
