const mockserver = require('mockserver-node');
mockserver.start_mockserver({
                serverHost: '0.0.0.0',
                serverPort: 1080,
                verbose: true,
                systemProperties: "-Dmockserver.enableCORSForAllResponses=true"
            });



