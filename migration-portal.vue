<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <Cloud class="h-8 w-8 text-blue-600" />
              <h1 class="text-2xl font-bold text-gray-900">CloudMigrate Pro</h1>
            </div>
            <nav class="hidden md:flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{{ activeProjects }} Active Projects</span>
            </div>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              New Migration
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Overview Dashboard -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="kpi in kpis"
            :key="kpi.title"
            class="bg-white rounded-lg shadow p-6"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">{{ kpi.title }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
                <p :class="[
                  'text-sm',
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ kpi.change }}
                </p>
              </div>
              <div :class="[
                'p-3 rounded-full',
                kpi.bgColor
              ]">
                <component :is="kpi.icon" :class="['h-6 w-6', kpi.iconColor]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Migration Progress Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Migration Progress Overview</h3>
          <div class="space-y-4">
            <div
              v-for="project in migrationProjects"
              :key="project.id"
              class="border rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
                  <p class="text-sm text-gray-600">{{ project.description }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(project.status)
                  ]">
                    {{ project.status }}
                  </span>
                  <span class="text-sm text-gray-600">{{ project.progress }}%</span>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :class="[
                    'h-2 rounded-full transition-all duration-300',
                    getProgressColor(project.status)
                  ]"
                  :style="{ width: project.progress + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>Started: {{ project.startDate }}</span>
                <span>Target: {{ project.targetDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Discovery & Planning -->
      <div v-if="activeTab === 'discovery'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Dependency Mapping -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Service Dependencies</h3>
            <div class="relative">
              <svg ref="dependencyChart" class="w-full h-80 border rounded"></svg>
            </div>
            <div class="mt-4 flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Web Services</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Databases</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>External APIs</span>
              </div>
            </div>
          </div>

          <!-- TCO Calculator -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Total Cost of Ownership</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">Current On-Premises</p>
                  <p class="text-2xl font-bold text-gray-900">${{ currentCost.toLocaleString() }}</p>
                  <p class="text-xs text-gray-500">per month</p>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm text-blue-600">Projected Cloud Cost</p>
                  <p class="text-2xl font-bold text-blue-900">${{ projectedCost.toLocaleString() }}</p>
                  <p class="text-xs text-blue-500">per month</p>
                </div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-sm text-green-600">Estimated Savings</p>
                <p class="text-2xl font-bold text-green-900">
                  ${{ (currentCost - projectedCost).toLocaleString() }}
                </p>
                <p class="text-xs text-green-500">
                  {{ Math.round(((currentCost - projectedCost) / currentCost) * 100) }}% reduction
                </p>
              </div>
            </div>
            <div class="mt-4">
              <h4 class="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
              <div class="space-y-2">
                <div
                  v-for="item in costBreakdown"
                  :key="item.category"
                  class="flex justify-between text-sm"
                >
                  <span class="text-gray-600">{{ item.category }}</span>
                  <span class="font-medium">${{ item.amount.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Migration Readiness Assessment -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Migration Readiness Assessment</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="assessment in readinessAssessment"
              :key="assessment.category"
              class="text-center"
            >
              <div class="relative w-24 h-24 mx-auto mb-4">
                <svg class="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    class="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    :stroke-dasharray="`${2 * Math.PI * 40}`"
                    :stroke-dashoffset="`${2 * Math.PI * 40 * (1 - assessment.score / 100)}`"
                    :class="getScoreColor(assessment.score)"
                    class="transition-all duration-300"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xl font-bold text-gray-900">{{ assessment.score }}%</span>
                </div>
              </div>
              <h4 class="font-medium text-gray-900">{{ assessment.category }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ assessment.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Execution Dashboard -->
      <div v-if="activeTab === 'execution'" class="space-y-6">
        <!-- Migration Timeline -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Migration Timeline</h3>
          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div class="space-y-6">
              <div
                v-for="(phase, index) in migrationPhases"
                :key="phase.id"
                class="relative flex items-start space-x-4"
              >
                <div :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                  getPhaseColor(phase.status)
                ]">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-gray-900">{{ phase.name }}</h4>
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(phase.status)
                    ]">
                      {{ phase.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ phase.description }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Duration: {{ phase.duration }}</span>
                    <span>Resources: {{ phase.resources }}</span>
                  </div>
                  <div class="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      :class="[
                        'h-1.5 rounded-full transition-all duration-300',
                        getProgressColor(phase.status)
                      ]"
                      :style="{ width: phase.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Monitoring -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Active Migrations</h3>
            <div class="space-y-4">
              <div
                v-for="migration in activeMigrations"
                :key="migration.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ migration.service }}</h4>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-2 h-2 rounded-full',
                      migration.status === 'migrating' ? 'bg-blue-400 animate-pulse' : 'bg-green-400'
                    ]"></div>
                    <span class="text-sm text-gray-600">{{ migration.status }}</span>
                  </div>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                  <p>Source: {{ migration.source }}</p>
                  <p>Target: {{ migration.target }}</p>
                  <p>ETA: {{ migration.eta }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div class="space-y-4">
              <div
                v-for="metric in systemMetrics"
                :key="metric.name"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-gray-600">{{ metric.name }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      :class="[
                        'h-2 rounded-full transition-all duration-300',
                        getMetricColor(metric.value)
                      ]"
                      :style="{ width: metric.value + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 w-12 text-right">
                    {{ metric.value }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics -->
      <div v-if="activeTab === 'analytics'" class="space-y-6">
        <!-- Performance Comparison -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Benchmarking</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="benchmark in performanceBenchmarks"
              :key="benchmark.metric"
              class="text-center p-4 border rounded-lg"
            >
              <h4 class="font-medium text-gray-900 mb-2">{{ benchmark.metric }}</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Before</span>
                  <span class="font-medium">{{ benchmark.before }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">After</span>
                  <span class="font-medium">{{ benchmark.after }}</span>
                </div>
                <div :class="[
                  'text-sm font-medium',
                  benchmark.improvement > 0 ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ benchmark.improvement > 0 ? '+' : '' }}{{ benchmark.improvement }}% improvement
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cost Savings Analysis -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cost Savings Analysis</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-4">Monthly Cost Comparison</h4>
              <div class="space-y-3">
                <div
                  v-for="cost in costComparison"
                  :key="cost.category"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span class="text-sm text-gray-600">{{ cost.category }}</span>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">
                      ${{ cost.current.toLocaleString() }} → ${{ cost.cloud.toLocaleString() }}
                    </div>
                    <div :class="[
                      'text-xs',
                      cost.savings > 0 ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ cost.savings > 0 ? 'Save' : 'Additional' }} ${{ Math.abs(cost.savings).toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-4">ROI Projection</h4>
              <div class="text-center p-6 bg-green-50 rounded-lg">
                <p class="text-sm text-green-600">Total Annual Savings</p>
                <p class="text-3xl font-bold text-green-900">$2.4M</p>
                <p class="text-sm text-green-600 mt-2">ROI: 340% over 3 years</p>
              </div>
              <div class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Migration Investment</span>
                  <span class="font-medium">$850K</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Break-even Point</span>
                  <span class="font-medium">8 months</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">3-Year Net Benefit</span>
                  <span class="font-medium text-green-600">$6.3M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Cloud, 
  Server, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  Database,
  Shield,
  Zap
} from 'lucide-vue-next'

// Reactive state
const activeTab = ref('overview')
const activeProjects = ref(12)

// Navigation tabs
const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'discovery', name: 'Discovery & Planning' },
  { id: 'execution', name: 'Execution' },
  { id: 'analytics', name: 'Analytics' }
]

// KPI data
const kpis = ref([
  {
    title: 'Active Migrations',
    value: '24',
    change: '+12% from last month',
    trend: 'up',
    icon: Server,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Cost Savings',
    value: '$2.4M',
    change: '+18% projected',
    trend: 'up',
    icon: DollarSign,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Success Rate',
    value: '98.5%',
    change: '+2.1% improvement',
    trend: 'up',
    icon: TrendingUp,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Team Utilization',
    value: '87%',
    change: 'Optimal range',
    trend: 'up',
    icon: Users,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
])

// Migration projects
const migrationProjects = ref([
  {
    id: 1,
    name: 'E-commerce Platform',
    description: 'Migrating core e-commerce services to AWS EKS',
    status: 'In Progress',
    progress: 75,
    startDate: '2024-01-15',
    targetDate: '2024-03-30'
  },
  {
    id: 2,
    name: 'Data Analytics Pipeline',
    description: 'Moving data warehouse to Azure Synapse',
    status: 'Planning',
    progress: 25,
    startDate: '2024-02-01',
    targetDate: '2024-05-15'
  },
  {
    id: 3,
    name: 'Legacy CRM System',
    description: 'Modernizing CRM with cloud-native architecture',
    status: 'Completed',
    progress: 100,
    startDate: '2023-11-01',
    targetDate: '2024-01-31'
  }
])

// Cost data
const currentCost = ref(125000)
const projectedCost = ref(89000)

const costBreakdown = ref([
  { category: 'Compute', amount: 45000 },
  { category: 'Storage', amount: 18000 },
  { category: 'Network', amount: 12000 },
  { category: 'Managed Services', amount: 14000 }
])

// Readiness assessment
const readinessAssessment = ref([
  {
    category: 'Technical',
    score: 85,
    description: 'Infrastructure and application readiness'
  },
  {
    category: 'Security',
    score: 92,
    description: 'Compliance and security posture'
  },
  {
    category: 'Operational',
    score: 78,
    description: 'Team skills and processes'
  }
])

// Migration phases
const migrationPhases = ref([
  {
    id: 1,
    name: 'Assessment & Planning',
    description: 'Analyze current infrastructure and create migration plan',
    status: 'Completed',
    progress: 100,
    duration: '4 weeks',
    resources: '8 engineers'
  },
  {
    id: 2,
    name: 'Proof of Concept',
    description: 'Validate migration approach with pilot applications',
    status: 'Completed',
    progress: 100,
    duration: '3 weeks',
    resources: '6 engineers'
  },
  {
    id: 3,
    name: 'Infrastructure Setup',
    description: 'Provision cloud resources and configure networking',
    status: 'In Progress',
    progress: 65,
    duration: '6 weeks',
    resources: '12 engineers'
  },
  {
    id: 4,
    name: 'Application Migration',
    description: 'Migrate applications and data to cloud environment',
    status: 'Pending',
    progress: 0,
    duration: '8 weeks',
    resources: '15 engineers'
  },
  {
    id: 5,
    name: 'Testing & Validation',
    description: 'Comprehensive testing and performance validation',
    status: 'Pending',
    progress: 0,
    duration: '4 weeks',
    resources: '10 engineers'
  }
])

// Active migrations
const activeMigrations = ref([
  {
    id: 1,
    service: 'User Authentication Service',
    source: 'On-premises VM',
    target: 'AWS ECS',
    status: 'migrating',
    eta: '2 hours'
  },
  {
    id: 2,
    service: 'Payment Processing API',
    source: 'Physical Server',
    target: 'Azure Container Instances',
    status: 'completed',
    eta: 'Completed'
  },
  {
    id: 3,
    service: 'Product Catalog Database',
    source: 'On-premises MySQL',
    target: 'AWS RDS',
    status: 'migrating',
    eta: '45 minutes'
  }
])

// System metrics
const systemMetrics = ref([
  { name: 'CPU Utilization', value: 68 },
  { name: 'Memory Usage', value: 72 },
  { name: 'Network Throughput', value: 45 },
  { name: 'Storage I/O', value: 58 },
  { name: 'Error Rate', value: 2 }
])

// Performance benchmarks
const performanceBenchmarks = ref([
  {
    metric: 'Response Time',
    before: '450ms',
    after: '180ms',
    improvement: 60
  },
  {
    metric: 'Throughput',
    before: '1,200 req/s',
    after: '2,800 req/s',
    improvement: 133
  },
  {
    metric: 'Availability',
    before: '99.2%',
    after: '99.9%',
    improvement: 0.7
  }
])

// Cost comparison
const costComparison = ref([
  {
    category: 'Compute',
    current: 45000,
    cloud: 32000,
    savings: 13000
  },
  {
    category: 'Storage',
    current: 18000,
    cloud: 12000,
    savings: 6000
  },
  {
    category: 'Network',
    current: 12000,
    cloud: 15000,
    savings: -3000
  },
  {
    category: 'Management',
    current: 25000,
    cloud: 18000,
    savings: 7000
  }
])

// Utility functions
const getStatusColor = (status) => {
  const colors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Planning': 'bg-yellow-100 text-yellow-800',
    'Pending': 'bg-gray-100 text-gray-800',
    'migrating': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getProgressColor = (status) => {
  const colors = {
    'Completed': 'bg-green-500',
    'In Progress': 'bg-blue-500',
    'Planning': 'bg-yellow-500',
    'Pending': 'bg-gray-300'
  }
  return colors[status] || 'bg-gray-300'
}

const getPhaseColor = (status) => {
  const colors = {
    'Completed': 'bg-green-500',
    'In Progress': 'bg-blue-500',
    'Pending': 'bg-gray-400'
  }
  return colors[status] || 'bg-gray-400'
}

const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-blue-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

const getMetricColor = (value) => {
  if (value <= 20) return 'bg-red-500'
  if (value <= 50) return 'bg-yellow-500'
  if (value <= 80) return 'bg-blue-500'
  return 'bg-green-500'
}

// D3.js dependency visualization
const dependencyChart = ref(null)

onMounted(() => {
  // Initialize dependency visualization
  if (dependencyChart.value) {
    createDependencyVisualization()
  }
})

const createDependencyVisualization = () => {
  // Mock dependency data
  const nodes = [
    { id: 'web-app', name: 'Web Application', type: 'web', x: 150, y: 100 },
    { id: 'api-gateway', name: 'API Gateway', type: 'web', x: 150, y: 200 },
    { id: 'auth-service', name: 'Auth Service', type: 'web', x: 50, y: 300 },
    { id: 'user-db', name: 'User Database', type: 'database', x: 50, y: 400 },
    { id: 'product-service', name: 'Product Service', type: 'web', x: 250, y: 300 },
    { id: 'product-db', name: 'Product DB', type: 'database', x: 250, y: 400 },
    { id: 'payment-api', name: 'Payment API', type: 'external', x: 350, y: 200 }
  ]

  const links = [
    { source: 'web-app', target: 'api-gateway' },
    { source: 'api-gateway', target: 'auth-service' },
    { source: 'api-gateway', target: 'product-service' },
    { source: 'auth-service', target: 'user-db' },
    { source: 'product-service', target: 'product-db' },
    { source: 'api-gateway', target: 'payment-api' }
  ]

  const svg = dependencyChart.value
  const width = svg.clientWidth
  const height = svg.clientHeight

  // Clear existing content
  svg.innerHTML = ''

  // Create SVG namespace
  const svgNS = 'http://www.w3.org/2000/svg'

  // Draw links
  links.forEach(link => {
    const sourceNode = nodes.find(n => n.id === link.source)
    const targetNode = nodes.find(n => n.id === link.target)
    
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('x1', sourceNode.x)
    line.setAttribute('y1', sourceNode.y)
    line.setAttribute('x2', targetNode.x)
    line.setAttribute('y2', targetNode.y)
    line.setAttribute('stroke', '#e5e7eb')
    line.setAttribute('stroke-width', '2')
    svg.appendChild(line)
  })

  // Draw nodes
  nodes.forEach(node => {
    const group = document.createElementNS(svgNS, 'g')
    
    const circle = document.createElementNS(svgNS, 'circle')
    circle.setAttribute('cx', node.x)
    circle.setAttribute('cy', node.y)
    circle.setAttribute('r', '20')
    
    const colors = {
      web: '#3b82f6',
      database: '#10b981',
      external: '#f59e0b'
    }
    circle.setAttribute('fill', colors[node.type])
    
    const text = document.createElementNS(svgNS, 'text')
    text.setAttribute('x', node.x)
    text.setAttribute('y', node.y - 30)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-size', '12')
    text.setAttribute('fill', '#374151')
    text.textContent = node.name
    
    group.appendChild(circle)
    group.appendChild(text)
    svg.appendChild(group)
  })
}
</script>

<style scoped>
/* Custom styles for the migration portal */
.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Ensure proper spacing and typography */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
