<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { listFiles, cleanupSystemFiles, isSystemFile } from '@/utils/storage-utils'

const testResults = ref<string[]>([])
const isTesting = ref(false)

const runStorageTest = async () => {
  isTesting.value = true
  testResults.value = []

  try {
    testResults.value.push('🧪 开始存储桶测试...')

    // 测试1: 直接列出文件（不过滤）
    testResults.value.push('📋 测试1: 直接列出所有文件（包含系统文件）')
    const { data: rawFiles, error: rawError } = await supabase
      .storage
      .from('image')
      .list('uploads/')

    if (rawError) {
      testResults.value.push(`❌ 错误: ${rawError.message}`)
    } else if (rawFiles) {
      const systemFiles = rawFiles.filter(file => isSystemFile(file.name))
      testResults.value.push(`📊 找到 ${rawFiles.length} 个文件，其中 ${systemFiles.length} 个是系统文件`)
      
      if (systemFiles.length > 0) {
        systemFiles.forEach(file => {
          testResults.value.push(`🔍 发现系统文件: ${file.name} (大小: ${file.metadata?.size || 0})`)
        })
      }
    }

    // 测试2: 使用过滤函数
    testResults.value.push('🔄 测试2: 使用过滤函数列出文件')
    const { data: filteredFiles, error: filteredError } = await listFiles('image', 'uploads/')

    if (filteredError) {
      testResults.value.push(`❌ 错误: ${filteredError.message}`)
    } else if (filteredFiles) {
      testResults.value.push(`✅ 过滤后找到 ${filteredFiles.length} 个有效文件`)
      filteredFiles.forEach(file => {
        testResults.value.push(`📄 ${file.name} (${file.metadata?.size || 0} bytes)`)
      })
    }

    // 测试3: 清理系统文件
    testResults.value.push('🧹 测试3: 尝试清理系统文件')
    const { success, cleanedCount, error: cleanupError } = await cleanupSystemFiles('image', 'uploads/')

    if (cleanupError) {
      testResults.value.push(`❌ 清理失败: ${cleanupError.message}`)
    } else if (cleanedCount > 0) {
      testResults.value.push(`✅ 成功清理 ${cleanedCount} 个系统文件`)
    } else {
      testResults.value.push('ℹ️ 没有发现需要清理的系统文件')
    }

    // 测试4: 验证清理结果
    testResults.value.push('✅ 测试4: 验证清理结果')
    const { data: finalFiles, error: finalError } = await listFiles('image', 'uploads/')

    if (finalError) {
      testResults.value.push(`❌ 错误: ${finalError.message}`)
    } else if (finalFiles) {
      testResults.value.push(`📊 最终找到 ${finalFiles.length} 个有效文件`)
    }

    testResults.value.push('🎉 测试完成！')

  } catch (error: any) {
    testResults.value.push(`💥 测试失败: ${error.message}`)
  } finally {
    isTesting.value = false
  }
}

const clearResults = () => {
  testResults.value = []
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          存储桶测试工具
        </h2>
        <div class="space-x-2">
          <button
            @click="runStorageTest"
            :disabled="isTesting"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ isTesting ? '测试中...' : '运行测试' }}
          </button>
          <button
            @click="clearResults"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            清除结果
          </button>
        </div>
      </div>

      <!-- 测试结果 -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
        <div v-if="testResults.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
          点击"运行测试"开始检查存储桶中的系统文件
        </div>
        <div v-else class="space-y-1 font-mono text-sm">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            class="flex items-start space-x-2"
          >
            <span class="text-gray-400">{{ index + 1 }}.</span>
            <span :class="{
              'text-green-600 dark:text-green-400': result.includes('✅') || result.includes('🎉'),
              'text-red-600 dark:text-red-400': result.includes('❌') || result.includes('💥'),
              'text-blue-600 dark:text-blue-400': result.includes('🔄') || result.includes('📊'),
              'text-yellow-600 dark:text-yellow-400': result.includes('🔍') || result.includes('🧪'),
              'text-gray-700 dark:text-gray-300': true
            }">
              {{ result }}
            </span>
          </div>
        </div>
      </div>

      <!-- 说明 -->
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">测试说明</h3>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• 检测存储桶中的 .emptyFolderPlaceholder 和其他系统文件</li>
          <li>• 验证过滤函数的有效性</li>
          <li>• 测试清理功能</li>
          <li>• 对比原生 API 和过滤后的结果差异</li>
        </ul>
      </div>
    </div>
  </div>
</template>