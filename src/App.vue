<script setup lang="ts">
import { ref } from 'vue'
import UserManager from './components/UserManager.vue'
import ImageUploader from './components/ImageUploader.vue'
import ImageGallery from './components/ImageGallery.vue'
import StorageTest from './components/StorageTest.vue'

const activeTab = ref('users')

const tabs = [
  { key: 'users', label: '用户管理' },
  { key: 'upload', label: '图片上传' },
  { key: 'gallery', label: '图片库' },
  { key: 'storage-test', label: '存储测试' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-2 dark:bg-zinc-950">
    <div class="container mx-auto px-4">
      <div class="mb-8 text-center">
        <h1 class="mt-4 mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          Supabase 管理面板
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          用户管理和图片上传功能
        </p>
      </div>

      <!-- 标签页导航 -->
      <div class="mb-8 flex justify-center">
        <div class="flex gap-2 rounded-lg bg-white p-1 shadow-sm dark:bg-zinc-800s">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            :class="['rounded-md py-2 font-medium hover:text-white dark:text-gray-400  px-6 transition-colors', activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-300 dark:hover:text-white']">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div v-if="activeTab === 'users'">
        <UserManager />
      </div>
      <div v-else-if="activeTab === 'upload'">
        <ImageUploader />
      </div>
      <div v-else-if="activeTab === 'gallery'">
        <ImageGallery />
      </div>
      <div v-else-if="activeTab === 'storage-test'">
        <StorageTest />
      </div>
    </div>
  </div>
</template>
