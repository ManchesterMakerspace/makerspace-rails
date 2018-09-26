const mockserver = require('mockserver-node');
mockserver.start_mockserver({
                serverPort: 1080,
                verbose: true,
                systemProperties: "-Dmockserver.enableCORSForAllResponses=true"
            });

