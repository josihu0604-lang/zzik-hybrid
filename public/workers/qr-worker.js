
// QR Code Processing Web Worker
// Handles image data processing off the main thread to prevent UI freezing

self.onmessage = async (e) => {
  const { imageData, width, height } = e.data;

  try {
    // In a real implementation, we would import jsQR here
    // importScripts('/jsQR.js'); 
    // const code = jsQR(imageData, width, height);
    
    // For this demo/hybrid environment, we simulate heavy processing
    // This calculation would normally freeze the UI if done on main thread
    
    // Simulate heavy image analysis (e.g. contrast adjustment, binarization)
    const start = performance.now();
    
    // Mock processing delay (cpu intensive loop)
    let sum = 0;
    for(let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }
    
    // Mock detection logic (1% chance to detect in this demo)
    // In production, this returns the actual decoded string
    const detected = Math.random() < 0.01;
    const result = detected ? { data: '123456' } : null;

    const end = performance.now();

    self.postMessage({
      type: 'result',
      code: result ? result.data : null,
      processingTime: end - start
    });

  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message
    });
  }
};
