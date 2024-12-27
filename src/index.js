import youtubedl from 'youtube-dl-exec';
import fetch from 'node-fetch';
import speech from '@google-cloud/speech';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import dotenv from 'dotenv';
import { processVideo } from './videoProcessor.js';
import { generateClips } from './clipGenerator.js';

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function analyzeStream(url) {
  try {
    console.log('Downloading stream...');
    const videoInfo = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    console.log('Analyzing content...');
    const highlights = await processVideo(videoInfo.url);
    
    console.log('Generating clips...');
    await generateClips(highlights);
    
    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error processing stream:', error);
  }
}

// Example usage
const streamUrl = process.argv[2];
if (!streamUrl) {
  console.log('Please provide a stream URL as an argument');
  process.exit(1);
}

analyzeStream(streamUrl);