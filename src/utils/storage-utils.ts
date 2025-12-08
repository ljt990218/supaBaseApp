import { supabase } from '@/lib/supabase'

export interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    size: number
    mimetype: string
    cacheControl?: string
    contentLength?: number
    httpStatusCode?: number
    eTag?: string
  }
}

/**
 * 过滤 Supabase 存储文件列表中的系统文件
 * @param files - 从 Supabase storage.list() 返回的文件数组
 * @returns 过滤后的文件数组
 */
export const filterSystemFiles = (files: StorageFile[]): StorageFile[] => {
  return files.filter(file => {
    // 过滤掉 .emptyFolderPlaceholder
    if (file.name === '.emptyFolderPlaceholder') return false
    
    // 过滤掉其他系统文件（以.开头的隐藏文件）
    if (file.name.startsWith('.')) return false
    
    // 过滤掉大小为0的文件（通常是占位符）
    if (file.metadata?.size === 0) return false
    
    return true
  })
}

/**
 * 获取存储桶中的文件列表（自动过滤系统文件）
 * @param bucketName - 存储桶名称
 * @param path - 路径
 * @param options - 列表选项
 * @returns 过滤后的文件列表
 */
export const listFiles = async (
  bucketName: string, 
  path = '', 
  options: any = {}
): Promise<{ data: StorageFile[] | null; error: any }> => {
  try {
    const { data: files, error } = await supabase
      .storage
      .from(bucketName)
      .list(path, options)

    if (error) {
      return { data: null, error }
    }

    if (!files) {
      return { data: [], error: null }
    }

    // 过滤系统文件
    const filteredFiles = filterSystemFiles(files as StorageFile[])
    
    return { data: filteredFiles, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * 检查文件是否为系统文件
 * @param fileName - 文件名
 * @returns 是否为系统文件
 */
export const isSystemFile = (fileName: string): boolean => {
  return (
    fileName === '.emptyFolderPlaceholder' ||
    fileName.startsWith('.') ||
    fileName.includes('/.emptyFolderPlaceholder')
  )
}

/**
 * 清理存储桶中的系统文件
 * @param bucketName - 存储桶名称
 * @param path - 路径
 * @returns 清理结果
 */
export const cleanupSystemFiles = async (
  bucketName: string, 
  path = ''
): Promise<{ success: boolean; cleanedCount: number; error: any }> => {
  try {
    const { data: files, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list(path)

    if (listError) {
      return { success: false, cleanedCount: 0, error: listError }
    }

    if (!files || files.length === 0) {
      return { success: true, cleanedCount: 0, error: null }
    }

    // 找出系统文件
    const systemFiles = files
      .filter(file => isSystemFile(file.name))
      .map(file => path ? `${path}/${file.name}` : file.name)

    if (systemFiles.length === 0) {
      return { success: true, cleanedCount: 0, error: null }
    }

    // 删除系统文件
    const { error: deleteError } = await supabase
      .storage
      .from(bucketName)
      .remove(systemFiles)

    if (deleteError) {
      return { success: false, cleanedCount: 0, error: deleteError }
    }

    return { success: true, cleanedCount: systemFiles.length, error: null }
  } catch (error) {
    return { success: false, cleanedCount: 0, error }
  }
}