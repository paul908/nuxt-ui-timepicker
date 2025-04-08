<script setup lang="ts">
const DEBUG = true;

function debugLog(...args: any) {
  if (DEBUG) console.log(...args);
}

const is24h = ref<boolean>(true)
// Raw string, e.g., "13:45"
const time = ref<string>('13:45')

// Structured format, e.g., { hour: 13, minute: 45 }
const hourMinute = computed({
  get() {
    if (!time.value) return { hour: 0, minute: 0 }
    const [h, m] = time.value.split(':')
    debugLog('index.vue time: ', time.value, ' - hour: ', h, ' - minute: ', m)
    return {
      hour: Number(h) || 0,
      minute: Number(m) || 0,
    }
  },
  set(val) {
    const { hour, minute } = val
    time.value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    debugLog('index.vue time: ', time.value, ' - hour: ', hour, ' - minute: ', minute)
  }
})

function parseTime(str: string): { hour: number; minute: number } {
  const [h, m] = str.split(':')
  return { hour: Number(h), minute: Number(m) }
}

function formatTime({ hour, minute }: { hour: number; minute: number }): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

watch(() => is24h.value, () => {
  debugLog('index.vue is24h: ', is24h.value);
})

</script>

<template>
  <UContainer class="flex flex-col items-center justify-center h-screen overflow-y-scroll">
    <InputTimePicker v-model:is24h="is24h" v-model:time="time" />
    <UCard>
      <template #header>
        <p class="h-8 text-2xl text-center text-gray-700">Time Picker</p>
      </template>
      <div class="flex flex-col items-center justify-center">
        <div class="flex flex-row gap-2 items-center justify-center p-2">
          <USwitch class="w-10" v-model="is24h"/>
          <div class="text-lg text-center w-15">{{ is24h ? '24h' : 'AM/PM' }}</div>
        </div>
        <p class="h-16 text-6xl text-center my-auto">{{ hourMinute.hour }}:{{ hourMinute.minute.toString().padStart(2, '0') }}</p>
        <p class="h-16 text-6xl text-center my-auto">hello</p>
      </div>
      <template #footer>
        <div class="flex items-center justify-center">
          <TimePicker v-model:is24h="is24h" v-model:hour-minute="hourMinute"/>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
