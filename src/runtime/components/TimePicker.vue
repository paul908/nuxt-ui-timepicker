<script setup lang="ts">
import {ref, computed, watch, onMounted, toRefs, useAttrs} from 'vue'
import ClockDial from "./ClockDial.vue";

const props = defineProps<{
  is24h: boolean
  hourMinute: { hour: number; minute: number }
}>()

const emit = defineEmits<{
  (e: 'update:hourMinute', value: { hour: number; minute: number }): void
}>()

const DEBUG = false;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

const selecting = ref<'hour' | 'minute'>('hour')
const localTime = ref({...props.hourMinute})
const format24h = ref(props.is24h ?? true)
const pm = ref(false)
pm.value = localTime.value.hour >= 12

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
  localTime.value = {...props.hourMinute}
})

watch(() => props.is24h, () => {
  format24h.value = props.is24h
})

watch(() => format24h.value, () => {
  if (!format24h.value) {
    pm.value = localTime.value.hour >= 12
  }
})

watch(() => pm.value, () => {
  debugLog("TimePicket watch pm.value: ", pm.value, localTime.value.hour, ':', localTime.value.minute);
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
  debugLog('update:hourMinute', {...localTime.value});
  emit('update:hourMinute', {...localTime.value})
}

function activeTabClass(tab: 'hour' | 'minute') {
  return tab === selecting.value
    ? 'text-primary font-bold text-5xl'
    : 'text-neutral-100 text-5xl'
}

</script>

<template>
  <UPopover>
    <UButton icon="i-lucide-clock-3" size="md" color="primary" variant="solid"/>
    <template #content class="w-125 flex flex-col items-center justify-center">
      <!-- Time Display 24h -->
      <div v-if="format24h" class="flex flex-row items-center justify-center gap-4 bg-primary-500 text-white p-2">
        <button @click="selecting = 'hour'" :class="activeTabClass('hour')">
          {{ localTime.hour }}
        </button>
        <span class="text-5xl font-semibold">:</span>
        <button @click="selecting = 'minute'" :class="activeTabClass('minute')">
          {{ paddedTime.minute }}
        </button>
      </div>
      <!-- Time Display AM/PM -->
      <div v-if="!format24h"
           class="flex flex-row items-center justify-center align-center gap-4 bg-primary-500 text-white p-2">
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
