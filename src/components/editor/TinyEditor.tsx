/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useCallback } from 'react'

import { Editor } from '@tinymce/tinymce-react'

import articleAPIs from '@/views/services/articleAPIs'

interface TinyEditorProps {
  disabled: boolean
  value: string
  onChange: (content: string) => void
  height?: number
  plugins?: string
  toolbar?: string
}

interface BlobInfo {
  id(): string
  name(): string
  filename(): string
  blob(): Blob
  base64(): string
  blobUri(): string
  uri(): string | undefined
}

const TinyEditor: React.FC<TinyEditorProps> = ({
  value,
  onChange,
  disabled = false,
  height = 500,
  plugins = 'lists link image table code help wordcount',
  toolbar = 'undo redo formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
}) => {
  const editorRef = useRef<any>(null)
  const blobUrlMapRef = useRef<Map<string, string>>(new Map())
  const uploadedImagesRef = useRef<Set<string>>(new Set()) // Track uploaded images
  const previousContentRef = useRef<string>('')

  // Handle editor content change
  const handleEditorChange = useCallback(
    (content: string) => {
      // Check for deleted images
      if (previousContentRef.current) {
        checkForDeletedImages(content, previousContentRef.current)
      }

      previousContentRef.current = content
      onChange(content)
    },
    [onChange]
  )

  // Filter out potentially problematic plugins
  const safePlugins = plugins
    .split(' ')
    .filter(
      plugin => plugin && plugin !== 'hr' && plugin !== 'emoticons' && plugin !== 'charmap' && plugin !== 'anchor'
    )
    .join(' ')

  // Image upload handler
  const handleImageUpload = useCallback((blobInfo: BlobInfo, progress?: (percent: number) => void): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      try {
        const blobUrl = URL.createObjectURL(blobInfo.blob())

        const formData = new FormData()

        formData.append('file', blobInfo.blob(), blobInfo.filename())

        articleAPIs
          .uploadImage(formData, progressEvent => {
            if (progressEvent.total && progress) {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)

              progress(percentage)
            }
          })
          .then(response => {
            if (response.data?.url) {
              const fullUrl = response.data.url

              // Store mapping and track uploaded image
              blobUrlMapRef.current.set(blobUrl, fullUrl)
              uploadedImagesRef.current.add(fullUrl)

              resolve(fullUrl)
            } else {
              console.warn('No url in response, using blob URL')
              resolve(blobUrl)
            }
          })
          .catch(error => {
            console.error('Upload failed:', error)
            resolve(blobUrl)
          })
      } catch (error) {
        console.error('Error in upload handler:', error)
        reject(error)
      }
    })
  }, [])

  // Handle image deletion
  const handleImageDelete = useCallback(async (imageUrl: string) => {
    try {
      const filename = imageUrl.split('/').pop() || ''

      await articleAPIs.deleteContentImage(filename)

      // For now, just remove from tracking
      uploadedImagesRef.current.delete(imageUrl)

      // Remove from blob mapping if exists
      blobUrlMapRef.current.forEach((url, blobUrl) => {
        if (url === imageUrl) {
          blobUrlMapRef.current.delete(blobUrl)
          URL.revokeObjectURL(blobUrl)
        }
      })
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }, [])

  // Check for deleted images in content
  const checkForDeletedImages = useCallback(
    (newContent: string, oldContent: string) => {
      const getImagesFromContent = (content: string): string[] => {
        const imgRegex = /<img[^>]+src="([^"]+)"/g
        const images: string[] = []
        let match

        while ((match = imgRegex.exec(content)) !== null) {
          images.push(match[1])
        }

        return images
      }

      const oldImages = getImagesFromContent(oldContent)
      const newImages = getImagesFromContent(newContent)

      // Find images that were removed
      const deletedImages = oldImages.filter(img => !newImages.includes(img) && uploadedImagesRef.current.has(img))

      // Delete removed images
      deletedImages.forEach(imageUrl => {
        handleImageDelete(imageUrl)
      })
    },
    [handleImageDelete]
  )

  // Setup editor configuration
  const editorSetup = useCallback((editor: any) => {
    // Replace blob URLs with actual URLs when getting content
    editor.on('GetContent', (e: any) => {
      if (e.content && blobUrlMapRef.current.size > 0) {
        let modifiedContent = e.content

        blobUrlMapRef.current.forEach((actualUrl, blobUrl) => {
          const escapedBlobUrl = blobUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const blobUrlRegex = new RegExp(escapedBlobUrl, 'g')

          modifiedContent = modifiedContent.replace(blobUrlRegex, actualUrl)
        })

        e.content = modifiedContent
      }
    })

    // Cleanup when editor is destroyed
    editor.on('remove', () => {
      blobUrlMapRef.current.forEach((_, blobUrl) => {
        URL.revokeObjectURL(blobUrl)
      })
      blobUrlMapRef.current.clear()
      uploadedImagesRef.current.clear()
    })
  }, [])

  return (
    <>
      <Editor
        disabled={disabled}
        tinymceScriptSrc='/tinymce/tinymce.min.js'
        onInit={(evt: any, editor: any) => {
          editorRef.current = editor

          // Set initial content to track
          previousContentRef.current = value || ''
        }}
        value={value || ''}
        init={{
          height,
          menubar: true,
          plugins: safePlugins,
          toolbar,
          content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
          cache_suffix: '?v=2',
          promotion: false,
          automatic_uploads: true,
          language: 'en',
          image_caption: true,
          convert_urls: false,
          relative_urls: false,
          remove_script_host: false,
          images_upload_handler: handleImageUpload,
          file_picker_types: 'image',
          images_reuse_filename: true,
          setup: editorSetup,
          branding: false,
          resize: 'both',
          statusbar: true
        }}
        onEditorChange={handleEditorChange}
      />
    </>
  )
}

export default TinyEditor
