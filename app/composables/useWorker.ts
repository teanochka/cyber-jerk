// Composable for LLM web worker lifecycle and communication.

import { ref } from 'vue'

const modelReady = ref(false)
const modelLoading = ref(false)
const modelProgress = ref(0)
const selectedModel = ref('HuggingFaceTB/SmolLM2-360M-Instruct')
const selectedDataType = ref('q8')
const selectedDevice = ref('wasm')
const maxTokens = ref(200)

const availableModels = [
    'HuggingFaceTB/SmolLM2-360M-Instruct',
    'HuggingFaceTB/SmolLM3-3B-Base',
    'onnx-community/Qwen2.5-0.5B-Instruct',
    'onnx-community/Qwen3-0.6B-DQ-ONNX',
    'Xenova/llama2.c-stories110M',
    'onnx-community/gemma-3-270m-it-ONNX',
    'onnx-community/Llama-3.2-1B-Instruct-ONNX',
]

const availableDataTypes = ['fp32', 'fp16', 'q8', 'q4']
const availableDevices = ['wasm', 'webgpu']


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

function resetModel() {
    if (worker) {
        worker.terminate()
        worker = null
    }
    modelReady.value = false
    modelLoading.value = false
    modelProgress.value = 0
    pendingRequests.clear()
}


function workerGenerate(chatMessages: any[], _ignoredMaxTokens?: number): Promise<string> {
    ensureWorker()
    const id = ++requestId
    // Use the reactive maxTokens value instead of the argument if preferred, 
    // or we can stick to the argument. The user prompt implies "these parameters apply to the app".
    // Since useChatAgents was passing 60 hardcoded, we should prefer the reactive value.
    const prompt = JSON.stringify({ messages: chatMessages, maxTokens: maxTokens.value })
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

        // If selectedModel is still default/empty, try to check runtime config? 
        // Or just let the user selection stand. The refs are initialized with defaults.

        worker!.postMessage({
            type: 'init',
            config: {
                MODEL_ID: selectedModel.value,
                max_tokens: maxTokens.value,
                dtype: selectedDataType.value,
                device: selectedDevice.value,
            },
        })
    }


    return {
        modelReady,
        modelLoading,
        modelProgress,
        selectedModel,
        selectedDataType,
        selectedDevice,
        maxTokens,
        availableModels,
        availableDataTypes,
        availableDevices,
        initModel,
        resetModel,
        workerGenerate,
    }
}

