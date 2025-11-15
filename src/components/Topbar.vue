<template>
  <div class="topbar">
    <div class="top-left">
      <div class="title">Herb Claim</div>
      <div class="subtitle">งานแพทย์แผนไทย โรงพยาบาลสระโบสถ์</div>
    </div>
    <div class="controls">
      <div v-if="years.length > 0" class="year-filter-group">
        <label for="yearSelector" class="year-label">เลือกปี:</label>
        <select id="yearSelector" class="select-year" v-model="selectedYear" @change="onYearChange">
          <option v-for="year in years" :key="year.suffix" :value="year.suffix">
            {{ year.year }}
          </option>
        </select>
      </div>
      <button class="btn" id="btnRefresh" title="Refresh data" @click="onRefresh">🔄 รีเฟรช</button>
      <div class="status">สถานะ: {{ statusMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  years: { type: Array, required: true },
  modelValue: { type: String, default: null },
  statusMessage: { type: String, default: 'N/A' },
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const selectedYear = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    selectedYear.value = newValue
  },
)

const onYearChange = () => {
  emit('update:modelValue', selectedYear.value)
}

const onRefresh = () => {
  emit('refresh')
}
</script>
