import { pipeline, TextClassificationPipeline } from '@huggingface/transformers'

let classifier: TextClassificationPipeline | null = null

self.addEventListener('message', async (event: MessageEvent) => {
    const { type, id, text } = event.data

    if (type === 'init') {
        try {
            self.postMessage({ type: 'init-progress', progress: 0 })

            // Initialize the sentiment analysis pipeline
            classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
                progress_callback: (progress: any) => {
                    if (progress.status === 'progress') {
                        self.postMessage({
                            type: 'init-progress',
                            progress: Math.round(progress.progress ?? 0),
                        })
                    }
                }
            }) as TextClassificationPipeline

            self.postMessage({ type: 'init-done' })
            // console.log('[Sentiment Worker] Model initialized successfully')
        } catch (err: any) {
            console.error('[Sentiment Worker] Init failed:', err)
            self.postMessage({ type: 'error', error: `Sentiment Model init failed: ${err?.message ?? String(err)}` })
        }
        return
    }

    if (type === 'classify') {
        if (!classifier) {
            self.postMessage({ type: 'error', id, error: 'Sentiment Model not loaded yet.' })
            return
        }

        try {
            const output = await classifier(text)
            // Output is like [{ label: 'POSITIVE', score: 0.99... }]
            const result = (output as any)[0]

            // console.log(`[Sentiment Worker] Classified: "${text.substring(0, 30)}..." -> ${JSON.stringify(result)}`)

            self.postMessage({ type: 'classify-result', id, result })
        } catch (err: any) {
            console.error('[Sentiment Worker] Classification failed:', err)
            self.postMessage({ type: 'error', id, error: err?.message ?? String(err) })
        }
    }
})
