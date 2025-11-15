<template>
  <div class="kpi" role="region" aria-label="KPI">
    <div class="label">{{ label }}</div>
    <div class="value">{{ grandTotal }}</div>
    <div class="meta">
      <div class="pill">รายการ: {{ rowCount }}</div>
      <div class="pill">มูลค่าชดเชยสูงสุด: {{ topDrugValue }}</div>
      <div class="pill">จ่ายบ่อยสุด: {{ topDrugCount }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  grandTotal: String,
  rowCount: [String, Number],
  topDrugValue: String,
  topDrugCount: String
});
</script>