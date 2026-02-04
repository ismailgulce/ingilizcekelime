'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

/* ---------- Schema ---------- */

const TextToSpeechInputSchema = z.object({
  text: z.string().min(1),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  media: z.string(), // data:audio/wav;base64,...
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

/* ---------- PCM → WAV ---------- */

async function pcmToWav(
  pcm: Buffer,
  channels = 1,
  sampleRate = 24000,
  bitDepth = 16
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate,
      bitDepth,
    });

    const chunks: Buffer[] = [];

    writer.on('data', (c) => chunks.push(c));
    writer.on('end', () =>
      resolve(Buffer.concat(chunks).toString('base64'))
    );
    writer.on('error', reject);

    writer.write(pcm);
    writer.end();
  });
}

/* ---------- Flow ---------- */

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
    });

    const media = Array.isArray(result.media)
      ? result.media[0]
      : result.media;

    if (!media?.data) {
      throw new Error('No audio data returned from Gemini TTS');
    }

    const pcmBuffer = Buffer.from(media.data, 'base64');
    const wavBase64 = await pcmToWav(pcmBuffer);

    return {
      media: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

/* -------------------- EXPORT FUNC -------------------- */
export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}
