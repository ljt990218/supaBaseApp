<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const selectedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const uploadedUrl = ref('')
const errorMessage = ref('')

const previewUrl = computed(() => {
  return selectedFile.value ? URL.createObjectURL(selectedFile.value) : ''
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      errorMessage.value = '请选择图片文件'
      return
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = '文件大小不能超过10MB'
      return
    }

    selectedFile.value = file
    errorMessage.value = ''
    uploadedUrl.value = ''
  }
}

const uploadImage = async () => {
  if (!selectedFile.value) {
    errorMessage.value = '请选择要上传的图片'
    return
  }

  isUploading.value = true
  errorMessage.value = ''
  uploadProgress.value = 0

  try {
    // 生成唯一文件名
    const fileExtension = selectedFile.value.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`
    const filePath = `uploads/${fileName}`

    // 上传文件
    const { error } = await supabase.storage
      .from('image') // 使用你的存储桶名称
      .upload(filePath, selectedFile.value, {
        contentType: selectedFile.value.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    // 获取公开访问URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('image').getPublicUrl(filePath)

    uploadedUrl.value = publicUrl
    uploadProgress.value = 100

    // 重置表单
    selectedFile.value = null
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  } catch (error: any) {
    errorMessage.value = error.message || '上传失败，请重试'
    console.error('Upload error:', error)
  } finally {
    isUploading.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(uploadedUrl.value)
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-800">
      <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">图片上传</h2>



      <!-- 文件选择 -->
      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"> 选择图片文件 </label>
        <input
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="block w-full cursor-pointer text-sm text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
        />
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">支持 JPG、PNG、GIF、WebP 格式，最大 10MB</p>
      </div>

      <!-- 预览区域 -->
      <div v-if="selectedFile" class="mb-6">
        <h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">预览</h3>
        <div class="flex items-center space-x-4">
          <img
            :src="previewUrl"
            alt="预览"
            class="h-32 w-32 rounded-lg border-2 border-gray-200 object-cover dark:border-gray-600"
          />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">文件名: {{ selectedFile.name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              大小: {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">类型: {{ selectedFile.type }}</p>
          </div>
        </div>
      </div>

      <!-- 上传按钮 -->
      <div class="mb-6">
        <button
          @click="uploadImage"

          class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <span v-if="isUploading">上传中...</span>
          <span v-else>上传图片</span>
        </button>
      </div>

      <!-- 上传进度 -->
      <div v-if="isUploading" class="mb-6">
        <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-2 rounded-full bg-blue-600 transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">上传进度: {{ uploadProgress }}%</p>
      </div>

      <!-- 错误信息 -->
      <div
        v-if="errorMessage"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-600 dark:text-red-400">
          {{ errorMessage }}
        </p>
      </div>

      <!-- 成功结果 -->
      <div
        v-if="uploadedUrl"
        class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
      >
        <h3 class="mb-3 text-lg font-medium text-green-800 dark:text-green-300">上传成功！</h3>
        <div class="space-y-3">
          <div>
            <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">访问地址：</p>
            <div class="flex items-center space-x-2">
              <input
                :value="uploadedUrl"
                readonly
                class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              />
              <button
                @click="copyToClipboard"
                class="rounded-md bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                复制
              </button>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">图片预览：</p>
            <img
              :src="uploadedUrl"
              alt="上传的图片"
              class="h-48 max-w-full rounded-lg border border-gray-200 object-contain dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
