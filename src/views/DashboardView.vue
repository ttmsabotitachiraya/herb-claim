<template>
  <div class="app" role="main">
    <Topbar 
      :years="store.years" 
      v-model="store.selectedYearSuffix" 
      :status-message="store.statusMessage"
      @refresh="store.fetchDataForYear" 
    />

    <div v-if="store.error" class="content">
      <div style="color:#ffbaba; background: rgba(255,0,0,0.1); padding: 20px; border-radius: 12px; grid-column: 1 / -1;">
        <h3>เกิดข้อผิดพลาด</h3>
        <p>{{ store.error }}</p>
      </div>
    </div>
    
    <div v-else class="content" id="mainContent">
      <div style="display:flex; flex-direction:column; gap:18px;">
        <KpiCard
          :label="kpiLabel"
          :grand-total="kpiGrandTotal"
          :row-count="kpiRowCount"
          :top-drug-value="kpiTopDrugValue"
          :top-drug-count="kpiTopDrugCount"
        />
        
        <div class="card">
          <div class="chart-title">
            <h3>แนวโน้มยอดชดเชยค่าบริการ ยาสมุนไพรรายเดือน</h3>
            <div style="font-size:0.9rem;color:var(--muted)">Interactive • Hover to inspect</div>
          </div>
          <div ref="monthlyChartDiv" class="chart-area" role="img" aria-label="Monthly Trend Chart"></div>
        </div>
        
        <div class="card">
          <div class="chart-title">
            <h3>เปรียบเทียบยาสมุนไพร (เรียงตามจำนวนครั้ง)</h3>
            <div style="font-size:0.9rem;color:var(--muted)">แสดงผลทุกรายการ</div>
          </div>
          <div ref="drugChartDiv" class="chart-area" role="img" aria-label="All Drugs Chart"></div>
        </div>
      </div>
      <aside style="display:flex;flex-direction:column;gap:18px;">
        <TopList 
          :is-loading="store.isLoading"
          :list-data="topListData"
          :last-updated="lastUpdated"
        />
        <div class="card">
          <div style="font-weight:700;color:#EAF8D3;margin-bottom:8px">ข้อมูลเพิ่มเติม</div>
          <div style="color:var(--muted);font-size:0.95rem;line-height:1.5">
            ข้อมูลจาก: <strong>HerbalDrug{{ store.selectedYearSuffix || '...' }}</strong><br>
            กรองข้อมูล: ปี (เลือกจากเมนูด้านบน)
          </div>
        </div>
      </aside>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';
import { storeToRefs } from 'pinia';

// Import Components
import Topbar from '@/components/Topbar.vue';
import KpiCard from '@/components/KpiCard.vue';
import TopList from '@/components/TopList.vue';
import Footer from '@/components/Footer.vue';

// State Management
const store = useDashboardStore();
const { selectedYearSuffix, dashboardData, selectedYearText } = storeToRefs(store);

// Refs for Chart divs
const monthlyChartDiv = ref(null);
const drugChartDiv = ref(null);

// Computed properties for display
const kpiLabel = computed(() => `มูลค่าชดเชยค่าบริการ ยาสมุนไพร สิทธิ UC (ปี ${selectedYearText.value || '...'})`);

const kpiGrandTotal = computed(() => {
    if (store.isLoading) return '⏳';
    if (!dashboardData.value) return '–';
    const grand = parseFloat(dashboardData.value.grandTotal || 0);
    return isFinite(grand) ? grand.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '0.00 ฿';
});

const kpiRowCount = computed(() => {
    if (!dashboardData.value?.drugValueData) return '—';
    return Math.max(0, dashboardData.value.drugValueData.length - 1);
});

const kpiTopDrugValue = computed(() => {
    if (!dashboardData.value?.drugValueData || dashboardData.value.drugValueData.length <= 1) return '—';
    return dashboardData.value.drugValueData[1][0] || '—';
});

const kpiTopDrugCount = computed(() => {
    if (!dashboardData.value?.drugCountData || dashboardData.value.drugCountData.length <= 1) return '—';
    return dashboardData.value.drugCountData[1][0] || '—';
});

const topListData = computed(() => {
    if (!dashboardData.value?.drugValueData || dashboardData.value.drugValueData.length <= 1) return [];
    return dashboardData.value.drugValueData.slice(1, 11);
});

const lastUpdated = ref('—');

// --- Google Charts Logic ---
let googleChartsLoaded = false;

function loadGoogleCharts() {
    if (typeof google === 'undefined' || typeof google.charts === 'undefined') {
        setTimeout(loadGoogleCharts, 100);
        return;
    }
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        googleChartsLoaded = true;
        drawCharts(); // Draw charts if data is already available
    });
}

function drawCharts() {
    if (!googleChartsLoaded || !dashboardData.value) return;
    drawMonthlyChart(dashboardData.value.monthlyData);
    drawDrugChart(dashboardData.value.drugCountData);
}

function drawMonthlyChart(data) {
    if (!monthlyChartDiv.value) return;
    if (!data || data.length <= 1) {
        monthlyChartDiv.value.innerText = 'ไม่มีข้อมูลสำหรับแสดงกราฟรายเดือน'; return;
    }
    try {
        const dataTable = google.visualization.arrayToDataTable(data);
        const options = {backgroundColor: 'transparent', colors: ['#84cc16'], legend: { position: 'none' }, curveType: 'function', chartArea: { left:60, top:20, width:'85%', height:'70%' }, hAxis: { textStyle: { color:'#94a3b8', fontName:'Noto Sans Thai' }, slantedText:true, slantedTextAngle:40 }, vAxis: { textStyle: { color:'#94a3b8', fontName:'Noto Sans Thai' }, gridlines: { color: 'rgba(255,255,255,0.03)' }, format: 'short', viewWindow:{min:0} }, pointSize:6, animation: { startup:true, duration:900, easing:'out' }, tooltip: { textStyle: { fontName: 'Noto Sans Thai' } }};
        const chart = new google.visualization.LineChart(monthlyChartDiv.value);
        chart.draw(dataTable, options);
    } catch(e){ console.error('monthly chart error', e); monthlyChartDiv.value.innerText = 'ไม่สามารถแสดงกราฟได้'; }
}

function drawDrugChart(data) {
    if (!drugChartDiv.value) return;
    if (!data || data.length <= 1) {
        drugChartDiv.value.innerText = 'ไม่มีข้อมูลสำหรับแสดงกราฟสมุนไพร'; return;
    }
    try {
        const numItems = data.length - 1;
        const heightPerItem = 35;
        const baseHeight = 60;
        drugChartDiv.value.style.height = Math.max(340, (numItems * heightPerItem) + baseHeight) + 'px';
        const dataTable = google.visualization.arrayToDataTable(data);
        const options = { backgroundColor: 'transparent', colors: ['#10b981'], legend: { position: 'none' }, chartArea: { left: 140, top: 20, width: '70%', height: '90%' }, hAxis: { textStyle: { color:'#94a3b8', fontName:'Noto Sans Thai' }, gridlines: { color: 'rgba(255,255,255,0.03)' }, format:'short' }, vAxis: { textStyle: { color:'#E6EEF3', fontName:'Noto Sans Thai' } }, animation: { startup:true, duration:900, easing:'out' }, tooltip: { textStyle: { fontName: 'Noto Sans Thai' } } };
        const chart = new google.visualization.BarChart(drugChartDiv.value);
        chart.draw(dataTable, options);
    } catch(e){ console.error('drug chart error', e); drugChartDiv.value.innerText = 'ไม่สามารถแสดงกราฟได้'; }
}


// --- Lifecycle and Watchers ---
onMounted(async () => {
    loadGoogleCharts();
    await store.fetchYears();
    // The watcher for selectedYearSuffix will trigger the first data fetch
});

watch(selectedYearSuffix, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
        store.fetchDataForYear();
    }
});

watch(dashboardData, (newData) => {
    if (newData) {
        drawCharts();
        lastUpdated.value = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    } else {
        // Clear charts if data is cleared
        if(monthlyChartDiv.value) monthlyChartDiv.value.innerHTML = '';
        if(drugChartDiv.value) drugChartDiv.value.innerHTML = '';
    }
});
</script>