import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import speech from '@google-cloud/speech';

const videoClient = new VideoIntelligenceServiceClient();
const speechClient = new speech.SpeechClient();

export async function processVideo(videoUrl) {
  const highlights = [];
  
  // Analyze video for interesting moments
  const [operation] = await videoClient.annotateVideo({
    inputUri: videoUrl,
    features: [
      'FACE_DETECTION',
      'SPEECH_TRANSCRIPTION',
      'OBJECT_TRACKING',
      'SHOT_CHANGE_DETECTION'
    ],
    videoContext: {
      speechTranscriptionConfig: {
        languageCode: 'pt-BR',
        enableAutomaticPunctuation: true,
      },
    },
  });

  const [result] = await operation.promise();

  // Process face detection results for emotional moments
  const faceAnnotations = result.annotationResults[0].faceDetectionAnnotations;
  for (const face of faceAnnotations) {
    if (face.frames.some(frame => 
      frame.attributes.some(attr => 
        (attr.name === 'joy' || attr.name === 'surprise') && 
        attr.confidence > 0.8
      )
    )) {
      highlights.push({
        timestamp: face.frames[0].timeOffset,
        type: 'emotion',
        confidence: face.frames[0].attributes[0].confidence
      });
    }
  }

  // Process speech transcription for exciting moments
  const transcription = result.annotationResults[0].speechTranscriptions;
  for (const segment of transcription) {
    const text = segment.alternatives[0].transcript.toLowerCase();
    if (
      text.includes('incrível') ||
      text.includes('nossa') ||
      text.includes('caramba') ||
      text.includes('uau')
    ) {
      highlights.push({
        timestamp: segment.startTime,
        type: 'speech',
        text: segment.alternatives[0].transcript
      });
    }
  }

  return highlights;
}