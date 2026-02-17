// Composable for LLM web worker lifecycle and communication.

import { ref } from 'vue'

const modelReady = ref(false)
const modelLoading = ref(false)
const modelProgress = ref(0)

let worker: Worker | null = null
let requestId = 0
const pendingRequests = new Map<
    number,
    { resolve: (v: string) => void; reject: (e: Error) => void }
>()

function ensureWorker() {
    if (worker) return
    worker = new Worker(new URL('~/workers/llm.worker.ts', import.meta.url), {
        type: 'module',
    })
    worker.addEventListener('message', (e) => {
        const data = e.data
        if (data.type === 'init-progress') {
            modelProgress.value = data.progress ?? 0
        } else if (data.type === 'init-done') {
            modelReady.value = true
            modelLoading.value = false
            modelProgress.value = 100
        } else if (data.type === 'generate-result' && data.id != null) {
            pendingRequests.get(data.id)?.resolve(data.result ?? '')
            pendingRequests.delete(data.id)
        } else if (data.type === 'error') {
            if (data.id != null) {
                pendingRequests
                    .get(data.id)
                    ?.reject(new Error(data.error ?? 'Unknown worker error'))
                pendingRequests.delete(data.id)
            } else {
                console.error('[LLM Worker]', data.error)
                modelLoading.value = false
            }
        }
    })
}

function workerGenerate(chatMessages: any[], maxTokens: number): Promise<string> {
    ensureWorker()
    const id = ++requestId
    const prompt = JSON.stringify({ messages: chatMessages, maxTokens })
    return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject })
        worker!.postMessage({ type: 'generate', id, prompt })
    })
}

export function useWorker() {
    function initModel() {
        if (modelReady.value || modelLoading.value) return
        modelLoading.value = true
        modelProgress.value = 0
        ensureWorker()

        const config = useRuntimeConfig().public
        worker!.postMessage({
            type: 'init',
            config: {
                MODEL_ID: config.MODEL_ID,
                max_tokens: config.max_tokens,
            },
        })
    }

    return {
        modelReady,
        modelLoading,
        modelProgress,
        initModel,
        workerGenerate,
    }
}
