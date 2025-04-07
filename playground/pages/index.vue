<script setup lang="ts">
import UTimePicker from '../../src/runtime/components/TimePicker.vue'
import UInputTimePicker from '../../src/runtime/components/InputTimePicker.vue'

const is24h = ref<boolean>(true)
const hourMinute = ref({hour: 12, minute: 0})
const stime = ref(formatTime(hourMinute.value.hour, hourMinute.value.minute));

const DEBUG = true;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

function formatTime(hour: number, minute: number): string {
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

watch(() => stime.value, () => {
  debugLog('value: ', stime.value);
  debugLog('type of value: ', typeof stime.value);
  const [hhStr, mmStr] = stime.value.split(":");
  hourMinute.value.hour = Number.parseInt(hhStr as string, 10);
  hourMinute.value.minute = Number.parseInt(mmStr as string, 10);
})

const updateTime = (hourMinute_: any) => {
  hourMinute.value = hourMinute_;
  stime.value = formatTime(hourMinute_.hour, hourMinute_.minute);
  debugLog("updateTime: ", hourMinute_.hour, ':', hourMinute_.minute, ' sTime: ', stime.value);
}

</script>

<template>
  <UContainer class="flex flex-col items-center justify-center h-screen overflow-y-scroll">
    <UInputTimePicker v-model="stime" :is24h="is24h" class="w-24" />
    <UCard>
      <template #header>
        <p class="h-8 text-2xl text-center text-gray-700">Time Picker</p>
      </template>
      <div class="flex flex-col items-center justify-center">
        <p class="h-16 text-6xl text-center my-auto">{{
            hourMinute.hour
          }}:{{ hourMinute.minute.toString().padStart(2, '0') }}</p>
      </div>
      <template #footer>
        <div class="flex items-center justify-center">
          <UTimePicker :is24h="is24h" :hour-minute="hourMinute" @update:hour-minute="updateTime"/>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
