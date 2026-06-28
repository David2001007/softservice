import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('====================================')
  console.log('SUPABASE DEBUG')
  console.log('SUPABASE_URL =', JSON.stringify(supabaseUrl))
  console.log('SUPABASE_BUCKET =', process.env.SUPABASE_BUCKET)
  console.log('SERVICE_KEY_EXISTS =', !!supabaseServiceKey)
  console.log('====================================')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get storage bucket name from environment variable, with fallback
const STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET || 'os-arquivos'

export async function uploadFileToStorage(
  fileName: string,
  fileContent: Buffer,
  mimeType: string,
  osId: number,
): Promise<{
  fileId: string
  publicUrl: string
}> {
  const supabase = getSupabaseClient()

  console.log('====================================')
  console.log('UPLOAD STARTED')
  console.log('Bucket:', STORAGE_BUCKET)
  console.log('File:', fileName)
  console.log('MimeType:', mimeType)
  console.log('OS ID:', osId)
  console.log('====================================')

  // Create a unique file path to avoid conflicts
  const filePath = `os-${osId}/${Date.now()}-${fileName}`

  console.log('File path:', filePath)

  try {
    // Test basic connection first
    console.log('Testing Supabase connection...')

    const { data: bucketData, error: bucketError } =
      await supabase.storage.listBuckets()

    console.log(
      'Buckets response:',
      JSON.stringify(bucketData, null, 2),
    )

    if (bucketError) {
      console.error(
        'Bucket list error:',
        JSON.stringify(bucketError, null, 2),
      )
      throw bucketError
    }

    console.log('Connection OK')

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileContent, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      })

    console.log(
      'Upload response:',
      JSON.stringify(data, null, 2),
    )

    if (error) {
      console.error(
        'Error uploading file to Supabase Storage:',
        JSON.stringify(error, null, 2),
      )

      throw new Error(
        `Failed to upload file: ${error.message}`,
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrl)

    return {
      fileId: data.path,
      publicUrl,
    }
  } catch (error: any) {
    console.error('====================================')
    console.error('SUPABASE ERROR')
    console.error(error)
    console.error('Message:', error?.message)
    console.error('Cause:', error?.cause)
    console.error(
      'Response:',
      JSON.stringify(error?.response, null, 2),
    )
    console.error('====================================')

    throw error
  }
}

export async function deleteFileFromStorage(
  filePath: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  try {
    console.log('Deleting file:', filePath)

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error(
        'Error deleting file from Supabase Storage:',
        JSON.stringify(error, null, 2),
      )
    }

    console.log('File deleted successfully')
  } catch (error) {
    console.error(
      'Delete error:',
      JSON.stringify(error, null, 2),
    )
  }
}