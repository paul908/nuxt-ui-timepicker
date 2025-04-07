<script setup lang="ts">
import {ref, computed, watch, onMounted, toRefs, useAttrs} from 'vue'
import ClockDial from "./ClockDial.vue";

const props = defineProps<{
  is24h: boolean
  hourMinute: { hour: number; minute: number }
}>()

const emit = defineEmits<{
  (e: 'update:hourMinute', value: { hour: number; minute: number }): void,
  (e: 'update24h:format', value: boolean): void
}>()

const DEBUG = true;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

const selecting = ref<'hour' | 'minute'>('hour')
const localTime = ref({...props.hourMinute})
const format24h = ref(props.is24h ?? true)
const pm = ref(false)
pm.value = localTime.value.hour >= 12

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
  hour: localTime.value.hour.toString().padStart(2, '0'),
  minute: localTime.value.minute.toString().padStart(2, '0')
}))

const pmTime = computed(() => {
  let x = localTime.value.hour;
  if (x > 12) {
    x -= 12;
  } else if (x === 0) {
    x = 12;
  }
  return x
})

watch(() => props.hourMinute, () => {
  debugLog('TimePicker.vue watch props.hourMinute: ', props.hourMinute);
  localTime.value = {...props.hourMinute}
  pm.value = localTime.value.hour >= 12;
})

watch(() => props.is24h, () => {
  format24h.value = props.is24h
  debugLog('TimePicker.vue watch props.is24h format.value = props.is24h: ', format24h.value);
})

watch(() => format24h.value, () => {
  debugLog('TimePicker.vue watch format24h.value: ', format24h.value);
  if (!format24h.value) {
    pm.value = localTime.value.hour >= 12
  }
  emit('update24h:format', format24h.value);
})

watch(() => pm.value, () => {
  debugLog("TimePicker.vue watch pm.value: ", pm.value, localTime.value.hour, ':', localTime.value.minute);
  if (pm.value) {
    if (localTime.value.hour <= 12) {
      localTime.value.hour += 12
    }
  } else {
    if (localTime.value.hour >= 12) {
      localTime.value.hour -= 12
    }
  }
  confirm();
})

function onClockSelect(value: number) {
  if (selecting.value === 'hour') {
    localTime.value.hour = value
    if (pm.value && !format24h.value) {
      localTime.value.hour += 12;
    }
    selecting.value = 'minute'
  } else {
    localTime.value.minute = value
    selecting.value = 'hour'
  }
  debugLog("onClockSelect: ", localTime.value.hour, ':', localTime.value.minute);
  confirm();
}

function onUpdateAmPm(value: boolean) {
  pm.value = value
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
  <UPopover>
    <UButton icon="i-lucide-clock-3" size="md" color="primary" variant="solid"/>
    <template #content class="w-125 flex flex-col items-center justify-center">
      <!-- Time Display 24h -->
      <div v-if="format24h" :style="{ backgroundColor: primaryColor }"
           class="flex flex-row items-center justify-center gap-4 text-neutral-100 p-2">
        <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
          {{ localTime.hour }}
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
        <span class=" text-5xl font-semibold text-center align-middle text-neutral-100">:</span>
        <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
          {{ paddedTime.minute }}
        </button>
        <button @click="selecting = 'minute'" class="text-2xl font-semibold text-neutral-100">
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
        :hour="localTime.hour"
        :minute="localTime.minute"
        :is24h="format24h"
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
