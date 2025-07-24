    "use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Cloud, Server, DollarSign, TrendingUp, Users, X, Plus, Calendar, Target, AlertCircle, LogOut, Settings, User, Shield, UserCheck, UserX, Eye, EyeOff } from "lucide-react"

const migrationProjects = [
  {
    id: 1,
    name: "E-commerce Platform",
    description: "Migrating core e-commerce services to AWS EKS",
    status: "In Progress",
    progress: 75,
    startDate: "2024-01-15",
    targetDate: "2024-03-30",
    targetProvider: "aws",
    teamLead: "John Smith",
    budget: "$75,000"
  },
  {
    id: 2,
    name: "Data Analytics Pipeline",
    description: "Moving data warehouse to Azure Synapse",
    status: "Planning",
    progress: 25,
    startDate: "2024-02-01",
    targetDate: "2024-05-15",
    targetProvider: "azure",
    teamLead: "Sarah Johnson",
    budget: "$120,000"
  },
  {
    id: 3,
    name: "Legacy CRM System",
    description: "Modernizing CRM with cloud-native architecture",
    status: "Completed",
    progress: 100,
    startDate: "2023-11-01",
    targetDate: "2024-01-31",
    targetProvider: "gcp",
    teamLead: "Mike Davis",
    budget: "$95,000"
  },
]

// User Role System
interface UserRole {
  id: string
  name: string
  permissions: string[]
  level: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  organization?: string
  createdAt: string
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
}

const USER_ROLES: Record<string, UserRole> = {
  client: {
    id: 'client',
    name: 'Client',
    permissions: ['read_dashboard', 'read_alerts', 'read_own_data', 'update_own_profile'],
    level: 1
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    permissions: ['read_dashboard', 'read_alerts', 'read_team_data', 'manage_team_users', 'read_analytics'],
    level: 2
  },
  local_admin: {
    id: 'local_admin',
    name: 'Local Admin',
    permissions: ['read_dashboard', 'read_alerts', 'manage_organization_users', 'read_organization_data', 'configure_organization'],
    level: 3
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    permissions: ['*'], // All permissions
    level: 4
  }
}

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'developer',
    organization: 'TechCorp',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-20',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'local_admin',
    organization: 'TechCorp',
    createdAt: '2024-02-01',
    lastLogin: '2024-12-19',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'manager',
    organization: 'TechCorp',
    createdAt: '2024-03-10',
    lastLogin: '2024-12-18',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: 'client',
    organization: 'TechCorp',
    createdAt: '2024-04-05',
    lastLogin: '2024-12-20',
    status: 'active'
  },
  {
    id: '5',
    name: 'Gundo',
    email: 'gundo@company.com',
    role: 'developer',
    organization: 'TechCorp',
    createdAt: '2024-12-20',
    lastLogin: '2024-12-20',
    status: 'active'
  },
  {
    id: '6',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'developer',
    organization: 'TechCorp',
    createdAt: '2024-12-20',
    lastLogin: '2024-12-20',
    status: 'active'
  }
]

// Permission checking utilities
const hasPermission = (userRole: string, permission: string): boolean => {
  const role = USER_ROLES[userRole]
  if (!role) return false
  return role.permissions.includes('*') || role.permissions.includes(permission)
}

const canCreateRole = (currentUserRole: string, targetRole: string): boolean => {
  const currentRole = USER_ROLES[currentUserRole]
  const targetRoleObj = USER_ROLES[targetRole]
  
  if (!currentRole || !targetRoleObj) return false
  
  // Only developers can create any role
  if (currentUserRole === 'developer') return true
  
  // Local admins can create clients and managers
  if (currentUserRole === 'local_admin' && ['client', 'manager'].includes(targetRole)) return true
  
  // Managers can create clients only
  if (currentUserRole === 'manager' && targetRole === 'client') return true
  
  return false
}

const getAccessibleUsers = (currentUser: User, allUsers: User[]): User[] => {
  if (currentUser.role === 'developer') return allUsers
  
  if (currentUser.role === 'local_admin') {
    return allUsers.filter(user => 
      user.organization === currentUser.organization && 
      ['client', 'manager'].includes(user.role)
    )
  }
  
  if (currentUser.role === 'manager') {
    return allUsers.filter(user => 
      user.organization === currentUser.organization && 
      user.role === 'client'
    )
  }
  
  return [currentUser] // Clients can only see themselves
}

export default function MigrationPortal() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', showPassword: false })
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    verificationCode: '',
    showPassword: false,
    showConfirmPassword: false 
  })
  const [resetForm, setResetForm] = useState({ 
    email: '', 
    verificationCode: '' 
  })
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'client',
    organization: '',
    password: '',
    confirmPassword: ''
  })

  // Existing state
  const [activeTab, setActiveTab] = useState("overview")
  const [activeProjects] = useState(12)
  const dependencyChartRef = useRef<SVGSVGElement>(null)
  const [showNewMigrationModal, setShowNewMigrationModal] = useState(false)
  const [newMigrationForm, setNewMigrationForm] = useState({
    name: "",
    description: "",
    sourceEnvironment: "",
    targetProvider: "",
    applications: [] as string[],
    priority: "medium",
    estimatedDuration: "",
    teamLead: "",
    budget: "",
  })
  const [migrationProjectsState, setMigrationProjectsState] = useState(migrationProjects)

  // Load saved projects from localStorage on component mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('migrationProjects')
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects)
        setMigrationProjectsState(parsedProjects)
      }
    } catch (error) {
      console.warn('Failed to load projects from localStorage:', error)
    }
  }, [])

  // Navigation tabs with role-based access
  const getAvailableTabs = () => {
    if (!currentUser) return []
    
    const baseTabs = [
      { id: "overview", name: "Overview", permission: "read_dashboard" },
      { id: "discovery", name: "Discovery & Planning", permission: "read_dashboard" },
      { id: "projects", name: "Active Projects", permission: "read_dashboard" },
      { id: "execution", name: "Execution", permission: "read_dashboard" },
      { id: "analytics", name: "Analytics", permission: "read_analytics" },
    ]
    
    return baseTabs.filter(tab => hasPermission(currentUser.role, tab.permission))
  }

  const tabs = getAvailableTabs()

  // KPI data
  const kpis = [
    {
      title: "Active Migrations",
      value: "24",
      change: "+12% from last month",
      trend: "up",
      icon: Server,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Cost Savings",
      value: "$2.4M",
      change: "+18% projected",
      trend: "up",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+2.1% improvement",
      trend: "up",
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Team Utilization",
      value: "87%",
      change: "Optimal range",
      trend: "up",
      icon: Users,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ]

  // Cost data
  const currentCost = 125000
  const projectedCost = 89000

  const costBreakdown = [
    { category: "Compute", amount: 45000 },
    { category: "Storage", amount: 18000 },
    { category: "Network", amount: 12000 },
    { category: "Managed Services", amount: 14000 },
  ]

  // Readiness assessment
  const readinessAssessment = [
    {
      category: "Technical",
      score: 85,
      description: "Infrastructure and application readiness",
    },
    {
      category: "Security",
      score: 92,
      description: "Compliance and security posture",
    },
    {
      category: "Operational",
      score: 78,
      description: "Team skills and processes",
    },
  ]

  // Migration phases
  const migrationPhases = [
    {
      id: 1,
      name: "Assessment & Planning",
      description: "Analyze current infrastructure and create migration plan",
      status: "Completed",
      progress: 100,
      duration: "4 weeks",
      resources: "8 engineers",
    },
    {
      id: 2,
      name: "Proof of Concept",
      description: "Validate migration approach with pilot applications",
      status: "Completed",
      progress: 100,
      duration: "3 weeks",
      resources: "6 engineers",
    },
    {
      id: 3,
      name: "Infrastructure Setup",
      description: "Provision cloud resources and configure networking",
      status: "In Progress",
      progress: 65,
      duration: "6 weeks",
      resources: "12 engineers",
    },
    {
      id: 4,
      name: "Application Migration",
      description: "Migrate applications and data to cloud environment",
      status: "Pending",
      progress: 0,
      duration: "8 weeks",
      resources: "15 engineers",
    },
    {
      id: 5,
      name: "Testing & Validation",
      description: "Comprehensive testing and performance validation",
      status: "Pending",
      progress: 0,
      duration: "4 weeks",
      resources: "10 engineers",
    },
  ]

  // Active migrations
  const activeMigrations = [
    {
      id: 1,
      service: "User Authentication Service",
      source: "On-premises VM",
      target: "AWS ECS",
      status: "migrating",
      eta: "2 hours",
    },
    {
      id: 2,
      service: "Payment Processing API",
      source: "Physical Server",
      target: "Azure Container Instances",
      status: "completed",
      eta: "Completed",
    },
    {
      id: 3,
      service: "Product Catalog Database",
      source: "On-premises MySQL",
      target: "AWS RDS",
      status: "migrating",
      eta: "45 minutes",
    },
  ]

  // System metrics
  const systemMetrics = [
    { name: "CPU Utilization", value: 68 },
    { name: "Memory Usage", value: 72 },
    { name: "Network Throughput", value: 45 },
    { name: "Storage I/O", value: 58 },
    { name: "Error Rate", value: 2 },
  ]

  // Performance benchmarks
  const performanceBenchmarks = [
    {
      metric: "Response Time",
      before: "450ms",
      after: "180ms",
      improvement: 60,
    },
    {
      metric: "Throughput",
      before: "1,200 req/s",
      after: "2,800 req/s",
      improvement: 133,
    },
    {
      metric: "Availability",
      before: "99.2%",
      after: "99.9%",
      improvement: 0.7,
    },
  ]

  // Cost comparison
  const costComparison = [
    {
      category: "Compute",
      current: 45000,
      cloud: 32000,
      savings: 13000,
    },
    {
      category: "Storage",
      current: 18000,
      cloud: 12000,
      savings: 6000,
    },
    {
      category: "Network",
      current: 12000,
      cloud: 15000,
      savings: -3000,
    },
    {
      category: "Management",
      current: 25000,
      cloud: 18000,
      savings: 7000,
    },
  ]

  // Utility functions
  const getProgressColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-green-500",
      "In Progress": "bg-blue-500",
      Planning: "bg-yellow-500",
      Pending: "bg-gray-300",
    }
    return colors[status] || "bg-gray-300"
  }

  const getPhaseColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-green-500",
      "In Progress": "bg-blue-500",
      Pending: "bg-gray-400",
    }
    return colors[status] || "bg-gray-400"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 75) return "text-blue-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getMetricColor = (value: number) => {
    if (value <= 20) return "bg-red-500"
    if (value <= 50) return "bg-yellow-500"
    if (value <= 80) return "bg-blue-500"
    return "bg-green-500"
  }

  // D3.js dependency visualization
  const createDependencyVisualization = () => {
    const svg = dependencyChartRef.current
    if (!svg) return

    // Enhanced mock dependency data with more comprehensive services
    const nodes = [
      // Frontend Layer
      { id: "web-app", name: "React Web App", type: "web", x: 200, y: 50, description: "Main customer-facing application" },
      { id: "mobile-app", name: "Mobile App", type: "web", x: 300, y: 50, description: "iOS/Android application" },
      
      // API Gateway Layer
      { id: "api-gateway", name: "API Gateway", type: "web", x: 250, y: 120, description: "Main traffic router" },
      
      // Microservices Layer
      { id: "auth-service", name: "Authentication Service", type: "web", x: 100, y: 200, description: "User authentication & authorization" },
      { id: "user-service", name: "User Management", type: "web", x: 200, y: 200, description: "User profile management" },
      { id: "product-service", name: "Product Catalog", type: "web", x: 300, y: 200, description: "Product information service" },
      { id: "order-service", name: "Order Processing", type: "web", x: 400, y: 200, description: "Order management system" },
      { id: "notification-service", name: "Notification Service", type: "web", x: 500, y: 200, description: "Email/SMS notifications" },
      { id: "analytics-service", name: "Analytics Engine", type: "web", x: 150, y: 280, description: "Business intelligence" },
      { id: "search-service", name: "Search Service", type: "web", x: 350, y: 280, description: "Product search & recommendations" },
      
      // Database Layer
      { id: "user-db", name: "User Database", type: "database", x: 100, y: 360, description: "PostgreSQL - User data" },
      { id: "product-db", name: "Product Database", type: "database", x: 300, y: 360, description: "MongoDB - Product catalog" },
      { id: "order-db", name: "Order Database", type: "database", x: 400, y: 360, description: "PostgreSQL - Transaction data" },
      { id: "analytics-db", name: "Analytics Warehouse", type: "database", x: 150, y: 440, description: "Snowflake - Business analytics" },
      { id: "cache-redis", name: "Redis Cache", type: "database", x: 250, y: 360, description: "In-memory caching" },
      
      // External Services
      { id: "payment-api", name: "Stripe API", type: "external", x: 500, y: 120, description: "Payment processing" },
      { id: "email-service", name: "SendGrid", type: "external", x: 550, y: 280, description: "Email delivery service" },
      { id: "cdn-service", name: "CloudFront CDN", type: "external", x: 50, y: 50, description: "Content delivery network" },
      { id: "monitoring", name: "DataDog", type: "external", x: 450, y: 360, description: "Application monitoring" },
      { id: "file-storage", name: "AWS S3", type: "external", x: 350, y: 440, description: "File storage service" },
    ]

    const links = [
      // Frontend to Gateway
      { source: "web-app", target: "api-gateway", type: "https" },
      { source: "mobile-app", target: "api-gateway", type: "https" },
      
      // CDN connections
      { source: "cdn-service", target: "web-app", type: "static" },
      
      // Gateway to Services
      { source: "api-gateway", target: "auth-service", type: "internal" },
      { source: "api-gateway", target: "user-service", type: "internal" },
      { source: "api-gateway", target: "product-service", type: "internal" },
      { source: "api-gateway", target: "order-service", type: "internal" },
      { source: "api-gateway", target: "search-service", type: "internal" },
      
      // Service to Service communication
      { source: "order-service", target: "user-service", type: "internal" },
      { source: "order-service", target: "product-service", type: "internal" },
      { source: "order-service", target: "notification-service", type: "internal" },
      { source: "user-service", target: "analytics-service", type: "async" },
      { source: "product-service", target: "search-service", type: "internal" },
      
      // Service to Database connections
      { source: "auth-service", target: "user-db", type: "sql" },
      { source: "user-service", target: "user-db", type: "sql" },
      { source: "product-service", target: "product-db", type: "nosql" },
      { source: "order-service", target: "order-db", type: "sql" },
      { source: "analytics-service", target: "analytics-db", type: "sql" },
      
      // Cache connections
      { source: "user-service", target: "cache-redis", type: "cache" },
      { source: "product-service", target: "cache-redis", type: "cache" },
      { source: "search-service", target: "cache-redis", type: "cache" },
      
      // External API connections
      { source: "order-service", target: "payment-api", type: "https" },
      { source: "notification-service", target: "email-service", type: "https" },
      { source: "product-service", target: "file-storage", type: "https" },
      
      // Monitoring connections
      { source: "monitoring", target: "api-gateway", type: "monitoring" },
      { source: "monitoring", target: "auth-service", type: "monitoring" },
      { source: "monitoring", target: "user-service", type: "monitoring" },
      { source: "monitoring", target: "product-service", type: "monitoring" },
      { source: "monitoring", target: "order-service", type: "monitoring" },
    ]

    // Clear existing content
    svg.innerHTML = ""

    // Create SVG namespace
    const svgNS = "http://www.w3.org/2000/svg"

    // Draw links with different styles based on type
    links.forEach((link) => {
      const sourceNode = nodes.find((n) => n.id === link.source)
      const targetNode = nodes.find((n) => n.id === link.target)

      if (sourceNode && targetNode) {
        const line = document.createElementNS(svgNS, "line")
        line.setAttribute("x1", sourceNode.x.toString())
        line.setAttribute("y1", sourceNode.y.toString())
        line.setAttribute("x2", targetNode.x.toString())
        line.setAttribute("y2", targetNode.y.toString())
        
        // Style based on connection type
        const connectionStyles: Record<string, { color: string; width: string; dash?: string }> = {
          https: { color: "#3b82f6", width: "2" },
          internal: { color: "#10b981", width: "2" },
          sql: { color: "#8b5cf6", width: "2" },
          nosql: { color: "#f59e0b", width: "2" },
          cache: { color: "#ef4444", width: "1", dash: "5,5" },
          async: { color: "#6b7280", width: "1", dash: "3,3" },
          static: { color: "#14b8a6", width: "2" },
          monitoring: { color: "#f97316", width: "1", dash: "2,2" }
        }
        
        const style = connectionStyles[link.type] || { color: "#e5e7eb", width: "2" }
        line.setAttribute("stroke", style.color)
        line.setAttribute("stroke-width", style.width)
        if (style.dash) {
          line.setAttribute("stroke-dasharray", style.dash)
        }
        line.setAttribute("opacity", "0.7")
        svg.appendChild(line)
      }
    })

    // Draw nodes with enhanced styling
    nodes.forEach((node) => {
      const group = document.createElementNS(svgNS, "g")
      group.setAttribute("class", "dependency-node")

      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttribute("cx", node.x.toString())
      circle.setAttribute("cy", node.y.toString())
      circle.setAttribute("r", "25")

      const colors: Record<string, { fill: string; stroke: string }> = {
        web: { fill: "#3b82f6", stroke: "#1e40af" },
        database: { fill: "#10b981", stroke: "#047857" },
        external: { fill: "#f59e0b", stroke: "#d97706" },
      }
      const nodeStyle = colors[node.type]
      circle.setAttribute("fill", nodeStyle.fill)
      circle.setAttribute("stroke", nodeStyle.stroke)
      circle.setAttribute("stroke-width", "2")
      circle.setAttribute("opacity", "0.9")

      const text = document.createElementNS(svgNS, "text")
      text.setAttribute("x", node.x.toString())
      text.setAttribute("y", (node.y - 35).toString())
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("font-size", "11")
      text.setAttribute("font-weight", "500")
      text.setAttribute("fill", "#374151")
      text.textContent = node.name

      // Add description on hover (title element)
      const title = document.createElementNS(svgNS, "title")
      title.textContent = `${node.name}: ${node.description}`
      group.appendChild(title)

      group.appendChild(circle)
      group.appendChild(text)
      svg.appendChild(group)
    })
  }

  useEffect(() => {
    if (dependencyChartRef.current) {
      createDependencyVisualization()
    }
  }, [])

  const handleCreateMigration = (e: React.FormEvent) => {
    e.preventDefault()

    // Create new migration project with all fields
    const newProject = {
      id: migrationProjectsState.length + 1,
      name: newMigrationForm.name,
      description: newMigrationForm.description,
      status: "Planning",
      progress: 5,
      startDate: new Date().toISOString().split("T")[0],
      targetDate: calculateTargetDate(newMigrationForm.estimatedDuration),
      sourceEnvironment: newMigrationForm.sourceEnvironment,
      targetProvider: newMigrationForm.targetProvider,
      applications: newMigrationForm.applications,
      priority: newMigrationForm.priority,
      teamLead: newMigrationForm.teamLead,
      budget: newMigrationForm.budget,
    }

    // Add to projects list
    const updatedProjects = [...migrationProjectsState, newProject]
    setMigrationProjectsState(updatedProjects)

    // Save to localStorage for persistence (in a real app, this would be saved to a database)
    try {
      localStorage.setItem('migrationProjects', JSON.stringify(updatedProjects))
    } catch (error) {
      console.warn('Failed to save projects to localStorage:', error)
    }

    // Reset form and close modal
    setNewMigrationForm({
      name: "",
      description: "",
      sourceEnvironment: "",
      targetProvider: "",
      applications: [] as string[],
      priority: "medium",
      estimatedDuration: "",
      teamLead: "",
      budget: "",
    })
    setShowNewMigrationModal(false)

    // Show success notification
    alert(`Migration project "${newProject.name}" has been created successfully!`)
    
    // Automatically switch to the Active Projects tab
    setActiveTab("projects")
  }

  const calculateTargetDate = (duration: string) => {
    const today = new Date()
    let daysToAdd = 30 // default 1 month

    switch (duration) {
      case "1-2 weeks":
        daysToAdd = 14
        break
      case "3-4 weeks":
        daysToAdd = 28
        break
      case "1-2 months":
        daysToAdd = 60
        break
      case "3-6 months":
        daysToAdd = 120
        break
      case "6+ months":
        daysToAdd = 180
        break
    }

    const targetDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
    return targetDate.toISOString().split("T")[0]
  }

  // Authentication handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Find user by email
    const user = MOCK_USERS.find(u => u.email === loginForm.email)
    if (user) {
      // Special authentication for admin and gundo users
      if (user.email === 'gundo@company.com' || user.email === 'admin@company.com') {
        if (loginForm.password === 'Aa1234567$$$') {
          setCurrentUser(user)
          setShowLoginModal(false)
          setLoginForm({ email: '', password: '', showPassword: false })
        } else {
          alert('Invalid password')
        }
      } else {
        // Mock authentication for other users (any password works)
        setCurrentUser(user)
        setShowLoginModal(false)
        setLoginForm({ email: '', password: '', showPassword: false })
      }
    } else {
      alert('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setShowLoginModal(true)
    setAuthMode('login')
    setActiveTab("overview")
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!signupForm.verificationCode) {
      alert('Please enter verification code')
      return
    }

    // Create new user account
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: signupForm.email.split('@')[0],
      email: signupForm.email,
      role: 'client',
      organization: 'TechCorp',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      status: 'active'
    }

    setUsers([...users, newUser])
    setCurrentUser(newUser)
    setShowLoginModal(false)
    setAuthMode('login')
    setSignupForm({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      verificationCode: '',
      showPassword: false,
      showConfirmPassword: false 
    })
    alert(`Welcome ${newUser.name}! Account created successfully.`)
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetForm.verificationCode) {
      alert('Please enter verification code')
      return
    }

    alert('Password reset link sent to your email!')
    setAuthMode('login')
    setResetForm({ email: '', verificationCode: '' })
  }

  const handleSendVerificationCode = () => {
    alert('Verification code sent!')
  }


  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !canCreateRole(currentUser.role, newUserForm.role)) {
      alert('You do not have permission to create this user role')
      return
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      organization: newUserForm.organization || currentUser.organization,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      status: 'active'
    }

    setUsers([...users, newUser])
    setNewUserForm({
      name: '',
      email: '',
      role: 'client',
      organization: '',
      password: '',
      confirmPassword: ''
    })
    setShowCreateUserModal(false)
    alert(`User ${newUser.name} created successfully!`)
  }

  const handleDeleteUser = (userId: string) => {
    if (!currentUser || !hasPermission(currentUser.role, 'manage_organization_users')) {
      alert('You do not have permission to delete users')
      return
    }

    if (userId === currentUser.id) {
      alert('You cannot delete your own account')
      return
    }

    setUsers(users.filter(u => u.id !== userId))
    alert('User deleted successfully')
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      client: 'bg-gray-100 text-gray-800',
      manager: 'bg-blue-100 text-blue-800',
      local_admin: 'bg-purple-100 text-purple-800',
      developer: 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      Completed: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Planning: "bg-yellow-100 text-yellow-800",
      Pending: "bg-gray-100 text-gray-800",
      migrating: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Cloud className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">CloudMigrate Pro</h1>
              </div>
              {currentUser && (
                <nav className="hidden md:flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{activeProjects} Active Projects</span>
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{USER_ROLES[currentUser.role]?.name}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {hasPermission(currentUser.role, 'manage_team_users') && (
                    <button
                      onClick={() => setShowUserManagement(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                      title="User Management"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  )}
                  
                  {hasPermission(currentUser.role, 'read_dashboard') && (
                    <button
                      onClick={() => setShowNewMigrationModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Migration</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Please log in to continue</div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Dashboard */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi) => {
                const IconComponent = kpi.icon
                return (
                  <div key={kpi.title} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <p className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {kpi.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${kpi.iconColor}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Migration Progress Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Progress Overview</h3>
              <div className="space-y-4">
                {migrationProjectsState.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                        >
                          {project.status}
                        </span>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.status)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Started: {project.startDate}</span>
                      <span>Target: {project.targetDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discovery & Planning */}
        {activeTab === "discovery" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dependency Mapping */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Dependencies</h3>
                <div className="relative">
                  <svg ref={dependencyChartRef} className="w-full h-96 border rounded"></svg>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-6 text-sm">
                    <h4 className="font-medium text-gray-900">Service Types:</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Web Services</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Databases</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>External APIs</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <h4 className="font-medium text-gray-900">Connection Types:</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-blue-500"></div>
                      <span>HTTPS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-green-500"></div>
                      <span>Internal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-purple-500"></div>
                      <span>Database</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-red-500 border-dashed border-t"></div>
                      <span>Cache</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TCO Calculator */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Total Cost of Ownership</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Current On-Premises</p>
                      <p className="text-2xl font-bold text-gray-900">${currentCost.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Projected Cloud Cost</p>
                      <p className="text-2xl font-bold text-blue-900">${projectedCost.toLocaleString()}</p>
                      <p className="text-xs text-blue-500">per month</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Estimated Savings</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${(currentCost - projectedCost).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-500">
                      {Math.round(((currentCost - projectedCost) / currentCost) * 100)}% reduction
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                  <div className="space-y-2">
                    {costBreakdown.map((item) => (
                      <div key={item.category} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Migration Readiness Assessment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Readiness Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {readinessAssessment.map((assessment) => (
                  <div key={assessment.category} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - assessment.score / 100)}`}
                          className={`transition-all duration-300 ${getScoreColor(assessment.score)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{assessment.score}%</span>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900">{assessment.category}</h4>
                    <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependency Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Dependency Paths */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Critical Dependency Paths</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-400 pl-4">
                    <h4 className="font-medium text-red-800">High Risk Path</h4>
                    <p className="text-sm text-gray-600">Web App → API Gateway → Auth Service → User DB</p>
                    <p className="text-xs text-red-600 mt-1">Single point of failure detected</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <h4 className="font-medium text-yellow-800">Medium Risk Path</h4>
                    <p className="text-sm text-gray-600">Order Service → Payment API → External Provider</p>
                    <p className="text-xs text-yellow-600 mt-1">External dependency risk</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-medium text-green-800">Low Risk Path</h4>
                    <p className="text-sm text-gray-600">Analytics → Data Warehouse → Reports</p>
                    <p className="text-xs text-green-600 mt-1">Independent migration path</p>
                  </div>
                </div>
              </div>

              {/* Migration Complexity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Complexity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Dependencies</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="w-12 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-red-600">High</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Integrations</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">Medium</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">External Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Low</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Synchronization</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="w-14 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-red-600">Critical</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> Prioritize database migration and implement data sync strategies early.
                  </p>
                </div>
              </div>

              {/* Service Health Score */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Health Score</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Authentication Service</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">User Management</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Product Catalog</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Order Processing</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">72%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Search Service</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">91%</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                  <p className="text-sm text-gray-600">Overall Health Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution Dashboard */}
        {activeTab === "execution" && (
          <div className="space-y-6">
            {/* Migration Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {migrationPhases.map((phase, index) => (
                    <div key={phase.id} className="relative flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getPhaseColor(phase.status)}`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{phase.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}
                          >
                            {phase.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Duration: {phase.duration}</span>
                          <span>Resources: {phase.resources}</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(phase.status)}`}
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Migrations</h3>
                <div className="space-y-4">
                  {activeMigrations.map((migration) => (
                    <div key={migration.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{migration.service}</h4>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              migration.status === "migrating" ? "bg-blue-400 animate-pulse" : "bg-green-400"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-600">{migration.status}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Source: {migration.source}</p>
                        <p>Target: {migration.target}</p>
                        <p>ETA: {migration.eta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getMetricColor(metric.value)}`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{metric.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Performance Comparison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Benchmarking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceBenchmarks.map((benchmark) => (
                  <div key={benchmark.metric} className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{benchmark.metric}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Before</span>
                        <span className="font-medium">{benchmark.before}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">After</span>
                        <span className="font-medium">{benchmark.after}</span>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          benchmark.improvement > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {benchmark.improvement > 0 ? "+" : ""}
                        {benchmark.improvement}% improvement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Savings Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Savings Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Monthly Cost Comparison</h4>
                  <div className="space-y-3">
                    {costComparison.map((cost) => (
                      <div key={cost.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{cost.category}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${cost.current.toLocaleString()} → ${cost.cloud.toLocaleString()}
                          </div>
                          <div className={`text-xs ${cost.savings > 0 ? "text-green-600" : "text-red-600"}`}>
                            {cost.savings > 0 ? "Save" : "Additional"} ${Math.abs(cost.savings).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">ROI Projection</h4>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Annual Savings</p>
                    <p className="text-3xl font-bold text-green-900">$2.4M</p>
                    <p className="text-sm text-green-600 mt-2">ROI: 340% over 3 years</p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Migration Investment</span>
                      <span className="font-medium">$850K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Break-even Point</span>
                      <span className="font-medium">8 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3-Year Net Benefit</span>
                      <span className="font-medium text-green-600">$6.3M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Migration Modal */}
        {showNewMigrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Start New Migration</h2>
                <button onClick={() => setShowNewMigrationModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateMigration} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Migration Name *</label>
                    <input
                      type="text"
                      required
                      value={newMigrationForm.name}
                      onChange={(e) => setNewMigrationForm({ ...newMigrationForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Customer Portal Migration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newMigrationForm.description}
                      onChange={(e) => setNewMigrationForm({ ...newMigrationForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the migration scope and objectives..."
                    />
                  </div>
                </div>

                {/* Source & Target */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Source & Target</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Environment *</label>
                      <select
                        required
                        value={newMigrationForm.sourceEnvironment}
                        onChange={(e) =>
                          setNewMigrationForm({ ...newMigrationForm, sourceEnvironment: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select source...</option>
                        <option value="on-premises">On-Premises Data Center</option>
                        <option value="private-cloud">Private Cloud</option>
                        <option value="hybrid">Hybrid Environment</option>
                        <option value="other-cloud">Other Cloud Provider</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Cloud Provider *</label>
                      <select
                        required
                        value={newMigrationForm.targetProvider}
                        onChange={(e) => setNewMigrationForm({ ...newMigrationForm, targetProvider: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select target...</option>
                        <option value="aws">Amazon Web Services (AWS)</option>
                        <option value="azure">Microsoft Azure</option>
                        <option value="gcp">Google Cloud Platform</option>
                        <option value="hybrid">Multi-Cloud/Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Applications & Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Applications & Services</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Web Applications",
                      "Databases",
                      "API Services",
                      "File Storage",
                      "Email Systems",
                      "Analytics Tools",
                      "Security Services",
                      "Monitoring Tools",
                      "CI/CD Pipelines",
                    ].map((app) => (
                      <label key={app} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newMigrationForm.applications.includes(app)}
                          onChange={(e) => {
                            const apps = e.target.checked
                              ? [...newMigrationForm.applications, app]
                              : newMigrationForm.applications.filter((a) => a !== app)
                            setNewMigrationForm({ ...newMigrationForm, applications: apps })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{app}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                      <select
                        value={newMigrationForm.priority}
                        onChange={(e) => setNewMigrationForm({ ...newMigrationForm, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                      <select
                        value={newMigrationForm.estimatedDuration}
                        onChange={(e) =>
                          setNewMigrationForm({ ...newMigrationForm, estimatedDuration: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select duration...</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="3-4 weeks">3-4 weeks</option>
                        <option value="1-2 months">1-2 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6+ months">6+ months</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team Lead</label>
                      <input
                        type="text"
                        value={newMigrationForm.teamLead}
                        onChange={(e) => setNewMigrationForm({ ...newMigrationForm, teamLead: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter team lead name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
                      <input
                        type="text"
                        value={newMigrationForm.budget}
                        onChange={(e) => setNewMigrationForm({ ...newMigrationForm, budget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., $50,000"
                      />
                    </div>
                  </div>
                </div>

                {/* Migration Strategy */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Migration Strategy</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <Server className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Lift & Shift</h4>
                          <p className="text-sm text-gray-600">Move applications as-is to cloud</p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Re-architect</h4>
                          <p className="text-sm text-gray-600">Modernize for cloud-native benefits</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Pre-Migration Checklist</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Dependency mapping completed</li>
                        <li>• Security assessment performed</li>
                        <li>• Backup and rollback plan prepared</li>
                        <li>• Stakeholder approval obtained</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewMigrationModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Create Migration Project</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              
              {/* Login Mode */}
              {authMode === 'login' && (
                <>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Cloud className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Cloud Migration Management Portal
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Sign in to your account
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Phone number / email address"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={loginForm.showPassword ? 'text' : 'password'}
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setLoginForm({ ...loginForm, showPassword: !loginForm.showPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {loginForm.showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>


                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                      Log in
                    </button>
                  </form>


                </>
              )}

              {/* Signup Mode */}
              {authMode === 'signup' && (
                <>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Cloud className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      Only email registration is supported in your region. One DeepSeek account is all you need to access to all DeepSeek services.
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email address"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={signupForm.showPassword ? 'text' : 'password'}
                        required
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, showPassword: !signupForm.showPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {signupForm.showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={signupForm.showConfirmPassword ? 'text' : 'password'}
                        required
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, showConfirmPassword: !signupForm.showConfirmPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {signupForm.showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">#</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={signupForm.verificationCode}
                          onChange={(e) => setSignupForm({ ...signupForm, verificationCode: e.target.value })}
                          className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Code"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Send code
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      By signing up, you consent to DeepSeek's{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                      Sign up
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Log in
                    </button>
                  </div>
                </>
              )}

              {/* Password Reset Mode */}
              {authMode === 'reset' && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset password</h2>
                    <p className="text-gray-600 text-sm">
                      Enter your phone number or email address and we will send you a verification code to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email address / +86 phone number"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">#</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={resetForm.verificationCode}
                          onChange={(e) => setResetForm({ ...resetForm, verificationCode: e.target.value })}
                          className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Code"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Send code
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                      Continue
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Back to log in
                    </button>
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  © 2025 Cloud Migration Management Portal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Management Modal */}
        {showUserManagement && currentUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <p className="text-sm text-gray-600">
                    Role: {USER_ROLES[currentUser.role]?.name} | Access Level: {currentUser.role === 'developer' ? 'FULL PRIVILEGES' : 'LIMITED'}
                  </p>
                </div>
                <button onClick={() => setShowUserManagement(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Manage Users ({getAccessibleUsers(currentUser, users).length})
                  </h3>
                  {(hasPermission(currentUser.role, 'manage_team_users') || hasPermission(currentUser.role, 'manage_organization_users')) && (
                    <button
                      onClick={() => setShowCreateUserModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add User</span>
                    </button>
                  )}
                </div>

                {currentUser.role === 'developer' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <h4 className="font-medium text-red-800">CRITICAL ACCESS LEVEL</h4>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This panel provides unrestricted access to all user accounts and dangerous operations.
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getAccessibleUsers(currentUser, users).map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {USER_ROLES[user.role]?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {user.id !== currentUser.id && hasPermission(currentUser.role, 'manage_organization_users') && (
                                <>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete User"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                  {currentUser.role === 'developer' && (
                                    <button
                                      className="text-blue-600 hover:text-blue-900"
                                      title="Impersonate User (Developer Only)"
                                      onClick={() => {
                                        setCurrentUser(user)
                                        setShowUserManagement(false)
                                        alert(`Now impersonating ${user.name}`)
                                      }}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && currentUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                  <p className="text-sm text-gray-600 mt-1">Add a new user to your organization</p>
                </div>
                <button 
                  onClick={() => setShowCreateUserModal(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <form onSubmit={handleCreateUser} className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="user@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={newUserForm.organization}
                        onChange={(e) => setNewUserForm({ ...newUserForm, organization: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={currentUser.organization || 'Enter organization name'}
                      />
                    </div>
                  </div>

                  {/* Role & Permissions Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Role & Permissions</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(USER_ROLES)
                          .filter(([roleId]) => canCreateRole(currentUser.role, roleId))
                          .map(([roleId, role]) => (
                            <option key={roleId} value={roleId}>
                              {role.name} (Level {role.level})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Permissions for {USER_ROLES[newUserForm.role]?.name}:
                      </h4>
                      <div className="max-h-32 overflow-y-auto">
                        <ul className="text-xs text-blue-700 space-y-1">
                          {USER_ROLES[newUserForm.role]?.permissions.map(permission => (
                            <li key={permission} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                              {permission === '*' ? 'All permissions (FULL ACCESS)' : permission.replace('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Security</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter secure password"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters recommended</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newUserForm.confirmPassword}
                        onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm password"
                      />
                      {newUserForm.password && newUserForm.confirmPassword && newUserForm.password !== newUserForm.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">User Summary</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {newUserForm.name || 'Not specified'}</p>
                      <p><strong>Email:</strong> {newUserForm.email || 'Not specified'}</p>
                      <p><strong>Role:</strong> {USER_ROLES[newUserForm.role]?.name} (Level {USER_ROLES[newUserForm.role]?.level})</p>
                      <p><strong>Organization:</strong> {newUserForm.organization || currentUser.organization || 'Not specified'}</p>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-lg">
                <div className="text-xs text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleCreateUser}
                    disabled={!newUserForm.name || !newUserForm.email || !newUserForm.password || !newUserForm.confirmPassword || newUserForm.password !== newUserForm.confirmPassword}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Save User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infrastructure Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Infrastructure Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Infrastructure Overview</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Server className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">Physical Servers</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Cloud className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">12</p>
                  <p className="text-sm text-blue-600">Virtual Machines</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Production Environment</span>
                  </div>
                  <span className="text-sm text-gray-600">8 servers, 2TB storage</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Staging Environment</span>
                  </div>
                  <span className="text-sm text-gray-600">4 servers, 500GB storage</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Development Environment</span>
                  </div>
                  <span className="text-sm text-gray-600">4 servers, 200GB storage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Migration Timeline Estimate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Timeline Estimate</h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Phase 1: Assessment</span>
                  <span className="text-sm text-gray-600">2 weeks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="w-full h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-xs text-green-600 mt-1">Completed</p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Phase 2: Infrastructure Setup</span>
                  <span className="text-sm text-gray-600">4 weeks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">In Progress (75%)</p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Phase 3: Data Migration</span>
                  <span className="text-sm text-gray-600">6 weeks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="w-1/4 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">Starting Soon (25%)</p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Phase 4: Application Migration</span>
                  <span className="text-sm text-gray-600">8 weeks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="w-0 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Phase 5: Testing & Go-Live</span>
                  <span className="text-sm text-gray-600">3 weeks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="w-0 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Total Estimated Duration</span>
                <span className="text-lg font-bold text-blue-900">23 weeks</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Expected completion: Q2 2024</p>
            </div>
          </div>
        </div>

        {/* Migration Readiness Assessment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Readiness Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {readinessAssessment.map((assessment) => (
              <div key={assessment.category} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - assessment.score / 100)}`}
                      className={`transition-all duration-300 ${getScoreColor(assessment.score)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{assessment.score}%</span>
                  </div>
                </div>
                <h4 className="font-medium text-gray-900">{assessment.category}</h4>
                <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Active Migration Projects</h2>
                <p className="text-gray-600 mt-1">Monitor and manage all your cloud migration projects</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Total Projects: <span className="font-semibold text-gray-900">{migrationProjectsState.length}</span>
                </div>
                <button
                  onClick={() => setShowNewMigrationModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {migrationProjectsState.filter(p => p.status === 'In Progress').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Planning</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {migrationProjectsState.filter(p => p.status === 'Planning').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {migrationProjectsState.filter(p => p.status === 'Completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((migrationProjectsState.filter(p => p.status === 'Completed').length / migrationProjectsState.length) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {migrationProjectsState.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                            {project.targetProvider && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Target: {project.targetProvider.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.status)}`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>Start: {project.startDate}</div>
                            <div>Target: {project.targetDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.teamLead || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Edit Project"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            {hasPermission(currentUser?.role || '', 'manage_organization_users') && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                                    setMigrationProjectsState(migrationProjectsState.filter(p => p.id !== project.id))
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Project"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Project Activity</h3>
              <div className="space-y-4">
                {migrationProjectsState.slice(0, 5).map((project) => (
                  <div key={`activity-${project.id}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'Completed' ? 'bg-green-500' :
                      project.status === 'In Progress' ? 'bg-blue-500' :
                      project.status === 'Planning' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        {project.status === 'Completed' ? 'Migration completed successfully' :
                         project.status === 'In Progress' ? `Migration in progress - ${project.progress}% complete` :
                         project.status === 'Planning' ? 'Project planning phase' :
                         'Project status updated'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(project.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
