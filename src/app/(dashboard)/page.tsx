'use client'

import React from 'react'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController
} from 'chart.js'
import { Chart, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { FileText, TrendingUp, Users, Eye, PenTool, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card } from '@mui/material'

type KPICardProps = {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  subtitle?: string
}

type StatsCardProps = {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController
)

const DashboardCMSArticles: React.FC = () => {
  const monthlyArticles = [
    { month: 'Jan', articles: 34, views: 5200, target: 30 },
    { month: 'Feb', articles: 28, views: 4300, target: 30 },
    { month: 'Mar', articles: 42, views: 6900, target: 30 },
    { month: 'Apr', articles: 38, views: 6100, target: 30 },
    { month: 'May', articles: 51, views: 8300, target: 30 },
    { month: 'Jun', articles: 45, views: 7200, target: 30 },
    { month: 'Jul', articles: 39, views: 6600, target: 30 }
  ]

  const categoryDistribution = [
    { name: 'Tech', value: 40, count: 112 },
    { name: 'Health', value: 25, count: 70 },
    { name: 'Lifestyle', value: 20, count: 56 },
    { name: 'Finance', value: 10, count: 28 },
    { name: 'Other', value: 5, count: 14 }
  ]

  const authorContribution = [
    { author: 'Alice', count: 42 },
    { author: 'Bob', count: 35 },
    { author: 'Charlie', count: 28 },
    { author: 'Diana', count: 18 },
    { author: 'Others', count: 9 }
  ]

  const publicationStatus = [
    { status: 'Published', value: 78, color: '#10B981' },
    { status: 'Draft', value: 12, color: '#F59E0B' },
    { status: 'Pending Review', value: 6, color: '#3B82F6' },
    { status: 'Rejected', value: 4, color: '#EF4444' }
  ]

  const monthlyArticlesConfig = {
    data: {
      labels: monthlyArticles.map(d => d.month),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Views',
          data: monthlyArticles.map(d => d.views),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          type: 'line' as const,
          label: 'Target Articles',
          data: monthlyArticles.map(d => d.target),
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y1'
        },
        {
          type: 'bar' as const,
          label: 'Articles Written',
          data: monthlyArticles.map(d => d.articles),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      scales: {
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: { display: true, text: 'Views' }
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          title: { display: true, text: 'Articles' },
          grid: { drawOnChartArea: false }
        }
      },
      plugins: {
        legend: { position: 'top' as const },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    }
  }

  const categoryConfig = {
    data: {
      labels: categoryDistribution.map(d => d.name),
      datasets: [
        {
          data: categoryDistribution.map(d => d.value),
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const item = categoryDistribution[context.dataIndex]

              return `${item.name}: ${item.value}% (${item.count} artikel)`
            }
          }
        }
      }
    }
  }

  const authorConfig = {
    data: {
      labels: authorContribution.map(d => d.author),
      datasets: [
        {
          label: 'Artikel Ditulis',
          data: authorContribution.map(d => d.count),
          backgroundColor: '#6366F1',
          borderColor: '#4338CA',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.label}: ${context.parsed.y} artikel`
            }
          }
        }
      }
    }
  }

  const publicationStatusConfig = {
    data: {
      labels: publicationStatus.map(d => d.status),
      datasets: [
        {
          data: publicationStatus.map(d => d.value),
          backgroundColor: publicationStatus.map(d => d.color),
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.label}: ${context.parsed}%`
            }
          }
        }
      }
    }
  }

  const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon, subtitle }) => {
    const color = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-blue-600'
    }[changeType]

    const changeIcon = {
      positive: <TrendingUp className='w-4 h-4 mr-1' />,
      negative: <TrendingUp className='w-4 h-4 mr-1 rotate-180' />,
      neutral: <CheckCircle className='w-4 h-4 mr-1' />
    }[changeType]

    return (
      <Card className='rounded-xl shadow-sm p-6 border'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium'>{title}</p>
            <p className='text-2xl font-bold'>{value}</p>
            <p className={`text-sm flex items-center mt-1 ${color}`}>
              {changeIcon}
              {subtitle || change}
            </p>
          </div>
          {icon}
        </div>
      </Card>
    )
  }

  const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, bgGradient }) => (
    <div className={`${bgGradient} rounded-xl shadow-sm p-6 text-white`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-white/80'>{title}</p>
          <p className='text-3xl font-bold'>{value}</p>
          <p className='text-sm text-white/80'>{subtitle}</p>
        </div>
        {icon}
      </div>
    </div>
  )

  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* KPI Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <KPICard
            title='Total Artikel'
            value='432'
            change='+14.7% bulan ini'
            changeType='positive'
            icon={<FileText className='w-8 h-8 text-blue-600' />}
          />
          <KPICard
            title='Total Views Bulan Ini'
            value='26.3K'
            change='+9.2% dari sebelumnya'
            changeType='positive'
            icon={<Eye className='w-8 h-8 text-green-600' />}
          />
          <KPICard
            title='Kontributor Aktif'
            value='12'
            change='Stabil'
            changeType='neutral'
            icon={<Users className='w-8 h-8 text-purple-600' />}
          />
          <KPICard
            title='Rata-rata Artikel / Penulis'
            value='36'
            change='5 penulis top'
            changeType='neutral'
            icon={<PenTool className='w-8 h-8 text-orange-600' />}
          />
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <Card className='rounded-xl shadow-sm p-6 border'>
            <h3 className='text-lg font-semibold mb-4'>Performa Artikel Bulanan</h3>
            <div className='h-80'>
              <Chart type='bar' data={monthlyArticlesConfig.data} options={monthlyArticlesConfig.options} />
            </div>
          </Card>

          <Card className='rounded-xl shadow-sm p-6 border'>
            <h3 className='text-lg font-semibold mb-4'>Distribusi Kategori Artikel</h3>
            <div className='h-80'>
              <Pie data={categoryConfig.data} options={categoryConfig.options} />
            </div>
          </Card>

          <Card className='rounded-xl shadow-sm p-6 border'>
            <h3 className='text-lg font-semibold mb-4'>Kontribusi Penulis</h3>
            <div className='h-80'>
              <Bar data={authorConfig.data} options={authorConfig.options} />
            </div>
          </Card>

          <Card className='rounded-xl shadow-sm p-6 border'>
            <h3 className='text-lg font-semibold mb-4'>Status Publikasi</h3>
            <div className='h-80'>
              <Doughnut data={publicationStatusConfig.data} options={publicationStatusConfig.options} />
            </div>
          </Card>
        </div>

        {/* Bottom Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <StatsCard
            title='Artikel Terbit Bulan Ini'
            value='39'
            subtitle='Naik 8.3% dari Juni'
            icon={<FileText className='w-10 h-10 text-blue-200' />}
            bgGradient='bg-gradient-to-r from-blue-500 to-blue-600'
          />
          <StatsCard
            title='Artikel Populer (>1K Views)'
            value='26'
            subtitle='66% dari total'
            icon={<Eye className='w-10 h-10 text-green-200' />}
            bgGradient='bg-gradient-to-r from-green-500 to-green-600'
          />
          <StatsCard
            title='Perlu Revisi Editorial'
            value='5'
            subtitle='Menunggu revisi penulis'
            icon={<AlertTriangle className='w-10 h-10 text-orange-200' />}
            bgGradient='bg-gradient-to-r from-orange-500 to-orange-600'
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardCMSArticles
