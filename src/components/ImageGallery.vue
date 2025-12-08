<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { listFiles } from '@/utils/storage-utils'

interface ImageItem {
  name: string
  url: string
  created_at: string
  size: number
}

const images = ref<ImageItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadImages = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 使用工具函数获取过滤后的文件列表
    const { data: files, error } = await listFiles('image', 'uploads/', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

    if (error) {
      throw error
    }

    if (files && files.length > 0) {
      // 过滤掉系统文件 .emptyFolderPlaceholder
      const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder')
      
      // 为每个文件生成公开URL
      const imageItems: ImageItem[] = validFiles.map(file => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('image')
          .getPublicUrl(`uploads/${file.name}`)

        return {
          name: file.name,
          url: publicUrl,
          created_at: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || 0
        }
      })

      images.value = imageItems
    } else {
      images.value = []
    }
  } catch (error: any) {
    errorMessage.value = error.message || '加载图片失败'
    console.error('Load images error:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteImage = async (imageName: string) => {
  if (!confirm(`确定要删除图片 "${imageName}" 吗？`)) {
    return
  }

  try {
    const { error } = await supabase
      .storage
      .from('image')
      .remove([`uploads/${imageName}`])

    if (error) {
      throw error
    }

    // 从列表中移除
    images.value = images.value.filter(img => img.name !== imageName)
    
  } catch (error: any) {
    alert(`删除失败: ${error.message}`)
    console.error('Delete error:', error)
  }
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  loadImages()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          图片库
        </h2>
        <button
          @click="loadImages"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {{ isLoading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-red-600 dark:text-red-400 text-sm">
          {{ errorMessage }}
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">正在加载图片...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="images.length === 0" class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          暂无图片
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          上传一些图片来开始管理您的图片库
        </p>
      </div>

      <!-- 图片网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="image in images"
          :key="image.name"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 图片预览 -->
          <div class="aspect-square relative">
            <img
              :src="image.url"
              :alt="image.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- 图片信息 -->
          <div class="p-4">
            <h4 class="font-medium text-gray-900 dark:text-white truncate mb-2">
              {{ image.name }}
            </h4>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
              <p>大小: {{ formatFileSize(image.size) }}</p>
              <p>上传时间: {{ formatDate(image.created_at) }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex space-x-2">
              <button
                @click="copyUrl(image.url)"
                class="flex-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                复制链接
              </button>
              <button
                @click="deleteImage(image.name)"
                class="flex-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>