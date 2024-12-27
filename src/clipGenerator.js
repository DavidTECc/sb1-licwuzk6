import ffmpeg from 'fluent-ffmpeg';

export async function generateClips(highlights) {
  // Sort highlights by confidence/importance
  const sortedHighlights = highlights.sort((a, b) => {
    if (a.confidence && b.confidence) {
      return b.confidence - a.confidence;
    }
    return 0;
  });

  // Generate clips for top moments
  for (let i = 0; i < Math.min(sortedHighlights.length, 5); i++) {
    const highlight = sortedHighlights[i];
    const startTime = highlight.timestamp.seconds || 0;
    
    await generateClip(
      'input.mp4',
      `clip_${i}.mp4`,
      startTime,
      30 // clip duration in seconds
    );
  }
}

function generateClip(inputFile, outputFile, startTime, duration) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .setStartTime(startTime)
      .setDuration(duration)
      // Vertical format for TikTok/Shorts/Reels
      .size('1080x1920')
      // Add some basic filters for better social media appearance
      .videoFilters([
        'crop=ih/2.4:ih:ih/2.4/2:0', // Center crop for vertical video
        'scale=1080:1920', // Scale to vertical format
      ])
      .output(outputFile)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}