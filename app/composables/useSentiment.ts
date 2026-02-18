import { ref, watch } from 'vue'

const isSentimentEnabled = ref(false)
const sentimentModelReady = ref(false)
const sentimentModelLoading = ref(false)
const sentimentModelProgress = ref(0)

let worker: Worker | null = null
let requestId = 0
const pendingRequests = new Map<
    number,
    { resolve: (v: any) => void; reject: (e: Error) => void }
>()

function ensureWorker() {
    if (worker) return
    worker = new Worker(new URL('~/workers/sentiment.worker.ts', import.meta.url), {
        type: 'module',
    })

    worker.addEventListener('message', (e) => {
        const data = e.data
        if (data.type === 'init-progress') {
            sentimentModelProgress.value = data.progress ?? 0
        } else if (data.type === 'init-done') {
            sentimentModelReady.value = true
            sentimentModelLoading.value = false
            sentimentModelProgress.value = 100
            // console.log('[useSentiment] Model ready')
        } else if (data.type === 'classify-result' && data.id != null) {
            pendingRequests.get(data.id)?.resolve(data.result)
            pendingRequests.delete(data.id)
        } else if (data.type === 'error') {
            if (data.id != null) {
                pendingRequests.get(data.id)?.reject(new Error(data.error))
                pendingRequests.delete(data.id)
            } else {
                console.error('[Sentiment Worker Error]', data.error)
                sentimentModelLoading.value = false
            }
        }
    })
}

function initSentimentModel() {
    if (sentimentModelReady.value || sentimentModelLoading.value) return
    // console.log('[useSentiment] Initializing model...')
    sentimentModelLoading.value = true
    sentimentModelProgress.value = 0
    ensureWorker()
    worker!.postMessage({ type: 'init' })
}

function terminateWorker() {
    if (worker) {
        worker.terminate()
        worker = null
    }
    sentimentModelReady.value = false
    sentimentModelLoading.value = false
    sentimentModelProgress.value = 0
    // console.log('[useSentiment] Worker terminated')
}

// Watch for toggle changes to start/stop worker
watch(isSentimentEnabled, (enabled) => {
    if (enabled) {
        initSentimentModel()
    } else {
        // Optional: terminate to save resources if disabled?
        // Let's keep it alive for now, or maybe terminate.
        // terminating is safer for "experimental" toggle behavior.
        // terminateWorker() 
        // actually, let's just keep it loaded if they toggle back and forth.
        if (!sentimentModelReady.value && !sentimentModelLoading.value) {
            initSentimentModel()
        }
    }
})

async function classifyText(text: string): Promise<{ label: string; score: number } | null> {
    if (!isSentimentEnabled.value || !sentimentModelReady.value) return null

    ensureWorker()
    const id = ++requestId
    return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject })
        worker!.postMessage({ type: 'classify', id, text })
    })
}

export function useSentiment() {
    return {
        isSentimentEnabled,
        sentimentModelReady,
        sentimentModelLoading,
        sentimentModelProgress,
        classifyText,
    }
}
