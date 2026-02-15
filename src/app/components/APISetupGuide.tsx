import { motion } from 'motion/react';
import { ExternalLink, AlertCircle, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface APISetupGuideProps {
  onBack?: () => void;
}

export function APISetupGuide({ onBack }: APISetupGuideProps) {
  const setupOptions = [
    {
      title: 'Google Vision API',
      description: 'Advanced object detection and labeling',
      url: 'https://cloud.google.com/vision/docs/setup',
      features: ['Accurate detection', 'Web detection', 'Safe search']
    },
    {
      title: 'AWS Rekognition',
      description: 'Real-time image and video analysis',
      url: 'https://aws.amazon.com/rekognition/',
      features: ['Custom labels', 'Fast inference', 'Low latency']
    },
    {
      title: 'TensorFlow.js',
      description: 'Run ML models directly in browser',
      url: 'https://www.tensorflow.org/js',
      features: ['No server needed', 'Privacy focused', 'Fast']
    },
    {
      title: 'Custom ML Backend',
      description: 'Build your own detection service',
      url: 'https://docs.developer.ai/',
      features: ['Full control', 'Custom models', 'Scalable']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <AlertCircle className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold text-white">API Configuration Required</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-white/90 text-lg mb-8"
      >
        The camera is working! Now you need to set up an image recognition API to identify objects.
      </motion.p>

      {/* Setup Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {setupOptions.map((option, index) => (
          <motion.a
            key={option.title}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {option.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
            </div>

            <div className="flex flex-wrap gap-2">
              {option.features.map(feature => (
                <span key={feature} className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      {/* Integration Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Quick Integration
        </h2>

        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Choose a Service</h3>
            <p>Select one of the options above based on your needs and budget.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">2. Get API Credentials</h3>
            <p>Sign up and generate API keys from your chosen service.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">3. Update Recognition Service</h3>
            <p>Edit <code className="bg-gray-200 px-2 py-1 rounded">src/app/services/recognitionService.ts</code> with your API integration.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">4. Add to Discovery Data</h3>
            <p>Update your <code className="bg-gray-200 px-2 py-1 rounded">Discovery</code> type to include real object data from the API response.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">5. Test Camera Capture</h3>
            <p>Point at an object and tap capture. The app will analyze the image using your API!</p>
          </div>
        </div>
      </motion.div>

      {/* Code Example */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-900 text-gray-100 rounded-2xl p-6 overflow-x-auto mb-8 font-mono text-sm"
      >
        <pre>{`// Example: Update recognitionService.ts

export async function recognizeImage(imageDataUrl: string) {
  const base64Image = imageDataUrl.split(',')[1];
  
  const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.REACT_APP_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: base64Image,
      features: ['label', 'web', 'safe-search']
    })
  });

  const result = await response.json();
  
  // Transform API response to Discovery object
  return {
    success: true,
    discovery: {
      id: generateId(),
      name: result.labels[0].description,
      // ... map other fields
    }
  };
}`}</pre>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1 bg-white text-blue-600 hover:bg-gray-100 font-bold h-14"
        >
          Back to Camera
        </Button>
        <a
          href="https://github.com/builder-io/pocketed-science/blob/main/docs/API_SETUP.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold h-14"
          >
            Full Setup Docs →
          </Button>
        </a>
      </div>
    </div>
  );
}
