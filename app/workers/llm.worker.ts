import { pipeline, TextGenerationPipeline } from '@huggingface/transformers'

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct'

let generator: TextGenerationPipeline | null = null

self.addEventListener('message', async (event: MessageEvent) => {
    const { type, id, prompt } = event.data

    if (type === 'init') {
        try {
            self.postMessage({ type: 'init-progress', progress: 0 })

            // @ts-ignore -- pipeline() overloads produce a union too complex for TS
            generator = await pipeline('text-generation', MODEL_ID, {
                dtype: 'q4',
                device: 'webgpu',
                progress_callback: (progress: any) => {
                    if (progress.status === 'progress') {
                        self.postMessage({
                            type: 'init-progress',
                            progress: Math.round(progress.progress ?? 0),
                        })
                    }
                },
            }) as TextGenerationPipeline

            self.postMessage({ type: 'init-done' })
        } catch (err: any) {
            self.postMessage({ type: 'error', error: err?.message ?? String(err) })
        }
        return
    }

    if (type === 'generate') {
        if (!generator) {
            self.postMessage({ type: 'error', id, error: 'Model not loaded yet.' })
            return
        }

        try {
            const { messages: chatMessages, maxTokens } = JSON.parse(prompt!)
            const output = await generator(chatMessages, {
                max_new_tokens: maxTokens ?? 100,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
            })

            // The pipeline returns an array of objects with `generated_text`.
            // For chat-style input (array of {role, content}), `generated_text`
            // is an array of message objects. The last one is the assistant reply.
            const generated = (output as any)[0]?.generated_text
            let resultText = ''

            if (Array.isArray(generated)) {
                // Chat format: generated_text is [{role, content}, ...]
                const lastMsg = generated[generated.length - 1]
                resultText = lastMsg?.content ?? ''
            } else if (typeof generated === 'string') {
                resultText = generated
            } else {
                resultText = JSON.stringify(generated)
            }

            self.postMessage({ type: 'generate-result', id, result: resultText })
        } catch (err: any) {
            self.postMessage({ type: 'error', id, error: err?.message ?? String(err) })
        }
    }
})
